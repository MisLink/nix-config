import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const agentsDoc = readFileSync("AGENTS.md", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const webFetchSource = readFileSync("pi-package/extensions/web-fetch/index.ts", "utf8");
const simplePlannotatorSource = readFileSync("pi-package/extensions/simple-plannotator/index.ts", "utf8");

function includes(text: string, expected: string): boolean {
	return text.includes(expected);
}

test("AGENTS documents every shipped extension surfaced to users", () => {
	assert.equal(includes(agentsDoc, "├── notify/"), true, "AGENTS tree should list notify extension");
	assert.equal(
		includes(agentsDoc, "| **review** | `/review`、`/end-review`、`/review status` + bundled `review` skill |"),
		true,
		"AGENTS table should list review session commands and bundled skill",
	);
	assert.equal(includes(agentsDoc, "pi-package/skills/review/"), true, "AGENTS should document the default bundled skill");
	assert.equal(
		includes(agentsDoc, "| **web-fetch** | `fetch_content_local` tool |"),
		true,
		"AGENTS table should list local fetch tool",
	);
	assert.equal(
		includes(agentsDoc, "| **simple-plannotator** | `/plannotator-annotate`、`/plannotator-last` |"),
		true,
		"AGENTS table should list simple Plannotator annotation commands",
	);
	assert.deepEqual(packageJson.pi.skills, ["pi-package/skills/review"], "package should only load the review skill by default");
	assert.equal(
		includes(agentsDoc, "`pi-package/skills/workflow/` is kept in the repo for debugging"),
		true,
		"AGENTS should explain that workflow skills are not loaded by default",
	);
});

test("simple-plannotator header documents its command surface", () => {
	assert.equal(
		includes(simplePlannotatorSource, "/plannotator-annotate <path> — annotate a Markdown file or folder in the browser"),
		true,
		"simple-plannotator header should document /plannotator-annotate",
	);
	assert.equal(
		includes(simplePlannotatorSource, "/plannotator-last            — annotate the last assistant message in the browser"),
		true,
		"simple-plannotator header should document /plannotator-last",
	);
	assert.equal(
		includes(simplePlannotatorSource, 'pi.registerCommand("plannotator-annotate", {'),
		true,
		"simple-plannotator should register /plannotator-annotate",
	);
	assert.equal(
		includes(simplePlannotatorSource, 'pi.registerCommand("plannotator-last", {'),
		true,
		"simple-plannotator should register /plannotator-last",
	);
	assert.equal(
		includes(simplePlannotatorSource, "formatMarkdownFeedback"),
		true,
		"file/folder annotation feedback should be wrapped with target path context",
	);
	assert.equal(
		includes(simplePlannotatorSource, "Annotated assistant message excerpt"),
		true,
		"last-message annotation feedback should include an assistant-message anchor",
	);
	assert.equal(
		includes(simplePlannotatorSource, "sendUserMessageToCurrentPiSession"),
		true,
		"background feedback delivery should fall back to the current pi session",
	);
});

test("web-fetch header documents exported tool", () => {
	assert.equal(
		includes(webFetchSource, "Registers `fetch_content_local` for URL content retrieval as Markdown."),
		true,
		"web-fetch header should describe fetch_content_local",
	);
	assert.equal(
		includes(webFetchSource, "complete Markdown is written to a temp file"),
		true,
		"web-fetch header should explain full-content temp files",
	);
	assert.equal(
		includes(webFetchSource, "get_fetch_content_local"),
		false,
		"web-fetch should not expose responseId retrieval",
	);
});
