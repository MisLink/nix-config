---
name: issue-tasks
description: 根据本地 issue 的方案和行为规格生成或更新可执行、可验证的任务区块。Use when an implementation plan is ready and the user wants a checklist, vertical slices, task dependencies, or verification steps before coding.
---

# Issue Tasks

`issue-tasks` 负责回答“下一步一步做什么”。它把 `方案` 转成可执行、可验证的 checklist，写入 issue 的 `任务` 区块；不重新设计方案，也不写代码。

开始前先阅读 `../ISSUE_PROTOCOL.md`。

## 适用场景

- `方案` 已经写好或足够清楚。
- 需要把工作拆成小任务。
- 需要每个任务关联 behavior、依赖和验证方式。
- 准备进入 BDD/TDD 实现。

## 拆解原则

1. 优先垂直切片：每个任务尽量覆盖一个可观察 behavior 的测试和实现路径。
2. 每个任务必须有验证方式。
3. 任务应引用 behavior ID，例如 `Covers: B01`。
4. 不按文件、层级或字段机械切分。
5. 如果任务粒度过大，拆分；如果任务无法独立验证，重写。
6. 如果发现 plan 缺关键方案，不要硬拆 tasks，回到 `issue-plan`。

## 任务格式

```markdown
- [ ] T01: Add failing behavior test for B01
  - Covers: B01
  - Depends on: none
  - Verify: test fails before implementation

- [ ] T02: Implement behavior for B01
  - Covers: B01
  - Depends on: T01
  - Verify: B01 test passes
```

## 流程

1. 读取 issue 的 `需求摘要`、`行为规格（Behavior specs）`、`方案`。
2. 检查 `方案` 是否足够支撑任务拆分。
3. 生成或更新 `任务` 区块。
4. 确保每个 behavior 至少被一个测试/实现任务覆盖，或明确说明为什么暂不覆盖。
5. 不写测试，不写代码。

## 完成时

说明：

- 生成/更新了哪些 task。
- 每个 behavior 的覆盖情况。
- 是否存在依赖或阻塞。
- 建议下一步：`issue-review tasks` 或 `bdd-implement`。
