# Issue Workflow Protocol

本协议定义 workflow skills 共享的本地 issue artifact。各 skill 通过同一份 issue 文件沉淀需求、行为、方案、任务、审查和验证证据。

## 目录

默认目录：

```text
docs/issues/
  0001-short-title.md
  0002-short-title.md
```

多个 issue 可以并行存在。用户没有指定 issue 时，先扫描候选 issue 并询问。

## Issue ID 与文件名

- ID 使用数字编号，至少 4 位补零：`0001`、`0002`、`9999`、`10000`。
- 文件名格式：`0001-kebab-case-title.md`。
- 创建新 issue 时，扫描 `docs/issues/[0-9]*-*.md`，解析文件名前缀为数字，取最大值 + 1，再用 `padStart(4, "0")` 格式化。
- 排序 issue 时按数字编号排序，不按字符串排序。
- 大 issue 拆分时，child issue 使用新编号，并在 frontmatter 中设置 `parent`。

## 状态

使用 frontmatter 表达状态：

```text
discovery   # 需求仍在讨论/澄清
ready       # requirements/plan/tasks 足够清楚，可以实现
in_progress # 正在实现
review      # 实现完成，等待审查或收尾
blocked     # 被问题阻塞
cancelled   # 已取消
done        # 已验证完成
```

## Issue 模板

模板主体使用中文；frontmatter、status、review stage、behavior ID、task ID 等稳定术语保留英文。

```markdown
---
id: 0001
title: Example title
status: discovery
type: feature
priority: medium
parent:
children: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
requirements_review: pending
plan_review: pending
tasks_review: pending
tests_review: pending
code_review: pending
related_adrs: []
---

# 0001: Example title

## 讨论摘要

### 已确认

### 开放问题

- [ ] ...

### 已拒绝想法

## 需求摘要

### 问题

### 期望行为

### 规则

- R01: ...

### 行为规格（Behavior specs）

#### B01: Example behavior

Given ...
When ...
Then ...

### 不做范围

## 拆分

| Child issue | Scope | Status |
| --- | --- | --- |

## 方案

### 实现方式

### 影响范围

### 行为到实现映射

| Behavior | Implementation approach |
| --- | --- |

### 测试策略

### 备选方案

### ADR 候选

## 任务

- [ ] T01: ...
  - Covers: B01
  - Verify: ...

## 行为测试映射

| Behavior | Test | Status |
| --- | --- | --- |

## 审查记录

## 验证

```sh
# commands run
```

## 收尾
```


## Behavior 规则

- Behavior ID 使用 `B01`、`B02`。
- 一个 behavior 描述一个可观察系统行为。
- 优先用 BDD 风格：`Given / When / Then`。
- Behavior 应能映射到测试；如果不能测试，先澄清或拆分。
- 测试名应尽量包含 behavior ID，例如：`B01: restores the saved theme when reopened`。

## Plan 与 Tasks 的区别

- **Plan / 方案** 解释“怎么做才合理”：方案、取舍、受影响区域、测试 seam、ADR 候选。
- **Tasks / 任务** 解释“下一步做什么”：可执行 checklist、依赖、验证方式。

小 issue 可以跳过显式 Plan；涉及架构边界、测试 seam、替代方案或风险时，先写 Plan。

## Review 协议

每次 review 必须说明：

- `Stage`：requirements / plan / tasks / tests / code / closeout / adr。
- `Target`：审查对象。
- `Baseline`：对照什么审查。
- `Verdict`：Approved / Approved with notes / Blocked。

所有 review 采用：**audit first, then grill if needed**。

1. 先独立对照 baseline 审查 target。
2. 将 findings 分类：
   - Direct finding：明确问题，直接指出。
   - Decision finding：需要用户判断，转成一次一个的 grill question。
   - Note：非阻塞建议。
3. 逐条询问 decision findings，每题给推荐答案和后果。
4. 最后给 verdict，并把摘要写入 issue 的 `审查记录` 区块。

## ADR 触发条件

当一个决策大体满足以下条件时，创建或建议 ADR：

1. 影响多个 issue 或未来长期约定。
2. 存在多个合理替代方案，且做了真实取舍。
3. 未来没有上下文的人/agent 会问“为什么这样”。
4. 反悔成本较高或会影响架构边界、测试策略、工具链、数据模型、接口语义。

普通 issue 内部的实现步骤、任务拆分、局部函数选择留在 `方案` / `任务` / `审查记录` 中。
