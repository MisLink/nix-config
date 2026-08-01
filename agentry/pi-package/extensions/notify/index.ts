/**
 * Notify Extension
 *
 * Sends a macOS notification after Pi has fully settled and is waiting for
 * input. The notification body is the final non-empty paragraph from the last
 * assistant message.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execFileSync } from "node:child_process";

type MessageLike = {
	role?: string;
	content?: unknown;
};

const MAX_BODY_LENGTH = 200;
const FALLBACK_BODY = "任务已完成，请回到终端";

function isTextPart(part: unknown): part is { type: "text"; text: string } {
	return Boolean(
		part &&
			typeof part === "object" &&
			"type" in part &&
			(part as { type?: unknown }).type === "text" &&
			"text" in part &&
			typeof (part as { text?: unknown }).text === "string",
	);
}

export function extractLastAssistantText(messages: MessageLike[]): string | null {
	for (let index = messages.length - 1; index >= 0; index--) {
		const message = messages[index];
		if (message?.role !== "assistant") continue;

		if (typeof message.content === "string") {
			return message.content.trim() || null;
		}

		if (Array.isArray(message.content)) {
			const text = message.content
				.filter(isTextPart)
				.map((part) => part.text)
				.join("\n")
				.trim();
			return text || null;
		}
	}

	return null;
}

function stripCommonMarkdown(text: string): string {
	return text
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])\s+/gm, "")
		.replace(/[*_~`]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function buildNotificationBody(text: string | null): string {
	if (!text) return FALLBACK_BODY;

	const paragraphs = text.trim().split(/\n\s*\n+/);
	const lastParagraph = stripCommonMarkdown(paragraphs.at(-1) ?? "");
	if (!lastParagraph) return FALLBACK_BODY;

	return lastParagraph.length > MAX_BODY_LENGTH
		? `${lastParagraph.slice(0, MAX_BODY_LENGTH - 1)}…`
		: lastParagraph;
}

function escapeAppleScriptString(text: string): string {
	return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function notifyMacOS(title: string, body: string): void {
	try {
		execFileSync(
			"osascript",
			[
				"-e",
				`display notification "${escapeAppleScriptString(body)}" with title "${escapeAppleScriptString(title)}"`,
			],
			{ encoding: "utf8", timeout: 5000 },
		);
	} catch {
		process.stdout.write("\x07");
	}
}

export default function notifyExtension(pi: ExtensionAPI): void {
	let latestAssistantText: string | null = null;

	pi.on("before_agent_start", async () => {
		latestAssistantText = null;
	});

	pi.on("agent_end", async (event) => {
		latestAssistantText = extractLastAssistantText(event.messages);
	});

	pi.on("agent_settled", async (_event, ctx) => {
		if (!ctx.isIdle()) return;

		notifyMacOS("Pi 已完成", buildNotificationBody(latestAssistantText));
		latestAssistantText = null;
	});
}
