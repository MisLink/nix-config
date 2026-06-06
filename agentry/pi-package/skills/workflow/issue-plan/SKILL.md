---
name: issue-plan
description: 基于本地 issue 的需求摘要和行为规格生成或更新方案区块。Use when requirements are clear enough to discuss implementation approach, affected areas, testing seam, alternatives, risks, or ADR candidates before writing tasks or code.
---

# Issue Plan

`issue-plan` 负责回答“怎么做才合理”，写入 issue 的 `方案` 区块；不负责拆 checklist，也不写代码。

开始前先阅读 `../ISSUE_PROTOCOL.md`。

## 适用场景

- issue 的需求和 behavior 基本清楚。
- 准备选择实现路径、测试 seam 或模块边界。
- 需要记录方案取舍、风险或 ADR 候选。
- `issue-review requirements` 已通过或用户明确要求先草拟方案。

## 方案应回答

- Approach：采用什么实现路径？
- Affected areas：会影响哪些模块、接口或文件区域？
- Behavior-to-implementation map：每个 behavior 准备用什么方式实现？
- Test strategy：从哪个 public seam 写 BDD 风格测试？
- Alternatives considered：有哪些替代方案，为什么不用？
- ADR candidates：是否存在长期、难逆转、有真实取舍的决策？
- Risks / constraints：主要风险和约束是什么？

## 流程

1. 读取目标 issue。
2. 读取 `CONTEXT.md` 和相关 ADR。
3. 必要时探索代码，确认现有架构和测试 seam。
4. 如果 requirements 仍有阻塞性 open questions，先提示用户运行 `issue-grill` 或 `issue-review requirements`。
5. 生成或更新 `方案` 区块。
6. 不生成 tasks，不写代码。

## 边界

- `方案` 可以包含文件/模块方向，但避免过早写具体代码片段。
- 局部实现选择写在 `方案`；跨 issue 长期决策才进入 ADR。
- 如果出现多个合理方案且需要用户选择，用一次一个问题 grill 用户。

## 完成时

说明：

- 更新了哪些 plan 内容。
- 覆盖了哪些 behavior。
- 是否有 ADR candidate。
- 建议下一步：`issue-review plan` 或 `issue-tasks`。
