/**
 * simple-plannotator — Thin Plannotator wrappers for pi.
 *
 * Commands:
 *   /plannotator-annotate <path> — annotate a Markdown file or folder in the browser
 *   /plannotator-last            — annotate the last assistant message in the browser
 *
 * This intentionally imports only Plannotator's browser helpers and does not
 * load the full @plannotator/pi-extension command/skill surface.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  getLastAssistantMessageText,
  getStartupErrorMessage,
  hasPlanBrowserHtml,
  startLastMessageAnnotationSession,
  startMarkdownAnnotationSession,
} from "@plannotator/pi-extension/plannotator-browser";
import {
  getPiSessionIdentity,
  registerCurrentPiSession,
  sendUserMessageToCurrentPiSession,
  withCurrentPiSessionFallbackHeader,
  type PiSessionIdentity,
} from "@plannotator/pi-extension/current-pi-session";

type AnnotationDecision = {
  exit?: boolean;
  approved?: boolean;
  feedback?: string;
};

type AnnotationSession = Awaited<ReturnType<typeof startMarkdownAnnotationSession>>;
type FeedbackFormatter = (feedback: string) => string;

function handleDecision(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  result: AnnotationDecision,
  formatFeedback: FeedbackFormatter,
  origin: PiSessionIdentity,
): void {
  if (result.exit) {
    ctx.ui.notify("Annotation closed.", "info");
  } else if (result.approved) {
    ctx.ui.notify("Annotation approved.", "info");
  } else if (result.feedback) {
    sendUserMessageWithCurrentSessionFallback(
      pi,
      formatFeedback(result.feedback),
      origin,
    );
  } else {
    ctx.ui.notify("Annotation closed (no feedback).", "info");
  }
}

function waitForAnnotationDecision(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  session: AnnotationSession,
  formatFeedback: FeedbackFormatter,
  origin: PiSessionIdentity,
): void {
  void session
    .waitForDecision()
    .then((result) => {
      try {
        handleDecision(pi, ctx, result, formatFeedback, origin);
      } catch (err) {
        reportBackgroundError(ctx, "Annotation feedback could not be sent", err);
      }
    })
    .catch((err) => {
      reportBackgroundError(ctx, "Annotation failed", err);
    });
}

function sendUserMessageWithCurrentSessionFallback(
  pi: ExtensionAPI,
  content: string,
  origin: PiSessionIdentity,
): void {
  try {
    pi.sendUserMessage(content, { deliverAs: "followUp" });
    return;
  } catch (err) {
    const fallback = sendUserMessageToCurrentPiSession(
      withCurrentPiSessionFallbackHeader(content),
      { deliverAs: "followUp" },
      origin,
    );
    if (fallback.ok) return;

    throw new Error(
      `Original session send failed: ${getStartupErrorMessage(err)}; ` +
        `current-session fallback failed (${fallback.reason}): ${getStartupErrorMessage(fallback.error)}`,
    );
  }
}

function reportBackgroundError(
  ctx: ExtensionContext,
  label: string,
  err: unknown,
): void {
  const message = `${label}: ${getStartupErrorMessage(err)}`;
  try {
    ctx.ui.notify(message, "error");
  } catch (notifyErr) {
    console.warn("[simple-plannotator]", message, notifyErr);
  }
}

function formatMarkdownFeedback(
  fileHeader: "File" | "Folder",
  absPath: string,
  feedback: string,
): string {
  return [
    "# Markdown Annotations",
    "",
    `${fileHeader}: ${absPath}`,
    "",
    feedback,
    "",
    "Please address the annotation feedback above.",
  ].join("\n");
}

function formatLastMessageFeedback(lastText: string, feedback: string): string {
  return [
    "# Message Annotations",
    "",
    "The feedback below targets the assistant message that was open in `/plannotator-last` when the annotation session started.",
    "",
    "Annotated assistant message excerpt:",
    quoteExcerpt(lastText),
    "",
    feedback,
    "",
    "Please address the annotation feedback above.",
  ].join("\n");
}

function quoteExcerpt(text: string): string {
  const maxChars = 2_000;
  const trimmed = text.trim();
  const excerpt = trimmed.length > maxChars
    ? `${trimmed.slice(0, maxChars).trimEnd()}\n…`
    : trimmed;

  if (!excerpt) return "> (empty assistant message)";
  return excerpt.split(/\r?\n/).map((line) => `> ${line}`).join("\n");
}

function canOpenAnnotationUi(ctx: ExtensionContext): boolean {
  if (!ctx.hasUI) {
    ctx.ui.notify("Plannotator annotation UI is unavailable in this pi mode.", "error");
    return false;
  }

  if (!hasPlanBrowserHtml()) {
    ctx.ui.notify(
      "Plannotator annotation UI assets are unavailable. Reinstall or rebuild @plannotator/pi-extension.",
      "error",
    );
    return false;
  }

  return true;
}

export default function simplePlannotator(pi: ExtensionAPI): void {
  const currentPiSession = registerCurrentPiSession(pi);

  pi.on("session_start", (_event, ctx) => {
    currentPiSession.update(ctx);
  });

  pi.on("session_shutdown", () => {
    currentPiSession.clear();
  });

  pi.registerCommand("plannotator-annotate", {
    description: "Open Plannotator annotation UI for a Markdown file or folder",
    handler: async (args, ctx) => {
      if (!canOpenAnnotationUi(ctx)) return;

      const normalized = normalizeUserPath(args ?? "");
      if (!normalized) {
        ctx.ui.notify("Usage: /plannotator-annotate <file.md | folder/>", "error");
        return;
      }

      const absPath = isAbsolute(normalized)
        ? normalized
        : resolve(ctx.cwd, normalized);

      if (!existsSync(absPath)) {
        ctx.ui.notify(`Not found: ${absPath}`, "error");
        return;
      }

      try {
        currentPiSession.update(ctx);
        const origin = getPiSessionIdentity(ctx);
        const isDir = statSync(absPath).isDirectory();
        let session: AnnotationSession;

        if (isDir) {
          ctx.ui.notify(`Opening annotation UI for folder ${normalized}...`, "info");
          session = await startMarkdownAnnotationSession(
            ctx,
            absPath,
            // annotate-folder mode uses folderPath to load files; markdown is intentionally empty.
            "",
            "annotate-folder",
            absPath,
          );
        } else {
          const content = readFileSync(absPath, "utf8");
          ctx.ui.notify(`Opening annotation UI for ${normalized}...`, "info");
          session = await startMarkdownAnnotationSession(
            ctx,
            absPath,
            content,
            "annotate",
          );
        }

        waitForAnnotationDecision(
          pi,
          ctx,
          session,
          (feedback) => formatMarkdownFeedback(isDir ? "Folder" : "File", absPath, feedback),
          origin,
        );
      } catch (err) {
        ctx.ui.notify(
          `Failed to open annotation UI: ${getStartupErrorMessage(err)}`,
          "error",
        );
      }
    },
  });

  pi.registerCommand("plannotator-last", {
    description: "Open Plannotator annotation UI for the last assistant message",
    handler: async (_args, ctx) => {
      if (!canOpenAnnotationUi(ctx)) return;

      const lastText = getLastAssistantMessageText(ctx);
      if (!lastText) {
        ctx.ui.notify("No assistant message found in this session.", "error");
        return;
      }

      try {
        currentPiSession.update(ctx);
        const origin = getPiSessionIdentity(ctx);
        ctx.ui.notify("Opening annotation UI for last assistant message...", "info");
        const session = await startLastMessageAnnotationSession(ctx, lastText);

        waitForAnnotationDecision(
          pi,
          ctx,
          session,
          (feedback) => formatLastMessageFeedback(lastText, feedback),
          origin,
        );
      } catch (err) {
        ctx.ui.notify(
          `Failed to open annotation UI: ${getStartupErrorMessage(err)}`,
          "error",
        );
      }
    },
  });
}

function normalizeUserPath(raw: string): string {
  const trimmed = raw.trim();
  const unquoted = trimmed.replace(/^["']|["']$/g, "");
  const withoutAtPrefix = unquoted.startsWith("@")
    ? unquoted.slice(1)
    : unquoted;
  return expandHomePath(withoutAtPrefix);
}

function expandHomePath(input: string): string {
  if (input === "~") return homedir();
  if (input.startsWith("~/") || input.startsWith("~\\")) {
    return homedir() + input.slice(1);
  }
  return input;
}

