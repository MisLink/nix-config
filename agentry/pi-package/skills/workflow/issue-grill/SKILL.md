---
name: issue-grill
description: 通过一问一答澄清本地 issue 或新想法的需求、术语、边界和行为。Use when requirements are fuzzy, behavior specs are incomplete, scope is unclear, or the user wants a grill-me/grill-with-docs style clarification session grounded in CONTEXT.md, ADRs, and code.
---

# Issue Grill

通过 grill 的方式推进理解：一次只问一个问题，每题给推荐答案和理由。目标是让需求、术语、边界和 behavior specs 变清楚，而不是写 plan 或代码。

开始前先阅读 `../ISSUE_PROTOCOL.md`。

## 适用场景

- 用户只有模糊想法。
- issue 的 `需求摘要` 不完整。
- `开放问题` 较多。
- behavior specs 不可测试或边界不清。
- 术语可能和 `CONTEXT.md` / ADR / 代码现实冲突。

## 流程

1. 定位输入：
   - 如果用户给出 issue ID，读取对应 issue。
   - 如果用户给出新想法，基于当前对话 grill；必要时建议之后用 `issue-capture` 落地。
2. 读取上下文：
   - `CONTEXT.md`
   - `docs/adr/` 中相关 ADR
   - 必要时探索代码验证用户描述是否符合现实
3. 逐条追问：
   - 每次只问一个问题。
   - 每题必须包含推荐答案和理由。
   - 能通过代码探索回答的问题，优先自己探索，不要问用户。
4. 对已确认内容及时更新 issue：
   - `讨论摘要`
   - `需求摘要`
   - `行为规格（Behavior specs）`
   - `不做范围`
   - `开放问题`
5. 如果出现长期决策，先标记为 `ADR candidate`，不要随意创建 ADR；按协议判断。

## 问题模板

```markdown
**问题**：...

**推荐答案**：...

**为什么**：...

**如果选其他方向**：...
```

## 停止条件

- 当前阶段没有阻塞性 open questions。
- 用户要求暂停。
- 发现需要先做代码探索或原型验证。

完成时说明：已确认内容、仍未确认内容、建议下一步。
