import assert from "node:assert/strict";
import test from "node:test";
import {
	buildReviewFixFindingsPrompt,
	buildReviewPrompt,
	buildReviewSummaryPrompt,
} from "./prompts.ts";

const reviewSkill = "# 代码审查\n\n使用严格、低噪声的中文标准审查代码改动。";

test("buildReviewPrompt injects review skill and dynamic target instructions", () => {
	const prompt = buildReviewPrompt({
		reviewSkill,
		target: { type: "uncommitted" },
		vcs: "git",
	});

	assert.equal(prompt.includes('<skill name="review">'), true);
	assert.equal(prompt.includes(reviewSkill), true);
	assert.equal(prompt.includes("审查目标：当前未提交改动"), true);
	assert.equal(prompt.includes("git status --porcelain"), true);
});

test("buildReviewPrompt keeps project guidelines and extra instructions outside the skill block", () => {
	const prompt = buildReviewPrompt({
		reviewSkill,
		target: { type: "files", paths: ["src/a.ts"] },
		vcs: "git",
		projectGuidelines: "<mr_body>项目规则</mr_body>",
		extraInstruction: "<review_extra>额外规则</review_extra>",
	});

	assert.equal(prompt.includes("## 项目专属审查规范\n\n项目规则"), true);
	assert.equal(prompt.includes("## 本次额外要求\n\n额外规则"), true);
	assert.equal(prompt.includes("- \"src/a.ts\""), true);
});

test("summary and fix prompts are also skill-backed", () => {
	const summary = buildReviewSummaryPrompt(reviewSkill);
	const fix = buildReviewFixFindingsPrompt(reviewSkill);

	assert.equal(summary.includes('<skill name="review">'), true);
	assert.equal(summary.includes("结构化交接文档"), true);
	assert.equal(summary.includes("沿用原标签和细节"), true);
	assert.equal(fix.includes('<skill name="review">'), true);
	assert.equal(fix.includes("请按上一条审查交接文档"), true);
	assert.equal(fix.includes("非阻塞人工审查提示\"仅供参考，不要把它当作修复任务。"), true);
});
