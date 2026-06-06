---
name: workflow-init
description: 初始化当前组合式 workflow：CONTEXT.md、docs/adr/、docs/issues/ 和 AGENTS.md 中的本地 issue/BDD/review 协议。Use when the user wants to set up this local agentic workflow, initialize issue-based workflow docs, create local issue tracker files, configure ADRs, or install the workflow memory protocol in a project.
---

# Workflow Init

为当前项目初始化这套组合式 agentic workflow。它会建立稳定上下文、ADR 索引与模板、本地 issue tracker，以及 `AGENTS.md` 中的工作协议，让 `issue-capture`、`issue-grill`、`issue-review`、`issue-split`、`issue-plan`、`issue-tasks`、`bdd-implement` 可以围绕同一套本地文档协作。

开始前先阅读 `../ISSUE_PROTOCOL.md`。

## 默认产物

```text
AGENTS.md                         # 合并 workflow 协议；如果已存在则追加小节
CONTEXT.md                        # 当前稳定上下文；如果已存在则合并/补充

docs/adr/
├── README.md                     # ADR 索引
└── template.md                   # ADR 模板

docs/issues/
├── README.md                     # 本地 issue tracker 说明
└── template.md                   # issue 文件模板
```

## 工作流程

### 1. 检查仓库现状

写文件前先检查：

- 当前目录是否是用户想初始化的项目根目录。
- 是否已有 `AGENTS.md`、`CONTEXT.md`、`docs/adr/`、`docs/issues/`。
- 是否已有 README、package、flake、Cargo、Go 等项目元信息，可用于填充 `CONTEXT.md` 初稿。

如果初始化位置或合并策略不确定，先问用户。已有文件应保留并谨慎合并。

### 2. 初始化或合并 `CONTEXT.md`

`CONTEXT.md` 保存当前稳定上下文，不是日志，也不是 spec。

推荐结构：

```markdown
# 项目上下文

## 项目意图
<!-- 项目存在的目的；1-5 条要点 -->

## 领域语言
<!-- 高频术语。只记录能减少未来解释成本的词。 -->

## 架构说明
<!-- 当前仍然有效的架构约定。细节较多时链接到 ADR。 -->

## Agent 工作偏好
- 日常工作记录在 `docs/issues/` 下的本地 issue 文件中，包括需求、行为、方案、任务、审查、验证和收尾。
- 偏好先通过对话澄清需求，再把稳定结论沉淀到 issue。
- issue 中使用 BDD 风格的行为规格约束测试和实现。
- review 先独立 audit，再只对真正需要判断的歧义或取舍进行 grill。
- ADR 放在 `docs/adr/`，用于记录跨 issue 的长期决策。
```

已有 `CONTEXT.md` 时，保留原内容，只追加缺失小节或补充明显有用的项目事实。

### 3. 初始化 `docs/issues/`

创建 `docs/issues/README.md`：

```markdown
# 本地 Issues

本目录是本地 issue tracker。每个 issue 使用一个 Markdown 文件，文件名格式为 `0001-kebab-case-title.md`。

Issue ID 使用数字编号，至少 4 位补零：`0001`、`0002`、`9999`、`10000`。创建新 issue 时扫描 `docs/issues/[0-9]*-*.md`，解析文件名前缀为数字，取最大值 + 1，再用 `padStart(4, "0")` 格式化。

多个 issue 可以并行存在；操作时优先显式指定 issue ID。

## 状态

- `discovery`: 需求仍在讨论/澄清
- `ready`: requirements/plan/tasks 足够清楚，可以实现
- `in_progress`: 正在实现
- `review`: 实现完成，等待审查或收尾
- `blocked`: 被问题阻塞
- `cancelled`: 已取消
- `done`: 已验证完成

## Workflow skills

- `issue-capture`: 将讨论蒸馏成 issue
- `issue-grill`: 一问一答澄清需求
- `issue-review`: 阶段审查，先 audit 再 grill
- `issue-split`: 拆分过大的 issue
- `issue-plan`: 生成/更新方案
- `issue-tasks`: 生成/更新任务
- `bdd-implement`: 按 behavior 测试优先开发
```

创建 `docs/issues/template.md`，内容使用 `../ISSUE_PROTOCOL.md` 中的中文 issue 模板。模板应包含：

- frontmatter 状态和 review 字段
- `讨论摘要`
- `需求摘要`
- `行为规格（Behavior specs）`
- `拆分`
- `方案`
- `任务`
- `行为测试映射`
- `审查记录`
- `验证`
- `收尾`

### 4. 初始化 `docs/adr/`

ADR 使用一文件一个决策。编号格式：`NNNN-kebab-case-title.md`。

创建 `docs/adr/README.md`：

```markdown
# ADR 索引

本目录记录 Architecture Decision Records。ADR 用于记录跨 issue、长期有效、存在真实取舍的决策。

| ADR | 状态 | 日期 | 决策 | 备注 |
| --- | --- | --- | --- | --- |
```

创建 `docs/adr/template.md`：

```markdown
# ADR NNNN: 标题

- Status: Proposed
- Date: YYYY-MM-DD

## 背景

是什么约束、反复出现的问题或上下文促成了这个决策？

## 决策

我们选择什么？

## 后果

什么会变简单？什么会变困难？哪些代价是有意接受的？

## 备选方案

- 方案 A：为什么不选
- 方案 B：为什么不选

## 复审说明

什么情况下应该重新审视这个决策？
```

初始化时只创建索引和模板。具体 ADR 应在出现真实长期决策时，由 `issue-grill`、`issue-plan` 或 `issue-review` 提议并经用户确认后创建。

### 5. 初始化或合并 `AGENTS.md`

加入 `Agent workflow protocol` 小节。已有 `AGENTS.md` 时保留原规则，只追加或合并这一节。

推荐内容：

```markdown
## Agent workflow protocol

任务开始时：

1. 如果存在 `CONTEXT.md`，先读取它。
2. 当任务提到 issue ID 或已追踪功能时，读取 `docs/issues/` 下相关 issue。
3. 如果存在 `docs/adr/README.md`，先浏览 ADR 索引；涉及架构、workflow、命名、测试策略、数据模型或长期约定时读取相关 ADR。
4. 优先使用显式 issue ID。用户没有指定 issue 且存在多个候选时，先询问。

需求阶段：

- 当意图、范围、术语或行为不清楚时，用 `issue-grill` 风格逐条追问。
- 将稳定结论沉淀到 `docs/issues/0001-title.md` 这类本地 issue 文件中。
- Issue 模板使用中文小节标题；status、review stage、behavior ID、task ID 等稳定术语可以保留英文。
- 行为规格使用 BDD 风格，并使用 `B01` 这样的稳定 ID。

方案与任务阶段：

- 即使 Issue、Plan、Tasks 位于同一个 issue 文件，也要保持概念区分。
- `方案` 记录实现方式、取舍、影响范围、测试策略和 ADR 候选。
- `任务` 记录可执行步骤、依赖、覆盖的 behavior 和验证方式。

实现阶段：

- 优先通过公共接口编写 BDD 风格行为测试。
- 一次处理一个 behavior：RED → GREEN → REFACTOR。
- 更新行为测试映射和验证证据。

Review 阶段：

- Review 始终先 audit，再只对真正的歧义或取舍进行 grill。
- 明确缺陷直接指出。
- 有价值的 review 摘要写回 issue 的 `审查记录` 区块。

记忆更新：

- `CONTEXT.md` 只记录稳定项目上下文或术语。
- ADR 只记录有真实取舍、跨 issue、长期有效的决策。
```

### 6. 合并规则

- 保留已有文件。
- 已有文件缺小节时追加；已有相同小节时谨慎合并。
- `docs/issues/template.md` 已存在时，先向用户确认替换或合并方式。
- `docs/adr/template.md` 已存在时，先向用户确认替换或合并方式。

## 完成时的响应

最后简短汇报：

```markdown
已初始化 workflow：
- `CONTEXT.md`
- `docs/issues/README.md`
- `docs/issues/template.md`
- `docs/adr/README.md`
- `docs/adr/template.md`
- `AGENTS.md` 的 Agent workflow protocol

后续可以使用：
- `issue-grill` 澄清需求
- `issue-capture` 落地 issue
- `issue-review` 阶段审查
- `issue-plan` / `issue-tasks` 准备实现
- `bdd-implement` 做 BDD 风格测试优先开发
```
