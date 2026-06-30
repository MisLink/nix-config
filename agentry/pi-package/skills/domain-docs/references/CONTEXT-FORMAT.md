# CONTEXT.md 格式

`CONTEXT.md` 是项目的领域词汇表和共享语言。它帮助 agent 使用项目自己的词汇，而不是临时发明同义词。

它不是设计文档、实现说明、任务清单，也不是 ADR。

## 什么时候创建或更新

只在领域术语真的被澄清后，才懒创建 `CONTEXT.md`。

以下情况应 inline 更新：

- 用户澄清了一个模糊或多义术语；
- 两个术语容易混淆，并且已经明确区分；
- 项目确定了 canonical term（统一叫法）和应避免的同义词；
- 某个领域关系被澄清。

不要为普通实现细节创建或更新 `CONTEXT.md`。

## 应该写什么

应该包含：

- 项目特有的领域概念；
- 统一叫法和明确避免的同义词；
- 相似概念之间的区别；
- 领域关系与不变量；
- 能避免未来误解的简短例子。

不要包含：

- Controller / Service / Repository 等实现结构；
- 架构决策或技术选型 —— 这些写 ADR；
- spec、任务计划、roadmap、TODO；
- 调试记录；
- 临时实现细节；
- 大段系统设计说明。

## 推荐格式

```markdown
# Context

## Glossary

### Order
用户提交并等待履约的购买意图。不要用 “purchase” 指代同一概念。

### Invoice
财务确认后的付款凭证。Invoice 不是 Order；一个 Order 可能对应多个 Invoice。
```

较大的项目可以按需增加轻量章节：

```markdown
# Context

## Glossary

## Avoided Terms

## Domain Relationships
```

每条尽量短。好的 glossary entry 应该让未来的代码、测试和 issue 使用更准确的名字。

## 讨论中的行为

用户使用模糊词时，主动澄清：

> 你说的 “account” 是 Customer 还是 User？在这个项目里它们是两个不同概念。

用户说法和 glossary 冲突时，指出冲突：

> CONTEXT.md 把 “cancellation” 定义为整单取消，但你这里听起来像是移除单个 line item。你想表达哪一个？

术语一旦确定，立即更新 `CONTEXT.md`，不要攒到最后。

## 多上下文仓库

如果存在 `CONTEXT-MAP.md`，先用它判断当前任务属于哪个上下文，再读取或更新该上下文的 `CONTEXT.md`。

示例结构：

```text
/
├── CONTEXT-MAP.md
├── CONTEXT.md                       # 可选：只放跨上下文共享术语
└── src/
    ├── ordering/CONTEXT.md
    └── billing/CONTEXT.md
```

推荐 `CONTEXT-MAP.md` 格式：

```markdown
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — 接收并跟踪客户订单
- [Billing](./src/billing/CONTEXT.md) — 生成发票并处理付款
- [Fulfillment](./src/fulfillment/CONTEXT.md) — 管理仓库拣货与发货

## Relationships

- **Ordering → Fulfillment**：Ordering 发出 `OrderPlaced` 事件；Fulfillment 消费它并开始拣货
- **Fulfillment → Billing**：Fulfillment 发出 `ShipmentDispatched` 事件；Billing 消费它并生成发票
- **Ordering ↔ Billing**：共享 `CustomerId` 和 `Money` 类型
```

`Contexts` 中的链接指向各上下文的 `CONTEXT.md`。上下文 ADR 目录按约定从 `CONTEXT.md` 位置推导：例如 `src/ordering/CONTEXT.md` 对应 `src/ordering/docs/adr/`。

只更新当前讨论相关的上下文。根级 `CONTEXT.md` 只放跨上下文共享概念，不要把所有上下文术语都塞进去。
