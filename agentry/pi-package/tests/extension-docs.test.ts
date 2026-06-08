import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const agentsDoc = readFileSync("AGENTS.md", "utf8");
const staticCheckSource = readFileSync("pi-package/extensions/static-check/index.ts", "utf8");
const staticCheckStateSource = readFileSync("pi-package/extensions/static-check/state.ts", "utf8");
const staticCheckTypesSource = readFileSync("pi-package/extensions/static-check/types.ts", "utf8");
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
	assert.equal(includes(agentsDoc, "pi-package/skills/"), true, "AGENTS should document shipped skills");
	assert.equal(
		includes(agentsDoc, "| **web-fetch** | `fetch_content_local` + `get_fetch_content_local` tools |"),
		true,
		"AGENTS table should list local fetch tools",
	);
	assert.equal(
		includes(agentsDoc, "| **simple-plannotator** | `/plannotator-annotate`、`/plannotator-last` |"),
		true,
		"AGENTS table should list simple Plannotator annotation commands",
	);
	assert.equal(
		includes(
			agentsDoc,
			"| **workflow skills** | `workflow-init`、`issue-capture`、`issue-grill`、`issue-review`、`issue-split`、`issue-plan`、`issue-tasks`、`bdd-implement` |",
		),
		true,
		"AGENTS table should list workflow bundled skills",
	);
});

test("static-check docs and command surface use /staticcheck consistently", () => {
	assert.equal(
		includes(agentsDoc, "| **static-check** | `/staticcheck` |"),
		true,
		"AGENTS should list /staticcheck as the user-facing command",
	);
	assert.equal(
		includes(staticCheckSource, "/staticcheck          — run checks now (manual trigger)"),
		true,
		"static-check header should document /staticcheck",
	);
	assert.equal(
		includes(staticCheckSource, 'pi.registerCommand("staticcheck", {'),
		true,
		"static-check extension should register /staticcheck",
	);
	assert.equal(
		includes(staticCheckSource, 'pi.registerFlag("no-staticcheck", {'),
		true,
		"static-check extension should expose --no-staticcheck",
	);
	assert.equal(
		includes(staticCheckSource, "golangci-lint with go vet fallback"),
		true,
		"static-check header should mention golangci-lint with go vet fallback",
	);
	assert.equal(
		includes(staticCheckStateSource, "mutated by /staticcheck commands"),
		true,
		"state docs should reference /staticcheck commands",
	);
	assert.equal(
		includes(staticCheckTypesSource, "Mutable at runtime via /staticcheck commands."),
		true,
		"types docs should reference /staticcheck commands",
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

test("web-fetch header documents all exported tools", () => {
	assert.equal(
		includes(webFetchSource, "Registers `fetch_content_local` for URL content retrieval as Markdown,"),
		true,
		"web-fetch header should describe fetch_content_local",
	);
	assert.equal(
		includes(webFetchSource, "`get_fetch_content_local`"),
		true,
		"web-fetch header should mention get_fetch_content_local",
	);
	assert.equal(
		includes(webFetchSource, "retrieving stored full content"),
		true,
		"web-fetch header should explain what get_fetch_content_local does",
	);
});
