/**
 * Goal Extension — Core Types
 *
 * Type definitions for the goal-tracking extension.  A goal is a
 * user-defined objective that the agent autonomously pursues across
 * multiple turns until it is marked complete or the token budget is
 * exhausted.
 */

// ── Goal status ────────────────────────────────────────────────────────────

export type GoalStatus = "active" | "paused" | "budgetLimited" | "complete";

// ── Usage tracking ─────────────────────────────────────────────────────────

export interface GoalUsage {
  tokensUsed: number;
  activeSeconds: number;
}

// ── Core goal type ─────────────────────────────────────────────────────────

export interface ThreadGoal {
  goalId: string;
  objective: string;
  status: GoalStatus;
  tokenBudget: number | null;
  usage: GoalUsage;
  /** Token count at goal creation — used for delta-based accounting. */
  baselineTokens: number;
  createdAt: number;
  updatedAt: number;
}

// ── Session persistence ────────────────────────────────────────────────────

export type GoalEntrySource = "command" | "tool" | "runtime";

export interface GoalCustomEntry {
  version: 1;
  kind: "set" | "clear";
  source: GoalEntrySource;
  goal: ThreadGoal | null;
  clearedGoalId?: string | null;
  at: number;
}

// ── Command / tool results ─────────────────────────────────────────────────

export interface GoalResult {
  ok: boolean;
  message: string;
  goal: ThreadGoal | null;
}

// ── Session entry shape (for reconstructGoal) ──────────────────────────────

export interface SessionEntryLike {
  type: string;
  customType?: string;
  data?: unknown;
}

// ── Constants ──────────────────────────────────────────────────────────────

export const CUSTOM_ENTRY_TYPE = "goal";
export const MAX_OBJECTIVE_CHARS = 4_000;
