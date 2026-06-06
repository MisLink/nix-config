---
name: bdd-implement
description: BDD 风格测试优先开发：可基于本地 issue 的行为规格运行，也可脱离 workflow，根据用户描述的单个行为执行红→绿→重构。Use when the user wants to implement an issue, behavior, feature, or bug fix with behavior-first tests, TDD, red-green-refactor, or BDD-style tests, even when no local workflow issue exists.
---

# BDD Implement

用 BDD 风格测试优先开发一个行为。核心原则：**一次一个 behavior，先写能表达行为的测试，再最小实现，再重构**。

这个 skill 是 issue-aware，但不 issue-dependent：

- 如果输入涉及本地 issue，进入 **Workflow mode**，按 issue 的行为规格和任务执行，并更新 issue。
- 如果输入只是一个功能、bug 或行为描述，进入 **Standalone mode**，直接基于对话建立轻量 Behavior Brief，不要求先创建 issue。

## 适用场景

- 用户要求实现某个 issue 或 behavior。
- 用户说“用 BDD/TDD 做这个功能”。
- 用户要求修 bug，并希望先写回归测试。
- 用户没有本地 issue，但描述了一个可观察行为。
- 需要红→绿→重构的反馈循环。

## Mode 选择

### Workflow mode

当用户提供以下任一信息时使用：

- issue ID，例如 `0003`。
- issue 文件路径，例如 `docs/issues/0003-example.md`。
- behavior ID，例如 `B01`，且能从 issue 中定位。
- 明确要求更新 issue 的 `任务`、`行为测试映射` 或 `验证`。

Workflow mode 开始前先阅读 `../ISSUE_PROTOCOL.md`。

### Standalone mode

当用户没有提供本地 issue，或只是描述一个功能/bug/行为时使用。

Standalone mode 不创建 issue，不要求 `docs/issues/` 存在，也不更新 workflow 文档。需要持久化时，最后建议用户使用 `issue-capture`。

## Standalone Behavior Brief

没有 issue 时，先在对话中整理一个轻量 brief。信息足够时直接整理；不足时只问必要问题。

```markdown
## Behavior Brief

### Target behavior

这次要实现或修复的单个可观察行为是什么？

### Scenario

Given ...  
When ...  
Then ...

### Public seam

从哪个 public interface / CLI / API / UI / 组件边界验证？

### Verification command

用什么命令验证？

### This cycle only

这次只完成哪个 behavior？哪些留到之后？
```

如果 `Target behavior`、`Public seam` 或 `Verification command` 不清楚，先问用户或探索代码；不要盲目写低价值测试。

## Workflow mode 流程

1. 定位 issue 和 behavior：
   - 如果用户指定 `B01`，只做该 behavior。
   - 如果未指定，读取 `任务` 找下一个未完成 behavior；多个候选时询问用户。
2. 读取上下文：
   - issue 的 `需求摘要`、`行为规格（Behavior specs）`、`方案`、`任务`。
   - `CONTEXT.md`、相关 ADR、现有测试。
3. 执行 RED → GREEN → REFACTOR。
4. 更新 issue：
   - `任务` 完成状态。
   - `行为测试映射`。
   - `验证` 中记录命令和结果。
   - 必要时把状态推进到 `in_progress` 或 `review`。
5. 完成时建议 `issue-review tests` 或 `issue-review code`。

## Standalone mode 流程

1. 整理 Behavior Brief。
2. 探索现有代码和测试，找到最高合理 public seam。
3. 执行 RED → GREEN → REFACTOR。
4. 不写 workflow 文档。
5. 完成时输出：
   - Behavior Brief 摘要。
   - 新增/修改的测试。
   - 新增/修改的代码。
   - 执行过的验证命令和结果。
   - 是否建议后续用 `issue-capture` 沉淀为本地 issue。

## RED → GREEN → REFACTOR

### RED：写行为测试

- 一次只写一个 behavior 的测试。
- 测试名表达行为；有 issue 时尽量包含 behavior ID。
- 通过 public interface 或最高合理 seam 验证行为。
- 需要时用 `Given / When / Then` 注释提高可读性。
- 运行测试，确认失败原因对应目标 behavior。

### GREEN：最小实现

- 只写刚好让当前测试通过的代码。
- 不预测未来 behavior。
- 不顺手做未要求功能。
- 如果测试失败，基于失败信号修复，最多连续尝试 3 次；仍失败则停止报告。

### REFACTOR：保持行为不变的清理

- 只在 GREEN 状态下重构。
- 清理重复、命名和局部结构。
- 不引入新行为。
- 每次重构后重新运行相关测试。

## 测试质量标准

好测试：

- 描述外部可观察行为。
- 通过公共接口或最高合理 seam 运行。
- 内部重构时不应无故失败。
- 能从测试名和 Given/When/Then 看懂功能行为。

坏测试：

- 测私有函数或内部调用次数。
- 过度 mock 内部协作者。
- 只验证实现形状，不验证用户/系统行为。
- 一次写一大堆未来行为测试，脱离当前实现反馈。

## 停止条件

- 找不到正确测试 seam：记录发现，建议先做方案设计、架构改进或创建 issue，不要硬写低价值测试。
- 测试失败且三次修复仍无法通过：停止并报告失败信号。
- 当前 behavior 完成：报告验证结果；Workflow mode 下更新 issue，Standalone mode 下给出沉淀建议。
