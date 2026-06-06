# Workflow Skills

这组 skill 提供一套本地、组合式的 agentic 工作流。它不是一个大而全的强制流程，而是一组可以随时调用的小能力：需求澄清、需求总结、需求拆分、方案设计、任务拆解、BDD 开发和阶段 Review。

核心约定：所有日常工作都围绕本地 issue 文件展开。

```text
docs/issues/
├── 0001-add-theme-switching.md
├── 0002-fix-cache-fallback.md
└── 0003-improve-agent-memory.md
```

ADR 只记录跨 issue、长期有效、存在真实取舍的决策，仍放在 `docs/adr/`。

## 共享文档协议

所有 workflow skill 都应遵守 [ISSUE_PROTOCOL.md](ISSUE_PROTOCOL.md)。

核心概念：

- **Issue**：要解决什么问题，以及系统应该表现出什么行为。
- **Behavior specs**：用 BDD 风格描述可测试行为，是需求和测试之间的桥。
- **Plan / 方案**：打算怎么解决，包含方案、取舍、测试 seam、ADR 候选。
- **Tasks / 任务**：具体执行步骤，每步都应可验证，并尽量引用 behavior ID。
- **Review**：先 audit，再把需要用户判断的发现转成 one-at-a-time grill 问题。

## Skills

| Skill | 作用 | 典型使用时机 |
| --- | --- | --- |
| `workflow-init` | 初始化 `CONTEXT.md`、`docs/adr/`、`docs/issues/` 和 `AGENTS.md` workflow 协议 | 项目第一次采用这套 workflow 时 |
| `issue-capture` | 把当前讨论蒸馏成本地 issue，或更新已有 issue 的需求摘要 | 讨论已有足够上下文，需要落地成记录 |
| `issue-grill` | 逐条追问澄清需求、术语、边界和行为 | 想法模糊、behavior 不完整、open questions 较多 |
| `issue-review` | 对 requirements / plan / tasks / tests / code / closeout / ADR 做阶段审查 | 任一阶段产物写好后，进入下一步前 |
| `issue-split` | 把过大的 issue 拆成多个垂直切片 child issues | 一个 issue 覆盖过多 behavior 或需要多轮实现 |
| `issue-plan` | 基于需求和 behavior 生成/更新方案 | 需求基本清楚，准备考虑实现路径 |
| `issue-tasks` | 基于 plan 和 behavior 生成/更新可验证任务清单 | 方案确认后，准备执行 |
| `bdd-implement` | 按 behavior 做 BDD 风格测试优先开发 | 要开始写测试和代码时 |

## 组合方式

### 初始化项目

```text
workflow-init     # 初始化 CONTEXT.md、docs/adr/、docs/issues/ 和 AGENTS.md 协议
```

### 从模糊想法到本地 issue

```text
issue-grill       # 一问一答澄清想法
issue-capture     # 把讨论总结成 docs/issues/0001-title.md
issue-review      # review requirements
```

### 从需求到可执行任务

```text
issue-plan        # 生成“方案”区块
issue-review      # review plan
issue-tasks       # 生成“任务”区块
issue-review      # review tasks
```

### BDD 开发

```text
bdd-implement     # 选择一个 behavior，红→绿→重构
issue-review      # review tests 或 code
```

### 大需求拆分

```text
issue-review      # 先确认当前 issue 是否过大
issue-split       # 拆成 child issues
issue-review      # review split 后的 child requirements
```

## 设计原则

1. **组合式而非强制流水线**：可以在任何时候调用 grill、review、split、plan、tasks 或 implement。
2. **本地文档是长期记录**：skill 的输出应更新 `docs/issues/`、`CONTEXT.md` 或 `docs/adr/`，不要只停留在聊天里。
3. **Behavior 是核心**：代码实现必须能追溯到 issue 中的 behavior specs。
4. **Review 默认 audit first, then grill**：先独立审查，再逐条询问真正需要用户判断的问题。
5. **ADR 要克制**：普通 issue 的方案和任务不进入 ADR；只有长期、难逆转、有真实取舍的决策才进入 ADR。
