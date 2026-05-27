/**
 * Goal Extension — /goal Command
 *
 * Registers the /goal command with subcommands:
 *   /goal                        show current goal
 *   /goal <objective>            set new goal (confirm replacement)
 *   /goal pause                  pause auto-continuation
 *   /goal resume [--budget N]    resume a paused goal
 *   /goal edit <objective>       update objective without resetting counters
 *   /goal budget N               modify token budget (0 = clear)
 *   /goal clear                  clear the current goal
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

import { formatGoalSummary, formatGoalStatus, formatTokenValue } from "./prompts.js";
import {
  editGoalObjective,
  replaceGoal,
  updateGoalBudget,
  updateGoalStatus,
} from "./state.js";
import { CUSTOM_ENTRY_TYPE, type GoalEntrySource, type ThreadGoal } from "./types.js";

// ── Host interface (provided by index.ts) ──────────────────────────────────

export interface CommandHost {
  getGoal(): ThreadGoal | null;
  setGoal(goal: ThreadGoal, source: GoalEntrySource, ctx: ExtensionCommandContext): void;
  clearGoal(source: GoalEntrySource, ctx: ExtensionCommandContext): void;
}

export type GoalCommandPi = Pick<ExtensionAPI, "registerCommand" | "sendMessage">;

// ── Command parsing ────────────────────────────────────────────────────────

const SUBCOMMANDS = ["pause", "resume", "clear", "edit", "budget"] as const;

function completions(prefix: string) {
  return SUBCOMMANDS
    .filter((cmd) => cmd.startsWith(prefix))
    .map((cmd) => ({ value: cmd, label: cmd, description: `goal ${cmd}` }));
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | undefined;

  for (const char of input) {
    if (quote) {
      if (char === quote) quote = undefined;
      else current += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      if (current) tokens.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);
  return tokens;
}

function parseBudgetValue(
  value: string | undefined,
): { ok: true; budget: number | null } | { ok: false; message: string } {
  if (value === undefined) {
    return { ok: false, message: "Usage: /goal budget N or /goal budget 0." };
  }

  // Support k/m suffixes.
  const match = /^(\d+(?:\.\d+)?)([km])?$/iu.exec(value.trim());
  if (!match) {
    return { ok: false, message: `Invalid budget value: ${value}` };
  }
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Token budget must be a positive number." };
  }
  const multiplier = match[2]?.toLowerCase() === "m" ? 1_000_000 : match[2]?.toLowerCase() === "k" ? 1_000 : 1;
  const parsed = Math.floor(amount * multiplier);

  return { ok: true, budget: parsed === 0 ? null : parsed };
}

function parseResumeArgs(
  tokens: string[],
): { ok: true; budget?: number | null } | { ok: false; message: string } | null {
  if (tokens[0] !== "resume") return null;
  if (tokens.length === 1) return { ok: true };

  if (tokens.length === 3 && tokens[1] === "--budget") {
    return parseBudgetValue(tokens[2]);
  }

  if (tokens.length === 2 && tokens[1]?.startsWith("--budget=")) {
    return parseBudgetValue(tokens[1].slice("--budget=".length));
  }

  return { ok: false, message: "Usage: /goal resume or /goal resume --budget N." };
}

// ── Continuation sender ────────────────────────────────────────────────────

function queueGoalTurn(
  pi: GoalCommandPi,
  goal: ThreadGoal,
  kind: "command_start" | "command_resume",
): void {
  // Import dynamically to avoid circular dependency — index.ts provides
  // the actual implementation.  For commands, we use pi.sendMessage directly.
  // The continuation prompt is built by index.ts when it sees the message.
  pi.sendMessage(
    {
      customType: CUSTOM_ENTRY_TYPE,
      content: JSON.stringify({ kind, goalId: goal.goalId }),
      display: false,
    },
    { triggerTurn: true, deliverAs: "followUp" },
  );
}

// ── Command handler ────────────────────────────────────────────────────────

export async function handleGoalCommand(
  pi: GoalCommandPi,
  host: CommandHost,
  args: string,
  ctx: ExtensionCommandContext,
): Promise<void> {
  const trimmed = args.trim();
  if (trimmed.length === 0) {
    ctx.ui.notify(formatGoalSummary(host.getGoal()));
    return;
  }

  const tokens = tokenize(trimmed);

  // ── /goal clear ──────────────────────────────────────────────────────────
  if (tokens[0] === "clear") {
    const goal = host.getGoal();
    if (!goal) {
      ctx.ui.notify("No goal is set.", "warning");
      return;
    }
    host.clearGoal("command", ctx);
    ctx.ui.notify("Goal cleared.");
    return;
  }

  // ── /goal pause ──────────────────────────────────────────────────────────
  if (trimmed === "pause") {
    const current = host.getGoal();
    if (!current) {
      ctx.ui.notify("No active goal.", "warning");
      return;
    }
    if (current.status !== "active") {
      ctx.ui.notify(`Goal is ${current.status}; only active goals can be paused.`, "warning");
      return;
    }
    const result = updateGoalStatus(current, "paused");
    if (!result.ok || !result.goal) {
      ctx.ui.notify(result.message, "error");
      return;
    }
    host.setGoal(result.goal, "command", ctx);
    ctx.ui.notify(`Goal paused: ${result.goal.objective}`);
    return;
  }

  // ── /goal resume [--budget N] ────────────────────────────────────────────
  const resumeArgs = parseResumeArgs(tokens);
  if (resumeArgs !== null) {
    if (!resumeArgs.ok) {
      ctx.ui.notify(resumeArgs.message, "warning");
      return;
    }

    const current = host.getGoal();
    if (!current) {
      ctx.ui.notify("No goal to resume.", "warning");
      return;
    }
    if (current.status !== "paused" && current.status !== "budgetLimited") {
      ctx.ui.notify(`Goal is ${current.status}; only paused or budget-limited goals can be resumed.`, "warning");
      return;
    }

    let nextGoal = current;
    if (resumeArgs.budget !== undefined) {
      const budgetResult = updateGoalBudget(current, resumeArgs.budget);
      if (!budgetResult.ok || !budgetResult.goal) {
        ctx.ui.notify(budgetResult.message, "warning");
        return;
      }
      nextGoal = budgetResult.goal;
    }

    const result = updateGoalStatus(nextGoal, "active");
    if (!result.ok || !result.goal) {
      ctx.ui.notify(result.message, "error");
      return;
    }
    host.setGoal(result.goal, "command", ctx);
    ctx.ui.notify(`Goal resumed: ${result.goal.objective}`);
    if (result.goal.status === "active") {
      queueGoalTurn(pi, result.goal, "command_resume");
    }
    return;
  }

  // ── /goal budget N ───────────────────────────────────────────────────────
  if (tokens[0] === "budget") {
    if (tokens.length !== 2) {
      ctx.ui.notify("Usage: /goal budget N or /goal budget 0.", "warning");
      return;
    }

    const parsed = parseBudgetValue(tokens[1]);
    if (!parsed.ok) {
      ctx.ui.notify(parsed.message, "warning");
      return;
    }

    const result = updateGoalBudget(host.getGoal(), parsed.budget);
    if (!result.ok || !result.goal) {
      ctx.ui.notify(result.message, "warning");
      return;
    }
    host.setGoal(result.goal, "command", ctx);
    ctx.ui.notify(result.message);
    return;
  }

  // ── /goal edit <objective> ───────────────────────────────────────────────
  if (tokens[0] === "edit") {
    const objective = tokens.slice(1).join(" ");
    if (!objective.trim()) {
      ctx.ui.notify("Usage: /goal edit <new objective>", "warning");
      return;
    }

    const result = editGoalObjective(host.getGoal(), objective);
    if (!result.ok || !result.goal) {
      ctx.ui.notify(result.message, "error");
      return;
    }
    host.setGoal(result.goal, "command", ctx);
    ctx.ui.notify(`Goal updated: ${result.goal.objective}`);
    return;
  }

  // ── /goal [--tokens N] <objective> — start or replace ──────────────────────
  let tokenBudget: number | null = null;
  let objective = trimmed;

  // Parse --tokens / -t prefix.
  const tokensParsed = trimmed.match(/^(?:--tokens|-t)\s+(\S+)\s+([\s\S]+)$/i);
  if (tokensParsed) {
    const budgetResult = parseBudgetValue(tokensParsed[1]);
    if (!budgetResult.ok) {
      ctx.ui.notify(budgetResult.message, "warning");
      return;
    }
    tokenBudget = budgetResult.budget;
    objective = tokensParsed[2];
  }

  if (!objective.trim()) {
    ctx.ui.notify("Usage: /goal [--tokens N] <objective>", "warning");
    return;
  }

  const current = host.getGoal();
  if (current && current.status !== "complete") {
    if (!ctx.hasUI) {
      ctx.ui.notify("Clear the existing goal before replacing it.", "error");
      return;
    }
    const shouldReplace = await ctx.ui.confirm(
      "Replace goal?",
      `Current goal:\n${current.objective}\n\nNew goal:\n${objective}`,
    );
    if (!shouldReplace) {
      ctx.ui.notify("Goal unchanged.");
      return;
    }
  }

  const result = replaceGoal(objective, tokenBudget);
  if (!result.ok || !result.goal) {
    ctx.ui.notify(result.message, "error");
    return;
  }
  host.setGoal(result.goal, "command", ctx);
  const budgetSuffix = tokenBudget ? ` (budget: ${formatTokenValue(tokenBudget)})` : "";
  ctx.ui.notify(`Goal active: ${result.goal.objective}${budgetSuffix}`);
  queueGoalTurn(pi, result.goal, "command_start");
}

// ── Registration ───────────────────────────────────────────────────────────

export function registerGoalCommand(pi: GoalCommandPi, host: CommandHost): void {
  pi.registerCommand("goal", {
    description: "Set or manage a long-running goal: /goal [--tokens N] <objective> | pause | resume | edit | budget | clear",
    getArgumentCompletions(argumentPrefix) {
      return completions(argumentPrefix.trim());
    },
    async handler(args: string, ctx: ExtensionCommandContext) {
      await handleGoalCommand(pi, host, args, ctx);
    },
  });
}
