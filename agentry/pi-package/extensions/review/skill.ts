import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

export const REVIEW_SKILL_NAME = "review";

type SkillCommandLike = {
	name?: unknown;
	source?: unknown;
	sourceInfo?: {
		path?: unknown;
	};
};

export type LoadedReviewSkill = {
	path: string;
	body: string;
};

export function stripSkillFrontmatter(markdown: string): string {
	return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
}

function normalizeSkillPath(path: string): string {
	return path.endsWith("SKILL.md") ? path : join(path, "SKILL.md");
}

function commandSkillPath(pi: ExtensionAPI): string | null {
	const getCommands = (pi as { getCommands?: () => SkillCommandLike[] }).getCommands;
	if (typeof getCommands !== "function") return null;

	for (const command of getCommands.call(pi)) {
		if (command.source !== "skill") continue;
		if (command.name !== `skill:${REVIEW_SKILL_NAME}`) continue;
		const path = command.sourceInfo?.path;
		if (typeof path === "string" && path.trim()) return normalizeSkillPath(path);
	}
	return null;
}

export function candidateReviewSkillPaths(cwd: string): string[] {
	const paths = new Set<string>();
	let dir = resolve(cwd);
	for (;;) {
		paths.add(join(dir, ".pi", "skills", REVIEW_SKILL_NAME, "SKILL.md"));
		paths.add(join(dir, ".pi", "skills", `${REVIEW_SKILL_NAME}.md`));
		paths.add(join(dir, ".agents", "skills", REVIEW_SKILL_NAME, "SKILL.md"));
		paths.add(join(dir, "skills", REVIEW_SKILL_NAME, "SKILL.md"));
		paths.add(join(dir, "pi-package", "skills", REVIEW_SKILL_NAME, "SKILL.md"));

		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}

	paths.add(join(homedir(), ".pi", "agent", "skills", REVIEW_SKILL_NAME, "SKILL.md"));
	paths.add(join(homedir(), ".pi", "agent", "skills", `${REVIEW_SKILL_NAME}.md`));
	paths.add(join(homedir(), ".agents", "skills", REVIEW_SKILL_NAME, "SKILL.md"));

	return [...paths];
}

async function firstExisting(paths: string[]): Promise<string | null> {
	for (const path of paths) {
		try {
			await access(path);
			return path;
		} catch {
			// Try the next candidate.
		}
	}
	return null;
}

async function readReviewSkill(path: string): Promise<LoadedReviewSkill> {
	const raw = await readFile(path, "utf8");
	const body = stripSkillFrontmatter(raw);
	if (!body) {
		throw new Error(`review skill is empty: ${path}`);
	}
	return { path, body };
}

export async function loadReviewSkill(pi: ExtensionAPI, cwd: string): Promise<LoadedReviewSkill> {
	const registryPath = commandSkillPath(pi);
	if (registryPath) {
		try {
			return await readReviewSkill(registryPath);
		} catch {
			// Fall back to filesystem discovery below. A stale command path should
			// not make the bundled review extension unusable.
		}
	}

	const fallbackPath = await firstExisting(candidateReviewSkillPaths(cwd));
	if (!fallbackPath) {
		throw new Error("review skill not found");
	}
	return readReviewSkill(fallbackPath);
}

export function buildSkillBlock(body: string): string {
	return `<skill name="${REVIEW_SKILL_NAME}">\n${body.trim()}\n</skill>`;
}
