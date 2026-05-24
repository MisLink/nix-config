# Goal Extension Implementation Plan

## Context

给 `@agentry/` 添加 goal 插件，让 agent 能自主循环工作直到目标完成。以 mitsuhiko 的 goal.ts 为基础，参考 narumiruna 和 tungthedev 的改进，适配 agentry 项目的模块化风格。

**核心需求：** 用户通过 `/goal <objective>` 设置目标后，agent 自动循环推进，直到完成或耗尽预算。

## 文件结构

```
extensions/goal/
├── types.ts        # 类型定义
├── state.ts        # 纯函数状态管理
├── prompts.ts      # prompt 模板
├── commands.ts     # /goal 命令处理
├── tools.ts        # create_goal / update_goal
├── index.ts        # 主入口，事件绑定
└── index.test.ts   # 测试
```

## 实现步骤

### Step 1: types.ts — 类型定义

```ts
export type GoalStatus = "active" | "paused" | "budgetLimited" | "complete";

export interface GoalUsage {
  tokensUsed: number;
  activeSeconds: number;
}

export interface ThreadGoal {
  goalId: string;
  objective: string;
  status: GoalStatus;
  tokenBudget: number | null;
  usage: GoalUsage;
  baselineTokens: number;  // token 统计起点，用于差值计算
  createdAt: number;
  updatedAt: number;
}

export type GoalEntrySource = "command" | "tool" | "runtime";

export interface GoalCustomEntry {
  version: 1;
  kind: "set" | "clear";
  source: GoalEntrySource;
  goal: ThreadGoal | null;
  clearedGoalId?: string;
  at: number;
}

export interface GoalResult {
  ok: boolean;
  message: string;
  goal: ThreadGoal | null;
}
```

关键设计：
- `baselineTokens` — 记录创建 goal 时的总 token 数，`tokensUsed = currentTotal - baselineTokens`
- `GoalEntrySource` — 区分操作来源（命令/工具/运行时），便于调试

### Step 2: state.ts — 纯函数状态管理

纯函数，无副作用，便于测试：

- `createGoal(objective, tokenBudget?, currentTokens)` — 创建新 goal
- `applyUsage(goal, tokenDelta, timeDelta)` — 更新用量
- `updateGoalStatus(goal, status)` — 状态转换
- `updateGoalBudget(goal, budget)` — 修改预算
- `reconstructGoal(entries)` — 从 session 历史重建状态
- `validateObjective(text)` — 校验目标文本（≤4000 字符）

Token 统计方式（参考 narumiruna）：
```ts
// 创建时记录 baseline
goal.baselineTokens = currentSessionTokenTotal;

// 更新时计算差值
goal.usage.tokensUsed = currentSessionTokenTotal - goal.baselineTokens;
```

### Step 3: prompts.ts — Prompt 模板

需要三类 prompt：

**1. System prompt 注入（before_agent_start）**
```
Active thread goal:
<untrusted_objective>{objective}</untrusted_objective>

Goal status: active
Tokens used: {used} / {budget}
Tokens remaining: {remaining}

If the goal is achieved, call update_goal with status "complete".
```

**2. Continuation prompt（agent_end 后自动发送）**
```
Continue working toward the active thread goal.

<untrusted_objective>{objective}</untrusted_objective>

Budget:
- Time spent: {seconds}s
- Tokens used: {used}
- Tokens remaining: {remaining}

Avoid repeating work already done. Choose the next concrete action.

Before deciding the goal is achieved, perform a completion audit:
- Restate objective as concrete deliverables
- Map every requirement to evidence from files, tests, output
- Verify manifests/test suites cover all requirements
- Treat uncertainty as not achieved

Call update_goal with status "complete" only when audit confirms achievement.
```

**3. Continuation 标记**
```xml
<!-- goal-continuation:{goalId}:{iteration} -->
```
每条 continuation 消息带唯一标记，用于去重和 stale 检测。

### Step 4: tools.ts — Agent 工具

只注册两个工具：

**create_goal**
```ts
parameters: {
  objective: string,           // 必填
  token_budget?: number        // 可选
}
// 只在用户显式要求时调用
// 如果已有 goal，报错
```

**update_goal**
```ts
parameters: {
  status: "complete",          // 只接受 complete
  summary: string              // 必填，描述完成了什么
}
// agent 完成目标后调用
// summary 记入 session 日志
```

### Step 5: commands.ts — /goal 命令

```
/goal                        显示当前 goal 状态
/goal <objective>            设置新 goal（已有则确认替换）
/goal pause                  暂停自动续作
/goal resume                 恢复
/goal resume --budget N      恢复并设新预算
/goal edit <objective>       修改目标文本（不重置计数器）
/goal clear                  清除 goal
/goal budget N               修改预算（0 = 清除预算）
```

命令解析参考 narumiruna 的 tokenize 方式，支持引号。

### Step 6: index.ts — 主入口和事件绑定

监听的事件：

```ts
pi.on("session_start", ...)    // 从 session 历史重建 goal
pi.on("session_tree", ...)     // 分支切换时重建
pi.on("before_agent_start", ...) // 注入 system prompt
pi.on("agent_end", ...)        // 统计 token/time，检查预算，发 continuation
pi.on("context", ...)          // 过滤 stale continuation 消息
pi.on("session_compact", ...)  // 压缩前结算用量
```

核心流程（agent_end）：
```
1. 统计本轮 token 用量 → 累加到 goal.usage
2. 统计经过时间 → 累加到 goal.usage.activeSeconds
3. 检查是否超预算 → 是则状态变 budgetLimited
4. 如果 goal 还是 active → 发 continuation 消息
```

### Step 7: 中断安全

在 agent_end 中检测 stopReason：
```ts
const finalAssistant = findFinalAssistantMessage(event.messages);
if (finalAssistant?.stopReason === "aborted" || finalAssistant?.stopReason === "error") {
  // 自动 pause，不发 continuation
  setGoalStatus(goal, "paused");
  ctx.ui.notify("Goal paused due to interruption. Use /goal resume to continue.", "warning");
  return;
}
```

### Step 8: Continuation 去重

**标记机制：**
- 每条 continuation 消息开头带 `<!-- goal-continuation:{goalId}:{iteration} -->`
- 维护 `continuationQueuedFor: string | null` 追踪当前队列中的 goalId

**Stale 检测（context 事件）：**
- 遍历 messages，找到带 goal-continuation 标记的消息
- 解析 goalId，和当前 goal 比对
- 如果不匹配（goal 已 pause/clear/替换），重写消息内容为"已过期"提示

**去重：**
- `agent_end` 发 continuation 前检查 `continuationQueuedFor === goal.goalId`
- 发送后设置 `continuationQueuedFor = goal.goalId`

### Step 9: UI 状态

只用 `setStatus`，不用 `setWidget`：

```ts
function updateStatus(ctx: ExtensionContext, goal: ThreadGoal | null): void {
  if (!goal) {
    ctx.ui.setStatus("goal", undefined);
    return;
  }
  const theme = ctx.ui.theme;
  switch (goal.status) {
    case "active":
      const budget = goal.tokenBudget
        ? ` (${formatTokens(goal.usage.tokensUsed)}/${formatTokens(goal.tokenBudget)})`
        : ` (${formatDuration(goal.usage.activeSeconds)})`;
      ctx.ui.setStatus("goal", theme.fg("accent", `🎯 active${budget}`));
      break;
    case "paused":
      ctx.ui.setStatus("goal", theme.fg("warning", "🎯 paused"));
      break;
    case "budgetLimited":
      ctx.ui.setStatus("goal", theme.fg("warning", `🎯 budget ${formatTokens(goal.usage.tokensUsed)}/${formatTokens(goal.tokenBudget!)}`));
      break;
    case "complete":
      ctx.ui.setStatus("goal", theme.fg("success", "🎯 complete"));
      // 8 秒后自动消失
      setTimeout(() => ctx.ui.setStatus("goal", undefined), 8_000);
      break;
  }
}
```

## 复用的现有代码

- **类型系统：** 参考 `static-check/types.ts` 的接口设计风格
- **状态管理：** 参考 `static-check/state.ts` 的 class + Map 模式，但 goal 更简单，用单个对象即可
- **命令解析：** 参考 `plan-tracker/logic.ts` 的 `parsePlanCommand` 方式
- **Context 过滤：** 参考 `plan-tracker/index.ts` 的 `filterPlanTrackerContextMessages` 模式
- **Session 恢复：** 参考 `plan-tracker/index.ts` 的 `session_start` + `getEntries` 模式

## 验证方式

1. **手动测试：**
   - `/goal 实现一个 TODO 应用` → 设置 goal，agent 开始循环工作
   - `/goal pause` → 暂停，agent 停止自动续作
   - `/goal resume` → 恢复，agent 继续
   - `/goal edit 修复登录 bug` → 修改目标，不重置计数器
   - `/goal clear` → 清除 goal

2. **中断测试：**
   - 设置 goal 后 Ctrl+C → 应自动 pause
   - `/goal resume` → 应继续

3. **预算测试：**
   - `/goal --tokens 1000 <objective>` → 超预算后应自动 budgetLimited
   - `/goal resume --budget 2000` → 恢复并设新预算

4. **单元测试：**
   - `state.ts` 的纯函数：createGoal, applyUsage, updateGoalStatus
   - `prompts.ts` 的标记解析：continuationGoalIdFromPrompt

## 文件清单

- [ ] `extensions/goal/types.ts`
- [ ] `extensions/goal/state.ts`
- [ ] `extensions/goal/prompts.ts`
- [ ] `extensions/goal/commands.ts`
- [ ] `extensions/goal/tools.ts`
- [ ] `extensions/goal/index.ts`
- [ ] `extensions/goal/index.test.ts`
- [ ] 更新 `package.json` 的 pi.extensions
