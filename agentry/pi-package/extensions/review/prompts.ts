/**
 * 审查提示词：每个审查目标的指令、
 * “带回并修复”流程触发的修复提示词。
 *
 * 中文输出约定：
 *   - 评审项使用 [P0]..[P3] 优先级标签
 *   - 结论三选一：通过，有备注 / 小问题 / 重大疑虑
 *   - 末尾必须附 “## 非阻塞人工审查提示”
 */
import type { ReviewTarget, ReviewVcs } from "./vcs.ts";
import { buildDiffPromptHint, getTargetLabel } from "./vcs.ts";
import { sanitizePromptInput, sanitizePromptBlock } from "./sanitize.ts";
import { buildSkillBlock } from "./skill.ts";

export type BuildReviewPromptInput = {
	reviewSkill: string;
	target: ReviewTarget;
	vcs: ReviewVcs;
	mergeBase?: string | null;
	projectGuidelines?: string | null;
	extraInstruction?: string | null;
};

function buildPerTargetInstruction(target: ReviewTarget, vcs: ReviewVcs, mergeBase: string | null | undefined): string {
	const label = sanitizePromptInput(getTargetLabel(target, vcs));
	const hint = buildDiffPromptHint(target, vcs, mergeBase);

	switch (target.type) {
		case "uncommitted":
		case "baseBranch":
		case "commit":
		case "files":
			return `审查目标：${label}。${hint} 请按优先级列出具体、可执行的评审项。`;
		case "mergeRequest": {
			const kind = target.provider === "glab" ? "Merge Request" : "Pull Request";
			const symbol = target.provider === "glab" ? "!" : "#";
			const sanitizedTitle = sanitizePromptInput(target.title);
			const sanitizedBase = sanitizePromptInput(target.baseBranch);
			const sanitizedSource = sanitizePromptInput(target.sourceBranch);
			const worktreePath = target.worktreePath ? sanitizePromptInput(target.worktreePath) : null;
			const location = worktreePath
				? `已为源分支 '${sanitizedSource}' 准备临时 worktree：${worktreePath}。不要假设当前工作区已经切到该分支；运行命令时使用下方提示中的 \`git -C ...\` 命令，读取文件时读取该目录下的对应路径。`
				: `当前工作区已切到源分支 '${sanitizedSource}'，目标分支为 '${sanitizedBase}'。`;
			return [
				`审查目标：${kind} ${symbol}${target.id}（“${sanitizedTitle}”），目标分支为 '${sanitizedBase}'。`,
				location,
				hint,
				"请按优先级列出具体、可执行的评审项。",
			].join(" ");
		}
	}
}

export function buildReviewPrompt(input: BuildReviewPromptInput): string {
	const sections: string[] = [buildSkillBlock(input.reviewSkill)];

	const projectGuidelines = input.projectGuidelines ? sanitizePromptBlock(input.projectGuidelines) : null;
	if (projectGuidelines) {
		sections.push(`## 项目专属审查规范\n\n${projectGuidelines}`);
	}

	sections.push(buildPerTargetInstruction(input.target, input.vcs, input.mergeBase));

	const extra = input.extraInstruction ? sanitizePromptBlock(input.extraInstruction) : null;
	if (extra) {
		sections.push(`## 本次额外要求\n\n${extra}`);
	}

	return sections.join("\n\n---\n\n");
}

/**
 * 用户在 /end-review 选择“带回并修复”时，审查结果带回主会话后
 * 自动作为 followUp 投递给主会话的修复指令。
 */
const REVIEW_FIX_FINDINGS_TASK_PROMPT = `请按上一条 code review 结果实施修复。

要求：
1. 把修复清单当作执行清单，按 P0 → P1 → P2 顺序修；P3 项简单且安全就顺手修，否则跳过并说明原因。
2. 若某条评审项已不存在 / 已修复 / 当前不适合修，简要说明原因并继续下一条。
3. "非阻塞人工审查提示"仅供参考，不要把它当作修复任务。
4. 错误处理坚持快速失败原则：除非当前作用域本身是明确的边界处理层，否则不要新增本地 try/catch 兜底降级；JSON 解析等失败默认应显式暴露。
5. 修改触及的代码顺手跑相关测试或类型检查。
6. 最后给出三段：已修项 / 跳过或延后项（含原因）/ 验证结果。`;

export function buildReviewFixFindingsPrompt(reviewSkill: string): string {
	return [buildSkillBlock(reviewSkill), REVIEW_FIX_FINDINGS_TASK_PROMPT].join("\n\n---\n\n");
}
