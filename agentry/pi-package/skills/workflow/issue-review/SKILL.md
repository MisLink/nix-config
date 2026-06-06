---
name: issue-review
description: 对本地 issue 的 requirements、plan、tasks、tests、code、closeout 或 ADR 进行阶段审查。所有 review 都先 audit，再把需要用户判断的问题转成 grill。Use whenever the user asks to review an issue, requirements, plan, tasks, BDD tests, code diff, closeout, or ADR.
---

# Issue Review

统一的阶段审查 skill。它不是纯聊天，也不是只输出报告：**先独立 audit，再把真正需要用户判断的发现转成一次一个的 grill 问题，最后给 verdict**。

开始前先阅读 `../ISSUE_PROTOCOL.md`。

## 支持的 stage

- `requirements`：审查 `需求摘要`、`行为规格（Behavior specs）`、`不做范围`、`开放问题`。
- `plan`：审查 `方案` 是否覆盖需求和 behavior，方案取舍是否合理。
- `tasks`：审查 `任务` 是否可执行、可验证、覆盖 plan 和 behavior。
- `tests`：审查 BDD 风格测试是否真正约束 behavior。
- `code`：对照 issue/plan/tasks/tests 和项目规范审查代码。
- `closeout`：审查是否可以把 issue 标为 done。
- `adr`：审查 ADR 是否真的值得存在，内容是否清楚。

## 统一流程

1. 定位 target：issue 文件、ADR 文件、测试文件、代码 diff 或用户指定文件。
2. 建立 baseline：
   - requirements：`讨论摘要`、CONTEXT.md、ADR、代码现实。
   - plan：`需求摘要`、`行为规格（Behavior specs）`、CONTEXT.md、ADR。
   - tasks：`方案`、`行为规格（Behavior specs）`。
   - tests：`行为规格（Behavior specs）`、测试策略、公共接口。
   - code：issue + plan + tasks + tests + AGENTS.md + CONTEXT.md + ADR + diff。
   - closeout：所有 review、verification、test mapping、tasks。
   - adr：相关 issue/plan/context 与 ADR 触发条件。
3. 先 audit：独立对比 target 与 baseline。
4. 分类 findings：
   - **Direct finding**：明确问题，直接列出。
   - **Decision finding**：需要用户选择，转成 grill question。
   - **Note**：非阻塞建议。
5. 对 decision findings 逐条提问：每次只问一个，包含推荐答案和后果。
6. 生成 verdict：`Approved`、`Approved with notes` 或 `Blocked`。
7. 把 review 摘要写入 issue 的 `审查记录` 区块；ADR review 可写入 ADR 的 review notes 或仅输出。

## Code review 双轴

代码审查必须分两轴：

1. **Spec review**：是否符合 issue/behavior/plan/tasks？是否遗漏需求？是否 scope creep？
2. **Standards review**：是否符合 AGENTS.md、CONTEXT.md、ADR、项目约定？是否有正确性、安全、可维护性问题？

明确 bug 或 spec 偏离直接指出；只有作者意图不明或需要产品/架构判断时才 grill。

## Review question 模板

```markdown
### Review question

**Finding**：...

**Question**：需要你决定什么？

**Recommended answer**：...

**Consequences**：
- 如果选 A：...
- 如果选 B：...
```

## Verdict 规则

- `Approved`：可以进入下一阶段。
- `Approved with notes`：可以继续，但有非阻塞建议。
- `Blocked`：不要进入下一阶段，必须先修正或澄清。

阻塞项应具体、可操作，并说明影响。
