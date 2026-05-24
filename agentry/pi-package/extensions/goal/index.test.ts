/**
 * Goal Extension — Tests
 *
 * Tests for the pure-function state management and prompt helpers.
 * Uses node:test + node:assert/strict to match the project convention.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
  applyUsage,
  cloneGoal,
  createGoal,
  editGoalObjective,
  reconstructGoal,
  replaceGoal,
  updateGoalBudget,
  updateGoalStatus,
  validateObjective,
  validateTokenBudget,
} from "./state.js";

import {
  buildContinuationPrompt,
  buildGoalSystemPrompt,
  buildStaleContinuationMessage,
  continuationGoalIdFromPrompt,
  formatDuration,
  formatGoalStatus,
  formatGoalSummary,
  formatTokenValue,
} from "./prompts.js";

import type { ThreadGoal } from "./types.js";

// ── Fixtures ───────────────────────────────────────────────────────────────

function makeGoal(overrides: Partial<ThreadGoal> = {}): ThreadGoal {
  return {
    goalId: "test-goal-id",
    objective: "Fix the login bug",
    status: "active",
    tokenBudget: null,
    usage: { tokensUsed: 0, activeSeconds: 0 },
    baselineTokens: 1000,
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

// ── state.ts tests ─────────────────────────────────────────────────────────

test("validateObjective rejects empty string", () => {
  assert.notEqual(validateObjective(""), null);
  assert.notEqual(validateObjective("   "), null);
});

test("validateObjective rejects too-long string", () => {
  assert.notEqual(validateObjective("a".repeat(4001)), null);
});

test("validateObjective accepts valid objective", () => {
  assert.equal(validateObjective("Fix the bug"), null);
});

test("validateTokenBudget accepts null/undefined", () => {
  assert.equal(validateTokenBudget(null), null);
  assert.equal(validateTokenBudget(undefined), null);
});

test("validateTokenBudget rejects non-positive integer", () => {
  assert.notEqual(validateTokenBudget(0), null);
  assert.notEqual(validateTokenBudget(-100), null);
  assert.notEqual(validateTokenBudget(1.5), null);
});

test("validateTokenBudget accepts positive integer", () => {
  assert.equal(validateTokenBudget(1000), null);
});

test("createGoal creates a goal with correct fields", () => {
  const result = createGoal("Fix the bug", null, 5000, 1000);
  assert.equal(result.ok, true);
  assert.notEqual(result.goal, null);
  assert.equal(result.goal!.objective, "Fix the bug");
  assert.equal(result.goal!.status, "active");
  assert.equal(result.goal!.tokenBudget, null);
  assert.equal(result.goal!.baselineTokens, 5000);
  assert.equal(result.goal!.usage.tokensUsed, 0);
  assert.equal(result.goal!.usage.activeSeconds, 0);
});

test("createGoal creates a goal with token budget", () => {
  const result = createGoal("Fix the bug", 100_000, 0);
  assert.equal(result.ok, true);
  assert.equal(result.goal!.tokenBudget, 100_000);
});

test("createGoal rejects empty objective", () => {
  const result = createGoal("", null, 0);
  assert.equal(result.ok, false);
});

test("replaceGoal creates a fresh goal", () => {
  const result = replaceGoal("New objective", null, 2000, 2000);
  assert.equal(result.ok, true);
  assert.equal(result.goal!.objective, "New objective");
  assert.equal(result.goal!.baselineTokens, 2000);
});

test("updateGoalStatus transitions status", () => {
  const goal = makeGoal();
  const result = updateGoalStatus(goal, "paused");
  assert.equal(result.ok, true);
  assert.equal(result.goal!.status, "paused");
});

test("updateGoalStatus fails when no goal", () => {
  const result = updateGoalStatus(null, "paused");
  assert.equal(result.ok, false);
});

test("updateGoalBudget sets budget", () => {
  const goal = makeGoal();
  const result = updateGoalBudget(goal, 100_000);
  assert.equal(result.ok, true);
  assert.equal(result.goal!.tokenBudget, 100_000);
});

test("updateGoalBudget clears budget with null", () => {
  const goal = makeGoal({ tokenBudget: 100_000 });
  const result = updateGoalBudget(goal, null);
  assert.equal(result.ok, true);
  assert.equal(result.goal!.tokenBudget, null);
});

test("updateGoalBudget auto-transitions to budgetLimited when over new budget", () => {
  const goal = makeGoal({ usage: { tokensUsed: 500, activeSeconds: 10 } });
  const result = updateGoalBudget(goal, 100);
  assert.equal(result.ok, true);
  assert.equal(result.goal!.status, "budgetLimited");
});

test("applyUsage tracks token delta from baseline", () => {
  const goal = makeGoal({ baselineTokens: 1000 });
  const result = applyUsage(goal, 1500, 0);
  assert.equal(result.goal.usage.tokensUsed, 500);
  assert.equal(result.changed, true);
});

test("applyUsage tracks time delta", () => {
  const goal = makeGoal();
  const result = applyUsage(goal, 1000, 30);
  assert.equal(result.goal.usage.activeSeconds, 30);
  assert.equal(result.changed, true);
});

test("applyUsage detects budget crossing", () => {
  const goal = makeGoal({
    baselineTokens: 1000,
    tokenBudget: 600,
    usage: { tokensUsed: 0, activeSeconds: 0 },
  });
  const result = applyUsage(goal, 1700, 0);
  assert.equal(result.goal.usage.tokensUsed, 700);
  assert.equal(result.crossedBudget, true);
  assert.equal(result.goal.status, "budgetLimited");
});

test("applyUsage does not change when no delta", () => {
  const goal = makeGoal({ baselineTokens: 1000, usage: { tokensUsed: 0, activeSeconds: 0 } });
  const result = applyUsage(goal, 1000, 0);
  assert.equal(result.changed, false);
});

test("editGoalObjective updates objective without resetting counters", () => {
  const goal = makeGoal({ usage: { tokensUsed: 500, activeSeconds: 60 } });
  const result = editGoalObjective(goal, "Updated objective");
  assert.equal(result.ok, true);
  assert.equal(result.goal!.objective, "Updated objective");
  assert.equal(result.goal!.usage.tokensUsed, 500);
  assert.equal(result.goal!.usage.activeSeconds, 60);
});

test("editGoalObjective fails when no goal", () => {
  const result = editGoalObjective(null, "Updated");
  assert.equal(result.ok, false);
});

test("reconstructGoal reconstructs from set entries", () => {
  const goal = makeGoal();
  const entries = [
    { type: "custom", customType: "goal", data: { version: 1, kind: "set", source: "command", goal, at: 1000 } },
  ];
  const result = reconstructGoal(entries);
  assert.notEqual(result, null);
  assert.equal(result!.goalId, goal.goalId);
  assert.equal(result!.objective, "Fix the login bug");
});

test("reconstructGoal clears goal on clear entry", () => {
  const goal = makeGoal();
  const entries = [
    { type: "custom", customType: "goal", data: { version: 1, kind: "set", source: "command", goal, at: 1000 } },
    { type: "custom", customType: "goal", data: { version: 1, kind: "clear", source: "command", goal: null, clearedGoalId: "test-goal-id", at: 2000 } },
  ];
  const result = reconstructGoal(entries);
  assert.equal(result, null);
});

test("reconstructGoal returns null when no entries", () => {
  assert.equal(reconstructGoal([]), null);
});

// ── prompts.ts tests ───────────────────────────────────────────────────────

test("formatTokenValue formats small numbers", () => {
  assert.equal(formatTokenValue(0), "0");
  assert.equal(formatTokenValue(999), "999");
});

test("formatTokenValue formats K", () => {
  assert.equal(formatTokenValue(1_000), "1.0K");
  assert.equal(formatTokenValue(1_500), "1.5K");
  assert.equal(formatTokenValue(10_000), "10K");
});

test("formatTokenValue formats M", () => {
  assert.equal(formatTokenValue(1_000_000), "1.0M");
});

test("formatDuration formats seconds", () => {
  assert.equal(formatDuration(0), "0s");
  assert.equal(formatDuration(45), "45s");
});

test("formatDuration formats minutes", () => {
  assert.equal(formatDuration(90), "1m 30s");
});

test("formatDuration formats hours", () => {
  assert.equal(formatDuration(3661), "1h 1m");
});

test("continuationGoalIdFromPrompt extracts goal id from continuation marker", () => {
  const prompt = "<!-- goal-continuation:abc-123:5 -->\nContinue the goal...";
  assert.equal(continuationGoalIdFromPrompt(prompt), "abc-123");
});

test("continuationGoalIdFromPrompt returns null for non-continuation prompt", () => {
  assert.equal(continuationGoalIdFromPrompt("Hello world"), null);
});

test("buildGoalSystemPrompt includes objective and status", () => {
  const goal = makeGoal();
  const prompt = buildGoalSystemPrompt(goal);
  assert.ok(prompt.includes("Fix the login bug"));
  assert.ok(prompt.includes("<untrusted_objective>"));
  assert.ok(prompt.includes("update_goal"));
});

test("buildGoalSystemPrompt includes budget info when set", () => {
  const goal = makeGoal({ tokenBudget: 100_000, baselineTokens: 1000, usage: { tokensUsed: 500, activeSeconds: 0 } });
  const prompt = buildGoalSystemPrompt(goal);
  assert.ok(prompt.includes("100K"));
});

test("buildContinuationPrompt includes marker and objective", () => {
  const goal = makeGoal();
  const prompt = buildContinuationPrompt(goal, 1);
  assert.ok(prompt.includes("<!-- goal-continuation:"));
  assert.ok(prompt.includes("Fix the login bug"));
  assert.ok(prompt.includes("completion audit"));
});

test("buildStaleContinuationMessage describes stale state", () => {
  const msg = buildStaleContinuationMessage("old-id", makeGoal());
  assert.ok(msg.includes("stale"));
  assert.ok(msg.includes("old-id"));
});

test("formatGoalStatus formats active goal", () => {
  const goal = makeGoal();
  assert.ok(formatGoalStatus(goal)!.includes("active"));
});

test("formatGoalStatus formats paused goal", () => {
  const goal = makeGoal({ status: "paused" });
  assert.equal(formatGoalStatus(goal), "🎯 paused");
});

test("formatGoalStatus returns undefined for null goal", () => {
  assert.equal(formatGoalStatus(null), undefined);
});

test("formatGoalSummary shows objective and status", () => {
  const goal = makeGoal();
  const summary = formatGoalSummary(goal);
  assert.ok(summary.includes("Fix the login bug"));
  assert.ok(summary.includes("active"));
  assert.ok(summary.includes("/goal pause"));
});

test("formatGoalSummary shows usage message for no goal", () => {
  const summary = formatGoalSummary(null);
  assert.ok(summary.includes("No goal"));
});
