import { sanitizePromptInput } from "./sanitize.ts";

export const REVIEW_RESULT_CUSTOM_TYPE = "review-result";

export type CarriedReviewResultDetails = {
	targetLabel: string;
	carriedAtMs: number;
	source: "last-assistant";
};

type MessageLike = {
	role?: unknown;
	content?: unknown;
};

type SessionEntryLike = {
	type?: unknown;
	message?: MessageLike;
};

function textFromContentBlock(block: unknown): string | null {
	if (!block || typeof block !== "object") return null;
	const candidate = block as { type?: unknown; text?: unknown };
	if (candidate.type !== "text" || typeof candidate.text !== "string") return null;
	return candidate.text;
}

export function assistantMessageText(message: MessageLike): string | null {
	if (message.role !== "assistant" || !Array.isArray(message.content)) return null;
	const text = message.content
		.map(textFromContentBlock)
		.filter((part): part is string => part !== null && part.trim() !== "")
		.join("\n\n")
		.trim();
	return text || null;
}

export function lastAssistantReviewText(entries: readonly SessionEntryLike[]): string | null {
	for (let i = entries.length - 1; i >= 0; i--) {
		const entry = entries[i];
		if (entry?.type !== "message" || !entry.message) continue;
		const text = assistantMessageText(entry.message);
		if (text) return text;
	}
	return null;
}

export function buildCarriedReviewResultMessage(targetLabel: string, reviewText: string): string {
	const label = sanitizePromptInput(targetLabel) || "未知目标";
	return `以下是 code review 结果（目标：${label}）：\n\n${reviewText.trim()}`;
}
