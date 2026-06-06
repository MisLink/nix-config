---
name: issue-capture
description: 将当前讨论蒸馏为本地 issue，或更新已有 issue 的需求摘要、讨论摘要、行为规格。Use when the user wants to capture requirements, summarize a discussion into an issue, create a local issue, or convert clarified conversation into durable project documentation.
---

# Issue Capture

把当前对话中已经明确的内容整理为本地 issue。这个 skill 类似 `to-prd` 的 capture/formulation 阶段：**不继续采访用户，只总结已知内容**。如果信息不足，把缺口写入 `Open questions`。

开始前先阅读 `../ISSUE_PROTOCOL.md`。

## 适用场景

- 用户说“把当前讨论整理成 issue”。
- 用户想创建本地 issue 记录，但需求是从对话中逐步形成的。
- 已经经过 `issue-grill`，需要把结论落地。
- 需要更新已有 issue 的 `需求摘要` 或 `行为规格（Behavior specs）`。

## 流程

1. 定位目标：
   - 如果用户给出 issue ID，读取并更新对应 `docs/issues/0001-*.md`。
   - 如果没有 issue ID，创建新 issue：扫描 `docs/issues/[0-9]*-*.md`，解析数字前缀，使用最大编号 + 1，并至少 4 位补零。
2. 读取项目上下文：
   - `CONTEXT.md`（如存在）
   - `docs/adr/README.md` 和相关 ADR（如存在）
3. 从当前对话提炼：
   - confirmed facts
   - open questions
   - rejected ideas
   - problem
   - desired behavior
   - rules
   - BDD-style behavior specs
   - non-goals
4. 写入或更新 issue 文件。
5. 不生成 plan、tasks 或代码。

## 输出要求

- 新 issue 状态默认为 `discovery`。
- Behavior 使用稳定 ID：`B01`、`B02`。
- 如果某个 behavior 还不够可测试，把它写入 `开放问题`，不要假装已经明确。
- 如果一个需求明显过大，只在 issue 的 `拆分` 区块标记“可能需要拆分”，不要直接创建 child issues；拆分交给 `issue-split`。

## 完成时

简短说明：

- 创建/更新了哪个 issue 文件。
- 提炼了哪些 behavior。
- 还有哪些 open questions。
- 建议下一步：`issue-grill`、`issue-review requirements`、`issue-split` 或 `issue-plan`。
