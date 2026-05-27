/**
 * Web Fetch Extension — HTTP Fetching
 *
 * Low-level fetch helpers, binary content detection, and markitdown integration.
 */

import { execFile } from "node:child_process"

export const DEFAULT_MAX_LENGTH = 12_000

export type FetchDirectResult = {
  text: string
  contentType: string
  status: number
}

/** Content-Type prefixes that indicate binary/document content. */
const BINARY_CONTENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/msword",
  "application/epub+zip",
  "application/zip",
  "application/vnd.ms-outlook",
]

/** URL extensions that markitdown handles better than HTML conversion. */
const BINARY_EXTENSIONS = /\.(pdf|docx|pptx|xlsx|epub|msg|ipynb)($|\?|#)/i

export function isBinaryContent(contentType: string, url: string): boolean {
  const ct = contentType.toLowerCase()
  if (BINARY_CONTENT_TYPES.some((prefix) => ct.startsWith(prefix))) return true
  try {
    if (BINARY_EXTENSIONS.test(new URL(url).pathname)) return true
  } catch {
    // Invalid URL — cannot check extension, rely on Content-Type only.
  }
  return false
}

// ── Markitdown ─────────────────────────────────────────────────────────────

let resolvedMarkitdown: { cmd: string; args: string[] } | undefined
let markitdownProbePromise: Promise<{ cmd: string; args: string[] }> | undefined

function findMarkitdown(): Promise<{ cmd: string; args: string[] }> {
  if (resolvedMarkitdown) return Promise.resolve(resolvedMarkitdown)

  // Deduplicate concurrent probes.
  if (!markitdownProbePromise) {
    markitdownProbePromise = new Promise((resolve) => {
      execFile("markitdown", ["--version"], { timeout: 5_000 }, (err) => {
        if (!err) {
          resolvedMarkitdown = { cmd: "markitdown", args: [] }
        } else {
          resolvedMarkitdown = {
            cmd: "uv",
            args: ["tool", "run", "--from", "markitdown[all]", "markitdown"],
          }
        }
        markitdownProbePromise = undefined
        resolve(resolvedMarkitdown)
      })
    })
  }

  return markitdownProbePromise
}

export function runMarkitdown(url: string, signal?: AbortSignal): Promise<string> {
  // Early exit if already aborted.
  if (signal?.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"))
  }

  return new Promise((resolve, reject) => {
    findMarkitdown()
      .then(({ cmd, args }) => {
        // Check again after async findMarkitdown.
        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"))
          return
        }

        const child = execFile(
          cmd,
          [...args, url],
          { encoding: "utf8", maxBuffer: 50 * 1024 * 1024, timeout: 120_000 },
          (err, stdout, stderr) => {
            if (err) {
              const msg = stderr?.trim() || err.message
              reject(new Error(`markitdown failed for ${url}: ${msg}`))
              return
            }
            resolve(stdout)
          }
        )
        signal?.addEventListener("abort", () => child.kill(), { once: true })
      })
      .catch(reject)
  })
}

// ── HTTP Fetch ─────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 30_000

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
}

export async function fetchDirect(
  url: string,
  signal?: AbortSignal
): Promise<FetchDirectResult> {
  // Combine caller signal with a timeout.
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  // If caller signal aborts, propagate to our controller.
  signal?.addEventListener("abort", () => controller.abort(signal.reason), { once: true })

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        ...BROWSER_HEADERS,
        Accept: "text/markdown, text/html, application/xhtml+xml, */*;q=0.8",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText} — ${url}`)
    }

    const contentType = response.headers.get("content-type") ?? ""
    const raw = await response.text()
    return { text: raw, contentType, status: response.status }
  } finally {
    clearTimeout(timeoutId)
  }
}
