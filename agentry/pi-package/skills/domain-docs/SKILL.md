---
name: domain-docs
description: 维护并消费项目领域文档，让 agent 在开发中使用正确术语并遵守已有架构决策。只要用户在需求追问、计划制定、方案设计、架构讨论、模块边界设计、较复杂实现前澄清、技术选型、重构、仓库初始化中提到领域概念、项目术语、CONTEXT.md、CONTEXT-MAP.md、ADR、架构决策、历史决策、为什么这么设计、是否要记录决策、或可能影响既有设计的改动，就应使用此 skill。它会按需读取 AGENTS.md/CLAUDE.md 中的 Domain docs 规则、CONTEXT.md、CONTEXT-MAP.md 和 docs/adr/；在首次需要沉淀术语或记录决策时懒创建最小文档结构；术语写入 CONTEXT.md，重要且经过权衡的架构/技术决策写入 ADR；若请求违反 accepted ADR，必须停止并要求用户改方案或先写取代 ADR。不要为简单文案、普通 bugfix、小配置或纯实现细节触发。
---

# 领域文档与项目上下文

在开发讨论中持续维护项目上下文：**术语进 `CONTEXT.md`，架构决策进 ADR，开发前读取并遵守它们**。

这个 skill 不是一个显式初始化流程。它应该在日常需求追问、计划制定、架构设计和较复杂实现中自然触发：当术语需要沉淀、决策需要记录、或实现可能违反既有决策时，按需读取或创建最小文档结构。

## 核心循环

1. **先理解上下文**
   - 若 `AGENTS.md` / `CLAUDE.md` 中存在 `Domain docs` 规则，先遵守它。
   - 若存在 `CONTEXT-MAP.md`，先根据它判断当前任务涉及哪个上下文，再读取对应的 `CONTEXT.md`。
   - 若不存在 `CONTEXT-MAP.md` 但存在 `CONTEXT.md`，读取根目录 `CONTEXT.md`。
   - 若存在 `docs/adr/`，按需读取相关 accepted ADR 全文。

2. **检查已有决策**
   - 较复杂的代码或设计变更前，在计划中写一行 `ADR check: ...`。
   - 如果请求与 accepted ADR 冲突，硬性停下，不要编辑代码。
   - 告诉用户冲突的 ADR、冲突点，并让用户选择：改方案，或先写 superseding ADR。

3. **维护领域语言**
   - 用户使用模糊、冲突或项目特有术语时，澄清它。
   - 术语一旦确定，更新 `CONTEXT.md`。
   - 更新 `CONTEXT.md` 前阅读 `references/CONTEXT-FORMAT.md`。

4. **记录架构决策**
   - 当一个重要决策已经形成时，判断它是否同时满足：难以逆转、未来读者会困惑、真实权衡。
   - 满足时，先询问用户是否记录为 ADR；确认后创建。
   - 创建或修改 ADR 前阅读 `references/ADR-FORMAT.md`。

5. **按需懒初始化**
   - 不要求用户先运行初始化流程。
   - 第一次需要写 `CONTEXT.md`、创建/更新 ADR、或持久化 agent 消费规则时，自动补齐最小结构。
   - 执行懒初始化前阅读 `references/DOMAIN-DOCS-FORMAT.md`。

## 何时读取参考文件

为降低披露成本，不要一触发就读取所有细节。按需读取：

- **写或更新 `CONTEXT.md`** → 读 `references/CONTEXT-FORMAT.md`。
- **写、检查、取代 ADR** → 读 `references/ADR-FORMAT.md`。
- **更新 `AGENTS.md`/`CLAUDE.md` 中的 Domain docs 规则** → 读 `references/DOMAIN-DOCS-FORMAT.md`。

## 文档边界

- `CONTEXT.md` 回答：项目术语是什么意思。
- ADR 回答：为什么做出某个重要决策。
- `AGENTS.md` / `CLAUDE.md` 中的 `Domain docs` 章节回答：agent 应该如何消费 `CONTEXT.md` 和 ADR。
- `DESIGN.md` / `README.md` 回答：系统当前长什么样。
- spec / phase / issue 回答：要做什么。

不要把这些文档混成一个大文档。

## 行为准则

- 克制创建文档：没有真实术语或决策时，不创建空文件。
- 克制创建 ADR：小配置、普通 bugfix、实现细节、临时 workaround 不写 ADR。
- ADR 只写 why，不写 Controller/Service/Repository 等实现结构。
- accepted ADR 是历史记录。要改变它，新建 ADR supersede，不重写旧正文。
- 发现 ADR 冲突时硬拦截，不软提醒、不偷偷绕过。
