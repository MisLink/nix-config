/**
 * Goal Extension — State Management
 *
 * Pure functions for goal state transitions.  No side effects — every
 * function takes state in and returns new state, making the logic easy
 * to test and reason about.
 */

import { randomUUID } from "node:crypto";

import {
  CUSTOM_ENTRY_TYPE,
  MAX_OBJECTIVE_CHARS,
  type GoalCustomEntry,
  type GoalEntrySource,
  type GoalResult,
  type GoalStatus,
  type GoalUsage,
  type SessionEntryLike,
  type ThreadGoal,
} from "./types.js";

// ── Validation ─────────────────────────────────────────────────────────────

export function validateObjective(objective: string): string | null {
  const trimmed = objective.trim();
  if (trimmed.length === 0) {
    return "Objective must not be empty.";
  }
  if ([...trimmed].length > MAX_OBJECTIVE_CHARS) {
    return `Objective must be ${MAX_OBJECTIVE_CHARS.toLocaleString()} characters or fewer. Got ${[...trimmed].length.toLocaleString()}.`;
  }
  return null;
}

export function validateTokenBudget(tokenBudget: number | null | undefined): string | null {
  if (tokenBudget === null || tokenBudget === undefined) {
    return null;
  }
  if (!Number.isInteger(tokenBudget) || tokenBudget <= 0) {
    return "Token budget must be a positive integer.";
  }
  return null;
}

// ── Goal creation ──────────────────────────────────────────────────────────

export function createGoal(
  objective: string,
  tokenBudget: number | null,
  now = unixSeconds(),
): GoalResult {
  const objectiveError = validateObjective(objective);
  if (objectiveError) {
    return { ok: false, message: objectiveError, goal: null };
  }

  const budgetError = validateTokenBudget(tokenBudget);
  if (budgetError) {
    return { ok: false, message: budgetError, goal: null };
  }

  const goal: ThreadGoal = {
    goalId: randomUUID(),
    objective: objective.trim(),
    status: "active",
    tokenBudget,
    usage: { tokensUsed: 0, activeSeconds: 0 },
    createdAt: now,
    updatedAt: now,
  };

  return { ok: true, message: "Goal created.", goal };
}

export function replaceGoal(
  objective: string,
  tokenBudget: number | null,
  now = unixSeconds(),
): GoalResult {
  const objectiveError = validateObjective(objective);
  if (objectiveError) {
    return { ok: false, message: objectiveError, goal: null };
  }

  const budgetError = validateTokenBudget(tokenBudget);
  if (budgetError) {
    return { ok: false, message: budgetError, goal: null };
  }

  const goal: ThreadGoal = {
    goalId: randomUUID(),
    objective: objective.trim(),
    status: "active",
    tokenBudget,
    usage: { tokensUsed: 0, activeSeconds: 0 },
    createdAt: now,
    updatedAt: now,
  };

  return { ok: true, message: "Goal set.", goal };
}

// ── Status transitions ─────────────────────────────────────────────────────

export function updateGoalStatus(
  current: ThreadGoal | null,
  status: GoalStatus,
): GoalResult {
  if (!current) {
    return { ok: false, message: "No active goal exists.", goal: null };
  }

  const goal = cloneGoal(current);
  goal.status = status;
  goal.updatedAt = unixSeconds();

  return { ok: true, message: `Goal marked ${goal.status}.`, goal };
}

export function updateGoalBudget(
  current: ThreadGoal | null,
  tokenBudget: number | null,
): GoalResult {
  if (!current) {
    return { ok: false, message: "No active goal exists.", goal: null };
  }

  const budgetError = validateTokenBudget(tokenBudget);
  if (budgetError) {
    return { ok: false, message: budgetError, goal: current };
  }

  const goal = cloneGoal(current);
  goal.tokenBudget = tokenBudget;
  goal.updatedAt = unixSeconds();

  // Auto-transition if already over new budget.
  if (goal.status === "active" && goal.tokenBudget !== null && goal.usage.tokensUsed >= goal.tokenBudget) {
    goal.status = "budgetLimited";
  }

  return {
    ok: true,
    message: tokenBudget === null
      ? "Goal token budget cleared."
      : `Goal token budget set to ${tokenBudget.toLocaleString("en-US")}.`,
    goal,
  };
}

// ── Usage accounting ───────────────────────────────────────────────────────

export interface ApplyUsageResult {
  goal: ThreadGoal;
  changed: boolean;
  crossedBudget: boolean;
}

export function applyUsage(
  current: ThreadGoal,
  tokenDelta: number,
  activeSecondsDelta: number,
): ApplyUsageResult {
  const goal = cloneGoal(current);

  const wasUnderBudget = goal.tokenBudget === null || goal.usage.tokensUsed < goal.tokenBudget;

  if (tokenDelta > 0) {
    goal.usage.tokensUsed += tokenDelta;
  }

  if (activeSecondsDelta > 0) {
    goal.usage.activeSeconds += activeSecondsDelta;
  }

  goal.updatedAt = unixSeconds();

  // Auto-transition to budgetLimited.
  const crossedBudget =
    goal.status === "active" &&
    wasUnderBudget &&
    goal.tokenBudget !== null &&
    goal.usage.tokensUsed >= goal.tokenBudget;

  if (crossedBudget) {
    goal.status = "budgetLimited";
  }

  const changed = tokenDelta > 0 || activeSecondsDelta > 0;
  return { goal, changed, crossedBudget };
}

// ── Goal editing ───────────────────────────────────────────────────────────

export function editGoalObjective(
  current: ThreadGoal | null,
  objective: string,
): GoalResult {
  if (!current) {
    return { ok: false, message: "No active goal exists.", goal: null };
  }

  const objectiveError = validateObjective(objective);
  if (objectiveError) {
    return { ok: false, message: objectiveError, goal: current };
  }

  const goal = cloneGoal(current);
  goal.objective = objective.trim();
  goal.updatedAt = unixSeconds();

  return { ok: true, message: "Goal objective updated.", goal };
}

// ── Session persistence helpers ────────────────────────────────────────────

export function setEntry(
  goal: ThreadGoal,
  source: GoalEntrySource,
  at = unixSeconds(),
): GoalCustomEntry {
  return { version: 1, kind: "set", source, goal: cloneGoal(goal), at };
}

export function clearEntry(
  clearedGoalId: string | null,
  source: GoalEntrySource,
  at = unixSeconds(),
): GoalCustomEntry {
  return { version: 1, kind: "clear", source, goal: null, clearedGoalId, at };
}

export function reconstructGoal(
  entries: Iterable<SessionEntryLike>,
): ThreadGoal | null {
  let goal: ThreadGoal | null = null;

  for (const entry of entries) {
    if (entry.type !== "custom" || entry.customType !== CUSTOM_ENTRY_TYPE) {
      continue;
    }
    const data = entry.data as Partial<GoalCustomEntry> | undefined;
    if (!data || data.version !== 1) continue;

    if (data.kind === "clear") {
      goal = null;
    } else if (data.kind === "set" && isThreadGoal(data.goal)) {
      goal = cloneGoal(data.goal!);
    }
  }

  return goal;
}

// ── Utilities ──────────────────────────────────────────────────────────────

export function unixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function cloneGoal(goal: ThreadGoal): ThreadGoal {
  return { ...goal, usage: { ...goal.usage } };
}

export function isThreadGoal(goal: unknown): goal is ThreadGoal {
  if (!goal || typeof goal !== "object") return false;
  const g = goal as Record<string, unknown>;
  return (
    typeof g.goalId === "string" &&
    typeof g.objective === "string" &&
    typeof g.status === "string" &&
    typeof g.baselineTokens === "number" &&
    typeof g.createdAt === "number" &&
    typeof g.updatedAt === "number" &&
    g.usage !== null &&
    typeof g.usage === "object" &&
    typeof (g.usage as Record<string, unknown>).tokensUsed === "number" &&
    typeof (g.usage as Record<string, unknown>).activeSeconds === "number"
  );
}
