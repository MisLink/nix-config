# ADR 格式

ADR（Architecture Decision Record，架构决策记录）记录的是**为什么**做出了某个重要技术/架构决策，而不是系统现在**长什么样**。

## 存放位置与命名

ADR 存放在 `docs/adr/`。

文件名格式：

```text
NNNN.domain.slug.md
```

示例：

```text
0001.data.use-postgresql.md
0002.api.rest-over-graphql.md
0010.security.oauth2-jwt.md
```

规则：

- 编号四位、永久、连续、不复用。
- 新建 ADR 时，扫描 `docs/adr/` 里的最大编号并 +1。
- `domain` 用于检索。常见取值：`data`、`api`、`backend`、`frontend`、`security`、`infra`、`build`。不明确时用 `arch`。
- 不删除 ADR。被取代、废弃、拒绝的决策也保留为历史记录。

## 什么时候创建 ADR

只有同时满足以下三条时，才提议创建 ADR：

1. **难以逆转** —— 以后改变主意有真实成本，例如数据库、消息总线、认证方案、部署目标、模块/上下文边界、API 风格。
2. **没有背景会让人困惑** —— 未来读者会问“为什么这样做？”
3. **是真实权衡的结果** —— 当时确实存在候选方案，并因为具体理由选择了其中一个。

不要为这些事情创建 ADR：

- 小配置改动；
- 普通 bug 修复；
- 小版本依赖升级；
- 实现细节；
- 临时 workaround；
- 没有真实替代方案的显然选择。

创建时机是**决策已经形成时**，不是探索刚开始时。先澄清约束和候选方案；等用户明确选择方向后，再询问是否记录。

可这样问用户：

> 这看起来值得记录为 ADR：它难以逆转，未来读者可能会问为什么，并且来自 REST/gRPC 的真实权衡。要记录为 ADR-0003 吗？

## 模板

```markdown
---
id: ADR-0008
title: 使用 PostgreSQL 作为主数据库
date: 2026-06-30
status: accepted
# 可选：
# supersedes: ADR-0003
# superseded-by: ADR-0018
---

# ADR-0008 使用 PostgreSQL 作为主数据库

## Context（背景）
说明当时面对的问题、约束和候选方案。只写驱动决策的事实与权衡，
不要写实现结构。例如：数据高度关系化、需要强事务；候选有
PostgreSQL / MySQL / MongoDB。

## Decision（决策）
一句话给出结论：采用 PostgreSQL 作为主数据库。

## Consequences（后果）
- 正面：强事务、关系查询、JSONB、生态成熟、团队熟悉。
- 负面：schema 变更需要 migration；水平扩展需额外设计。
- 后续：需引入 migration 工具（见 ADR-0002）。

## Considered Options（候选方案，可选）
仅当被淘汰的方案值得记住、否则半年后又会有人重新提议时才写。

## References（可选）
相关 ADR、外部链接、讨论记录。
```

`Context / Decision / Consequences` 必填。可选章节只在确实增加价值时使用。

## 状态生命周期

`status` 取值：

- `proposed` —— 草案 / 讨论中。个人项目通常可以跳过，直接用 `accepted`。
- `accepted` —— 当前有效决策。开发必须遵守。
- `superseded by ADR-NNNN` —— 被后续决策取代。
- `deprecated` —— 不再适用，且没有直接替代。
- `rejected` —— 评估后明确不采用；保留它可以避免重复提议。

ADR 一旦 accepted，就是历史记录。不要为了匹配当前现实而重写正文。

## 取代旧决策

当一个 accepted 决策需要改变时：

1. 新建一条 ADR，`status: accepted`，并加 `supersedes: ADR-NNNN`。
2. 在新 ADR 的 Context 中说明为什么旧决策不再成立。
3. 只修改旧 ADR 的状态/frontmatter：
   - `status: superseded by ADR-MMMM`
   - `superseded-by: ADR-MMMM`
4. 保持旧 ADR 正文不变。
5. 如果其它 ADR 引用了旧决策，按需更新引用。

## 读取与一致性检查

较复杂的代码或设计变更前，读取相关 accepted ADR。如果请求与 accepted ADR 冲突，编辑代码前必须停止。

说明：

1. 冲突的是哪条 ADR；
2. 请求如何违反它；
3. 两条出路：
   - 调整实现以符合 ADR；
   - 先写一条 superseding ADR。
