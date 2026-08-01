import assert from "node:assert/strict";
import test from "node:test";
import {
	buildNotificationBody,
	extractLastAssistantText,
} from "./index.ts";

test("extractLastAssistantText finds the last assistant text parts", () => {
	assert.equal(
		extractLastAssistantText([
			{ role: "assistant", content: "较早的回答" },
			{ role: "user", content: "继续" },
			{
				role: "assistant",
				content: [
					{ type: "thinking", thinking: "内部思考" },
					{ type: "text", text: "第一段\n\n最后一段" },
				],
			},
		]),
		"第一段\n\n最后一段",
	);
});

test("buildNotificationBody uses the final paragraph and removes common Markdown", () => {
	assert.equal(
		buildNotificationBody(
			"已经完成修改。\n\n- 请运行 [`/reload`](https://example.com) 后继续。",
		),
		"请运行 /reload 后继续。",
	);
});

test("buildNotificationBody falls back when no assistant text is available", () => {
	assert.equal(buildNotificationBody(null), "任务已完成，请回到终端");
});

test("buildNotificationBody truncates long paragraphs", () => {
	const body = buildNotificationBody("字".repeat(240));
	assert.equal(body.length, 200);
	assert.equal(body.endsWith("…"), true);
});
