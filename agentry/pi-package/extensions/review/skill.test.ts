import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
	buildSkillBlock,
	candidateReviewSkillPaths,
	loadReviewSkill,
	REVIEW_SKILL_NAME,
	stripSkillFrontmatter,
} from "./skill.ts";

function makeFakePi(commands: unknown[] = []) {
	return {
		getCommands: () => commands,
	};
}

async function writeSkill(root: string, relativeDir: string, body = "Review body"): Promise<string> {
	const dir = join(root, relativeDir);
	await mkdir(dir, { recursive: true });
	const path = join(dir, "SKILL.md");
	await writeFile(path, `---\nname: review\ndescription: x\n---\n\n${body}\n`, "utf8");
	return path;
}

test("stripSkillFrontmatter removes only leading YAML frontmatter", () => {
	const body = stripSkillFrontmatter("---\nname: review\n---\n\n# Review\n---\nbody");
	assert.equal(body, "# Review\n---\nbody");
});

test("buildSkillBlock uses native Pi-style skill wrapper", () => {
	assert.equal(buildSkillBlock("body"), `<skill name="${REVIEW_SKILL_NAME}">\nbody\n</skill>`);
});

test("loadReviewSkill prefers registered skill command path", async () => {
	const root = await mkdtemp(join(tmpdir(), "review-skill-"));
	const registryPath = await writeSkill(root, "registered-review", "from registry");
	await writeSkill(root, ".pi/skills/review", "from fallback");

	const pi = makeFakePi([
		{
			source: "skill",
			name: "skill:review",
			sourceInfo: { path: registryPath },
		},
	]);

	const loaded = await loadReviewSkill(pi as Parameters<typeof loadReviewSkill>[0], root);
	assert.equal(loaded.path, registryPath);
	assert.equal(loaded.body, "from registry");
});

test("loadReviewSkill falls back to project skill locations", async () => {
	const root = await mkdtemp(join(tmpdir(), "review-skill-"));
	const fallbackPath = await writeSkill(root, ".pi/skills/review", "from project");

	const loaded = await loadReviewSkill(makeFakePi() as Parameters<typeof loadReviewSkill>[0], root);
	assert.equal(loaded.path, fallbackPath);
	assert.equal(loaded.body, "from project");
});

test("loadReviewSkill can load bundled package skill from package root", async () => {
	const loaded = await loadReviewSkill(makeFakePi() as Parameters<typeof loadReviewSkill>[0], process.cwd());
	assert.equal(loaded.path.endsWith("pi-package/skills/review/SKILL.md"), true);
	assert.equal(loaded.body.includes("# 代码审查"), true);
	assert.equal(loaded.body.includes("输出语言：中文"), true);
	assert.equal(loaded.body.includes("## 审查分支总结"), false);
	assert.equal(loaded.body.includes("## 修复审查问题"), false);
	assert.equal(loaded.body.includes("`数据库迁移`：迁移文件、DDL、数据回填或 schema 变更。"), true);
	assert.equal(loaded.body.includes("`不可逆或破坏性操作`"), true);
});

test("candidateReviewSkillPaths includes bundled skill as final fallback", () => {
	const paths = candidateReviewSkillPaths("/tmp/example");
	assert.equal(paths.some((path) => path.endsWith("pi-package/skills/review/SKILL.md")), true);
});
