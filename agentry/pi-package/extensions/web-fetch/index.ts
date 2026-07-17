/**
 * Web Fetch Extension (local) for pi
 *
 * Lightweight, fully-local web content fetcher. No API keys required.
 * Registers `fetch_content_local` for URL content retrieval as Markdown.
 * When content is truncated, the complete Markdown is written to a temp file
 * and the path is returned so the agent can inspect it with the read tool.
 *
 * Contrast with pi-web-access's `fetch_content`:
 *   - This plugin: pure local processing (Readability + node-html-markdown + markitdown)
 *   - pi-web-access: broader capabilities (YouTube, video, GitHub cloning, external APIs)
 *
 * Use this plugin when you need fast, local, dependency-free web page fetching.
 * Use pi-web-access when you need YouTube/video understanding or GitHub repo cloning.
 */

import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
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
  shouldFallbackToMarkitdown,
} from "./html-extract"
import { resolveGitHubFetchPlan } from "./github"

// ── Helpers ────────────────────────────────────────────────────────────────

function withFetchMetadata(text: string, fullContentPath?: string): string {
  if (!fullContentPath) return text

  return [
    `[fullContentPath: ${fullContentPath}]`,
    "[Use the read tool with fullContentPath to inspect the complete Markdown.]",
    "",
    text,
  ].join("\n")
}

async function writeFullContentFile(content: string): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), "pi-fetch-content-"))
  const contentPath = join(tempDir, "content.md")
  await writeFile(contentPath, content, "utf8")
  return contentPath
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
      "If the output is truncated, the complete Markdown is saved to a temp file for the read tool. " +
      "For YouTube videos, video analysis, or GitHub repo cloning, use fetch_content from pi-web-access instead.",
    promptSnippet:
      "Fetch a URL and return readable Markdown content (local processing, no API key)",
    promptGuidelines: [
      "Use fetch_content_local when you have a specific URL and need to read its content as clean Markdown.",
      "fetch_content_local is fully local (Readability + markitdown) — no API key, no external service calls.",
      "If the result is truncated, use the returned fullContentPath with the read tool to inspect the complete Markdown.",
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
      const truncated = result.content.length > maxLength
      const fullContentPath = truncated
        ? await writeFullContentFile(result.content)
        : undefined

      const output = truncated ? result.content.slice(0, maxLength) : result.content
      const suffix = truncated
        ? `\n\n[Content truncated at ${maxLength} chars — ${result.content.length} total. ` +
          `Full content saved to: ${fullContentPath}. Use the read tool with fullContentPath to inspect the complete Markdown.]`
        : ""

      const details: Record<string, unknown> = {
        url: result.url,
        status: result.status,
        contentType: result.contentType,
        converter: result.converter,
        length: result.content.length,
        truncated,
        fullContentPath,
      }

      return {
        content: [{
          type: "text",
          text: withFetchMetadata(output + suffix, fullContentPath),
        }],
        details,
      }
    },
  })
}
