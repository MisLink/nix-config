import assert from "node:assert/strict";
import test from "node:test";
import {
	assistantMessageText,
	buildCarriedReviewResultMessage,
	lastAssistantReviewText,
} from "./handoff.ts";

test("assistantMessageText extracts visible text blocks only", () => {
	const text = assistantMessageText({
		role: "assistant",
		content: [
			{ type: "thinking", thinking: "hidden" },
			{ type: "text", text: "first" },
			{ type: "toolCall", id: "1", name: "read", arguments: {} },
			{ type: "text", text: "second" },
		],
	});

	assert.equal(text, "first\n\nsecond");
});

test("lastAssistantReviewText returns the last assistant text in branch order", () => {
	const text = lastAssistantReviewText([
		{ type: "message", message: { role: "assistant", content: [{ type: "text", text: "old" }] } },
		{ type: "message", message: { role: "user", content: "ignore" } },
		{ type: "message", message: { role: "assistant", content: [{ type: "text", text: "new" }] } },
	]);

	assert.equal(text, "new");
});

test("lastAssistantReviewText ignores assistant messages without text", () => {
	const text = lastAssistantReviewText([
		{ type: "message", message: { role: "assistant", content: [{ type: "toolCall", id: "1", name: "read", arguments: {} }] } },
	]);

	assert.equal(text, null);
});

test("buildCarriedReviewResultMessage labels source without rewriting body", () => {
	const body = "## 结论\n\n- 小问题";
	const message = buildCarriedReviewResultMessage("当前未提交改动</review_target>", body);

	assert.equal(message, "以下是 code review 结果（目标：当前未提交改动）：\n\n## 结论\n\n- 小问题");
});
