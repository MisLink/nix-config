---
name: issue-split
description: 将过大的本地 issue 拆成多个垂直切片 child issues，并更新父 issue 的 children/拆分 区块。Use when an issue has too many behaviors, needs multiple implementation rounds, should be broken into independently verifiable issues, or resembles a PRD/umbrella issue.
---

# Issue Split

把一个过大的 issue 拆成多个 child issues。不要引入单独 Epic/PRD 概念；父 issue 仍然是 issue，只是承担 umbrella/tracking 角色。

开始前先阅读 `../ISSUE_PROTOCOL.md`。

## 适用场景

- 一个 issue 超过 3-5 个 behavior specs。
- issue 覆盖多个可独立交付的能力。
- 需要多轮实现或多个 PR/agent 会话。
- 某些 behavior 有明显依赖关系。
- `issue-review requirements` 或 `issue-review plan` 认为范围过大。

## 拆分原则

1. 优先垂直切片：每个 child issue 都应能独立验证一个端到端行为或能力。
2. 不按技术层水平拆分，例如“只改数据层”“只改 UI”。
3. 每个 child issue 应包含自己的 `需求摘要` 和 `行为规格（Behavior specs）`。
4. 父 issue 保留整体目标、拆分关系和跨 child 的约束。
5. 拆分前先向用户展示方案并等待确认，不要直接写文件。

## 流程

1. 读取父 issue。
2. 分析 `行为规格（Behavior specs）`、`规则`、`不做范围`、`开放问题`。
3. 提出 child issue 拆分草案：
   - 标题
   - 范围
   - 覆盖 behaviors
   - 依赖关系
   - 是否能独立验证
4. 询问用户是否同意粒度和依赖。
5. 用户确认后创建 child issue 文件，使用新的数字 ID，至少 4 位补零。
6. 更新父 issue：
   - frontmatter `children`
   - `拆分` 表格
   - 必要时把父 issue 状态调整为 `ready`、`review` 或保持 `discovery`

## 输出

完成时列出：

- 创建的 child issue 文件。
- 每个 child 覆盖的 behavior。
- 父 issue 更新内容。
- 建议下一步：review child requirements 或对某个 child 进入 plan。
