/**
 * Web Fetch Extension (local) for pi
 *
 * Lightweight, fully-local web content fetcher. No API keys required.
 * Registers `fetch_content_local` for URL content retrieval as Markdown,
 * and `get_fetch_content_local` for retrieving stored full content.
 *
 * Contrast with pi-web-access's `fetch_content`:
 *   - This plugin: pure local processing (Readability + node-html-markdown + markitdown)
 *   - pi-web-access: broader capabilities (YouTube, video, GitHub cloning, external APIs)
 *
 * Use this plugin when you need fast, local, dependency-free web page fetching.
 * Use pi-web-access when you need YouTube/video understanding or GitHub repo cloning.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { Type } from "@sinclair/typebox"
import {
  DEFAULT_MAX_LENGTH,
  fetchDirect,
  isBinaryContent,
  runMarkitdown,
} from "./fetch"
import {
  htmlPageToMarkdown,
  htmlToMarkdown,
  shouldFallbackToMarkitdown,
} from "./html-extract"
import {
  getWebResponse,
  storeWebResponse,
  type StoredFetchContent,
} from "./storage"
import { resolveGitHubFetchPlan } from "./github"

// ── Helpers ────────────────────────────────────────────────────────────────

function withResponseId(text: string, responseId: string): string {
  return `${text}\n\n[responseId: ${responseId}]`
}

type FetchedUrlResult = {
  url: string
  title: string
  content: string
  status: number
  contentType: string
  converter: string
}

async function fetchResolvedUrlAsMarkdown(
  requestUrl: string,
  displayUrl: string,
  signal?: AbortSignal,
  forcedConverter?: string
): Promise<FetchedUrlResult> {
  const result = await fetchDirect(requestUrl, signal)
  let text: string
  let converter = forcedConverter ?? "raw"

  if (isBinaryContent(result.contentType, requestUrl)) {
    text = await runMarkitdown(requestUrl, signal)
    converter = forcedConverter ?? "markitdown"
  } else if (
    result.contentType.includes("text/markdown") ||
    result.contentType.includes("text/plain")
  ) {
    text = result.text
    converter = forcedConverter ?? "native"
  } else if (result.contentType.includes("text/html")) {
    const htmlResult = htmlPageToMarkdown(result.text, displayUrl)
    text = htmlResult.text
    converter = forcedConverter ?? htmlResult.converter

    if (shouldFallbackToMarkitdown(text)) {
      try {
        text = await runMarkitdown(requestUrl, signal)
        converter = forcedConverter ?? "markitdown-fallback"
      } catch {
        // Keep HTML-derived markdown when markitdown fallback fails.
      }
    }
  } else {
    text = result.text
  }

  return {
    url: displayUrl,
    title: displayUrl,
    content: text,
    status: result.status,
    contentType: result.contentType,
    converter,
  }
}

async function fetchUrlAsMarkdown(
  url: string,
  signal?: AbortSignal
): Promise<FetchedUrlResult> {
  const githubPlan = resolveGitHubFetchPlan(url)

  if (githubPlan.kind === "raw-file") {
    return fetchResolvedUrlAsMarkdown(githubPlan.rawUrl, url, signal, "github-raw-file")
  }

  if (githubPlan.kind === "repo-readme") {
    for (const readmeUrl of githubPlan.readmeUrls) {
      try {
        return await fetchResolvedUrlAsMarkdown(readmeUrl, url, signal, "github-readme")
      } catch {
        // Try next README candidate.
      }
    }
  }

  if (githubPlan.kind === "tree") {
    return {
      url,
      title: url,
      content: [
        `# GitHub directory ${githubPlan.owner}/${githubPlan.repo}`,
        "",
        `Path: ${githubPlan.path}`,
        `Open: ${githubPlan.treeUrl}`,
        "",
        "Directory pages are not cloned by this lightweight fetcher. Open specific blob links or repo README for direct content.",
      ].join("\n"),
      status: 200,
      contentType: "text/markdown",
      converter: "github-tree-summary",
    }
  }

  return fetchResolvedUrlAsMarkdown(url, url, signal)
}

// ── Extension ─────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "fetch_content_local",
    label: "Fetch Content (Local)",
    description:
      "Fetch a URL and return page content as Markdown. " +
      "Fully local processing — no external API keys required. " +
      "Uses Readability for article extraction and markitdown for binary files (PDF, DOCX, etc.). " +
      "For YouTube videos, video analysis, or GitHub repo cloning, use fetch_content from pi-web-access instead.",
    promptSnippet:
      "Fetch a URL and return readable Markdown content (local processing, no API key)",
    promptGuidelines: [
      "Use fetch_content_local when you have a specific URL and need to read its content as clean Markdown.",
      "fetch_content_local is fully local (Readability + markitdown) — no API key, no external service calls.",
      "For YouTube videos, local video files, or full GitHub repo cloning, use fetch_content (pi-web-access) instead.",
      "For web search or source discovery, use web_search (pi-web-access) instead of constructing search URLs by hand.",
      "If a fetched page contains promising links, call fetch_content_local again on the specific URL you want to inspect.",
    ],
    parameters: Type.Object({
      url: Type.String({
        description: "URL to fetch.",
      }),
      maxLength: Type.Optional(
        Type.Number({
          description: `Maximum characters to return (default ${DEFAULT_MAX_LENGTH}).`,
          minimum: 1000,
          maximum: 50_000,
        })
      ),
    }),

    async execute(_toolCallId, params, signal) {
      const maxLength = params.maxLength ?? DEFAULT_MAX_LENGTH
      const url = params.url.trim()

      if (url.length === 0) {
        throw new Error("URL must not be empty")
      }

      const result = await fetchUrlAsMarkdown(url, signal ?? undefined)
      const responseId = storeWebResponse({
        type: "fetch",
        urls: [{ url: result.url, title: result.title, content: result.content }],
      })

      const truncated = result.content.length > maxLength
      const output = truncated ? result.content.slice(0, maxLength) : result.content
      const suffix = truncated
        ? `\n\n[Content truncated at ${maxLength} chars — ${result.content.length} total. ` +
          `Call fetch_content_local again with a larger maxLength or use get_fetch_content_local with responseId.]`
        : ""

      const details: Record<string, unknown> = {
        url: result.url,
        status: result.status,
        contentType: result.contentType,
        converter: result.converter,
        length: result.content.length,
        truncated,
        responseId,
      }

      return {
        content: [{ type: "text", text: withResponseId(output + suffix, responseId) }],
        details,
      }
    },
  })

  pi.registerTool({
    name: "get_fetch_content_local",
    label: "Get Fetch Content (Local)",
    description:
      "Retrieve full content from a previous fetch_content_local call via responseId.",
    promptSnippet:
      "Retrieve stored full content from a previous fetch_content_local call by responseId.",
    parameters: Type.Object({
      responseId: Type.String({
        description: "responseId returned from fetch_content_local.",
      }),
      urlIndex: Type.Optional(
        Type.Number({
          description: "URL index to retrieve (default 0).",
          minimum: 0,
        })
      ),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const stored = getWebResponse(params.responseId)
      if (!stored) {
        return {
          content: [{ type: "text" as const, text: `No stored response found for ${params.responseId}.` }],
          details: { responseId: params.responseId, error: "Not found" } as Record<string, unknown>,
        }
      }

      const urlIndex = params.urlIndex ?? 0
      const urlData = stored.urls[urlIndex]

      if (!urlData) {
        const available = stored.urls.map((item, i) => `${i}: ${item.url}`).join("\n")
        return {
          content: [{
            type: "text" as const,
            text: `No URL at index ${urlIndex}. Available URLs:\n${available}`,
          }],
          details: { responseId: params.responseId, error: "Invalid urlIndex" } as Record<string, unknown>,
        }
      }

      return {
        content: [{ type: "text" as const, text: `# ${urlData.title}\n\n${urlData.content}` }],
        details: {
          responseId: params.responseId,
          url: urlData.url,
          title: urlData.title,
          length: urlData.content.length,
        } as Record<string, unknown>,
      }
    },
  })
}
