/**
 * Web Fetch Extension — Storage
 *
 * In-memory storage for fetched content with LRU eviction.
 * Content is stored so the agent can retrieve full text via
 * get_fetch_content_local when the initial response was truncated.
 */

import { randomUUID } from "node:crypto"

// ── Types ──────────────────────────────────────────────────────────────────

export type StoredFetchContent = {
  url: string
  title: string
  content: string
}

export type StoredWebResponse = {
  type: "fetch"
  timestamp: number
  urls: StoredFetchContent[]
}

export type StoredWebResponseInput = {
  type: "fetch"
  urls: StoredFetchContent[]
}

// ── LRU Storage ────────────────────────────────────────────────────────────

const MAX_ENTRIES = 500
const storedResponses = new Map<string, StoredWebResponse>()

export function clearWebSearchStorage(): void {
  storedResponses.clear()
}

export function storeWebResponse(response: StoredWebResponseInput): string {
  const responseId = randomUUID()
  const stored: StoredWebResponse = {
    type: "fetch",
    timestamp: Date.now(),
    urls: response.urls,
  }

  // Evict oldest entry if at capacity.
  if (storedResponses.size >= MAX_ENTRIES) {
    const oldest = storedResponses.keys().next().value
    if (oldest !== undefined) {
      storedResponses.delete(oldest)
    }
  }

  storedResponses.set(responseId, stored)
  return responseId
}

export function getWebResponse(responseId: string): StoredWebResponse | undefined {
  return storedResponses.get(responseId)
}
