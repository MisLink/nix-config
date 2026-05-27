/**
 * Goal Extension — Main Entry Point
 *
 * Registers the /goal command and goal tools, binds lifecycle events,
 * and orchestrates the goal-continuation loop.
 *
 * Features:
 *   - Delta-based token accounting (baselineTokens)
 *   - Auto-pause on agent abort or error
 *   - Continuation markers for dedup and stale detection
 *   - Session compact / shutdown safety
 *
 * Commands:
 *   /goal <objective>            set new goal
 *   /goal pause                  pause auto-continuation
 *   /goal resume [--budget N]    resume a paused goal
 *   /goal edit <objective>       update objective without resetting counters
 *   /goal budget N               modify token budget (0 = clear)
 *   /goal clear                  clear the current goal
 *
 * Tools:
 *   create_goal                  create a new goal (explicit request only)
 *   update_goal                  mark goal complete (with summary)
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

import { registerGoalCommand } from "./commands.js";
import {
  buildContinuationPrompt,
  buildGoalSystemPrompt,
  buildStaleContinuationMessage,
  continuationGoalIdFromPrompt,
  formatGoalStatus,
  formatGoalSummary,
} from "./prompts.js";
import {
  applyUsage,
  clearEntry,
  reconstructGoal,
  setEntry,
  updateGoalStatus,
} from "./state.js";
import { registerGoalTools } from "./tools.js";
import { CUSTOM_ENTRY_TYPE, type GoalEntrySource, type ThreadGoal } from "./types.js";

// ── Assistant message helpers ──────────────────────────────────────────────

interface AssistantMessageLike {
  role: "assistant";
  stopReason?: string;
  usage?: { input?: number; output?: number };
}

function findFinalAssistantMessage(messages: unknown[]): AssistantMessageLike | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg || typeof msg !== "object") continue;
    const candidate = msg as Record<string, unknown>;
    if (candidate.role === "assistant") {
      return candidate as unknown as AssistantMessageLike;
    }
  }
  return undefined;
}

function assistantTurnTokens(message: AssistantMessageLike): number {
  if (!message.usage) return 0;
  return Math.max(0, message.usage.input ?? 0) + Math.max(0, message.usage.output ?? 0);
}

// ── Session entry helpers ──────────────────────────────────────────────────

interface QueuedGoalMessage {
  role: string;
  customType?: string;
  content?: string;
}

function queuedGoalId(message: QueuedGoalMessage): string | null {
  if (message.role !== "custom" || message.customType !== CUSTOM_ENTRY_TYPE) return null;
  if (typeof message.content !== "string") return null;
  return continuationGoalIdFromPrompt(message.content);
}

// ── Main extension ─────────────────────────────────────────────────────────

export default function goalExtension(pi: ExtensionAPI): void {
  // ── Mutable state ──────────────────────────────────────────────────────

  let goal: ThreadGoal | null = null;
  let continuationQueuedFor: string | null = null;
  let continuationIteration = 0;
  let lastAccountedAt: number | null = null;

  // ── Helpers ────────────────────────────────────────────────────────────

  function persistGoal(nextGoal: ThreadGoal, source: GoalEntrySource): void {
    goal = nextGoal;
    pi.appendEntry(CUSTOM_ENTRY_TYPE, setEntry(nextGoal, source));
  }

  function persistClear(source: GoalEntrySource): void {
    const clearedId = goal?.goalId ?? null;
    goal = null;
    continuationQueuedFor = null;
    pi.appendEntry(CUSTOM_ENTRY_TYPE, clearEntry(clearedId, source));
  }

  function clearContinuationState(): void {
    continuationQueuedFor = null;
  }

  function beginAccounting(): void {
    if (goal?.status === "active") {
      lastAccountedAt = Date.now();
    } else {
      lastAccountedAt = null;
    }
  }

  function accountUsage(
    ctx: ExtensionContext,
    tokenDelta: number,
    allowBudgetAbort: boolean,
  ): void {
    if (!goal || goal.status !== "active" || lastAccountedAt === null) {
      beginAccounting();
      return;
    }

    const now = Date.now();
    const elapsed = Math.max(0, Math.floor((now - lastAccountedAt) / 1000));
    lastAccountedAt = now;

    if (tokenDelta === 0 && elapsed === 0) return;

    const result = applyUsage(goal, tokenDelta, elapsed);
    if (!result.changed) return;

    persistGoal(result.goal, "runtime");
    updateStatus(ctx);

    if (allowBudgetAbort && result.crossedBudget) {
      ctx.ui.notify(
        `Goal hit token budget. Use /goal resume --budget N to continue, or /goal clear to end.`,
        "warning",
      );
    }
  }

  function updateStatus(ctx: ExtensionContext): void {
    const statusText = formatGoalStatus(goal);
    ctx.ui.setStatus("goal", statusText ? ctx.ui.theme.fg("accent", statusText) : undefined);
  }

  function sendContinuation(ctx: ExtensionContext, goalToContinue: ThreadGoal): void {
    continuationQueuedFor = goalToContinue.goalId;
    continuationIteration++;
    pi.sendMessage(
      {
        customType: CUSTOM_ENTRY_TYPE,
        content: buildContinuationPrompt(goalToContinue, continuationIteration),
        display: false,
      },
      { triggerTurn: true, deliverAs: "followUp" },
    );
  }

  function maybeContinue(ctx: ExtensionContext): void {
    if (!goal || goal.status !== "active") return;
    if (continuationQueuedFor === goal.goalId) return;
    if (ctx.hasPendingMessages()) return;

    sendContinuation(ctx, goal);
  }

  // ── Register command and tools ─────────────────────────────────────────

  registerGoalCommand(pi, {
    getGoal: () => goal,
    setGoal(nextGoal, source, _ctx) {
      persistGoal(nextGoal, source);
      if (source === "command" && nextGoal.status === "active") {
        continuationQueuedFor = nextGoal.goalId;
        continuationIteration = 0;
      }
      updateStatus(_ctx);
    },
    clearGoal(source, _ctx) {
      persistClear(source);
      updateStatus(_ctx);
    },
  });

  registerGoalTools(pi, {
    getGoal: () => goal,
    setGoal(nextGoal, source, _ctx) {
      persistGoal(nextGoal, source);
      updateStatus(_ctx);
    },
    completeGoal(source, _ctx) {
      accountUsage(_ctx, 0, false);
      const result = updateGoalStatus(goal, "complete");
      if (!result.ok || !result.goal) return result;
      persistGoal(result.goal, source);
      updateStatus(_ctx);
      // Show completion status briefly, then clear.
      _ctx.ui.setStatus("goal", _ctx.ui.theme.fg("success", "🎯 complete"));
      setTimeout(() => _ctx.ui.setStatus("goal", undefined), 8_000);
      return result;
    },
  });

  // ── Context filtering: rewrite stale continuations ─────────────────────

  pi.on("context", async (event) => {
    let changed = false;
    const messages = event.messages.map((message) => {
      const msg = message as QueuedGoalMessage;
      const queuedId = queuedGoalId(msg);
      if (queuedId === null) return message;
      if (goal?.goalId === queuedId && goal.status === "active") return message;

      // Stale continuation — rewrite content.
      changed = true;
      return {
        ...message,
        content: buildStaleContinuationMessage(queuedId, goal),
        display: false,
      } as typeof message;
    });

    return changed ? { messages } : undefined;
  });

  // ── System prompt injection ────────────────────────────────────────────

  pi.on("before_agent_start", async (event, ctx) => {
    // Check if the incoming prompt is a continuation for a now-stale goal.
    const continuationId = continuationGoalIdFromPrompt(event.prompt);
    if (continuationId !== null) {
      continuationQueuedFor = null;
      if (!goal || goal.goalId !== continuationId || goal.status !== "active") {
        // Stale — abort this turn.
        ctx.abort();
        return undefined;
      }
    } else {
      clearContinuationState();
    }

    if (!goal || goal.status !== "active") return undefined;

    return {
      systemPrompt: `${event.systemPrompt}\n\n${buildGoalSystemPrompt(goal)}`,
    };
  });

  // ── Lifecycle events ──────────────────────────────────────────────────

  pi.on("session_start", async (_event, ctx) => {
    goal = reconstructGoal(ctx.sessionManager.getBranch());
    clearContinuationState();
    beginAccounting();
    updateStatus(ctx);
  });

  pi.on("session_tree", async (_event, ctx) => {
    goal = reconstructGoal(ctx.sessionManager.getBranch());
    clearContinuationState();
    beginAccounting();
    updateStatus(ctx);
  });

  pi.on("turn_start", async (_event, ctx) => {
    clearContinuationState();
    beginAccounting();
    updateStatus(ctx);
  });

  pi.on("agent_end", async (event, ctx) => {
    if (!goal || goal.status !== "active") {
      beginAccounting();
      return;
    }

    const goalId = goal.goalId;

    // Account for tokens + elapsed time in one shot.
    const finalAssistant = findFinalAssistantMessage(event.messages);
    const turnTokens = finalAssistant ? assistantTurnTokens(finalAssistant) : 0;
    accountUsage(ctx, turnTokens, true);

    // Goal may have transitioned to budgetLimited during accounting.
    // Abort/error check only applies to still-active goals.
    if (goal?.status === "active") {
      if (
        finalAssistant?.stopReason === "aborted" ||
        finalAssistant?.stopReason === "error"
      ) {
        const result = updateGoalStatus(goal, "paused");
        if (result.ok && result.goal) {
          persistGoal(result.goal, "runtime");
          updateStatus(ctx);
          ctx.ui.notify(
            "Goal paused due to interruption. Use /goal resume to continue.",
            "warning",
          );
        }
        return;
      }
    }

    // Check if goal ended (budgetLimited, paused, or completed).
    const currentStatus = goal?.status;
    if (!currentStatus || currentStatus !== "active") {
      updateStatus(ctx);
      if (currentStatus === "budgetLimited") {
        ctx.ui.notify(
          `Goal hit token budget. Use /goal resume --budget N to continue, or /goal clear to end.`,
          "warning",
        );
      }
      return;
    }

    // Continue if goal is still active.
    if (goal.goalId !== goalId || ctx.hasPendingMessages()) return;

    sendContinuation(ctx, goal);
  });

  pi.on("session_compact", async (_event, ctx) => {
    // Finalize accounting before session compaction.
    accountUsage(ctx, 0, false);
    updateStatus(ctx);
    maybeContinue(ctx);
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    accountUsage(ctx, 0, false);
  });
}
