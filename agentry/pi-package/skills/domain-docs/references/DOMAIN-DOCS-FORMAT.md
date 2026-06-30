# Domain docs 规则格式

Domain docs 是一套最小项目约定，用来告诉 agent 如何在日常开发中消费 `CONTEXT.md` 和 `docs/adr/`。

规则直接写在仓库根目录的 `AGENTS.md` 或 `CLAUDE.md` 中。

## 推荐结构

单上下文仓库：

```text
/
├── AGENTS.md 或 CLAUDE.md           # 含 Domain docs 章节
├── CONTEXT.md                       # 只有需要记录术语时才创建
└── docs/
    └── adr/
        ├── 0001.data.use-postgresql.md
        └── 0002.api.rest-over-graphql.md
```

多上下文仓库：

```text
/
├── AGENTS.md 或 CLAUDE.md           # 含 Domain docs 章节
├── CONTEXT-MAP.md                   # 描述上下文到文档路径的映射
├── docs/adr/                        # 系统级决策
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                # ordering 上下文决策
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/                # billing 上下文决策
```

## CONTEXT-MAP.md 格式

`CONTEXT-MAP.md` 只用于多上下文仓库。它帮助 agent 判断当前任务涉及哪些上下文、应该读取哪些 `CONTEXT.md`，以及上下文之间有什么关系。

推荐格式：

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

规则：

- `Contexts` 用 Markdown 链接指向各上下文的 `CONTEXT.md`，链接文本是上下文名，后面一句话说明它负责什么。
- `Relationships` 只写对理解上下文边界有帮助的关系，例如事件流、数据归属、共享类型或调用方向。
- 上下文 ADR 目录按约定从 `CONTEXT.md` 位置推导：如果上下文文件是 `src/ordering/CONTEXT.md`，则该上下文 ADR 位于 `src/ordering/docs/adr/`。
- 根目录 `CONTEXT.md`（如果存在）只放跨上下文共享术语；不要把所有上下文术语都塞进去。
- 根目录 `docs/adr/` 只放系统级或跨上下文决策；上下文内部决策放到对应上下文的 `docs/adr/`。

## 懒初始化触发条件

不要要求用户先运行初始化流程。只有当下面任一情况发生时才补齐最小结构：

- 第一条领域术语需要写入 `CONTEXT.md`；
- 第一条 ADR 需要创建，或已有 ADR 需要更新；
- 仓库需要持久化规则，让未来 agent 在较复杂开发前读取 `CONTEXT.md` / `CONTEXT-MAP.md` / `docs/adr/`。

写入前先检查：

- `AGENTS.md`、`CLAUDE.md`；
- `CONTEXT.md`、`CONTEXT-MAP.md`；
- `docs/adr/`；
- `src/*/CONTEXT.md`、`src/*/docs/adr/`。

如果仓库布局不明确，先问一个简短问题再写入。

## AGENTS.md / CLAUDE.md 章节

如果 `CLAUDE.md` 或 `AGENTS.md` 已存在，更新已存在的文件。两者都存在时优先 `CLAUDE.md`。

如果两者都不存在，不要只为了初始化打断当前任务；只有当确实需要持久化仓库级规则时，询问用户是否创建 `AGENTS.md`。

加入或更新以下块，不要重复追加：

```markdown
## Domain docs

本仓库使用 domain docs 让 agent 在开发时遵守项目术语和架构决策。

### 较复杂工作前

在计划或实现较复杂的代码/设计变更前，按顺序读取相关文档：

1. 如果存在 `CONTEXT-MAP.md`，先根据它判断当前任务涉及哪个上下文，再读取对应的 `CONTEXT.md`。
2. 如果不存在 `CONTEXT-MAP.md` 但存在 `CONTEXT.md`，读取根目录 `CONTEXT.md`。
3. 读取相关的 accepted ADR 全文：系统级 ADR 在 `docs/adr/`，上下文级 ADR 按 `CONTEXT-MAP.md` 指向的位置读取。

如果文件不存在，静默继续。不要提前创建空文档。
只有当领域术语已经确定时才创建 `CONTEXT.md`；只有当真实架构决策已经形成时才创建 ADR。

### ADR check

实现前，在计划中始终包含一行 `ADR check: ...`：

- `ADR check: no domain docs found`
- `ADR check: no relevant ADRs found`
- `ADR check: read ADR-0001, ADR-0003; no conflict`
- `ADR check: conflict with ADR-0002; stopping`

如果请求与 accepted ADR 冲突，编辑代码前必须停止。说明冲突，并询问用户是修改方案，还是先写一条取代 ADR。

### CONTEXT.md 规则

`CONTEXT.md` 只作为 glossary 和领域语言参考。不要放实现细节、spec、任务计划或架构决策。

术语澄清后，inline 更新相关上下文的 `CONTEXT.md`。如果用户使用的术语和 glossary 冲突，先询问用户意图。

### ADR 规则

ADR 存放在 `docs/adr/` 或 `CONTEXT-MAP.md` 指定的上下文 ADR 目录中，记录重要决策的原因。ADR 不是设计文档。如果决策改变，写一条新的 ADR 取代旧 ADR，不要重写历史。
```
