/**
 * Goal Extension — Agent Tools
 *
 * Registers two tools:
 *   create_goal — create a new active goal (only when explicitly requested)
 *   update_goal — mark the current goal complete (with required summary)
 *
 * get_goal is intentionally omitted: goal state is already in the system
 * prompt, so the agent can reference it directly.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";

import type { GoalEntrySource, GoalResult, ThreadGoal } from "./types.js";
import { createGoal, updateGoalStatus } from "./state.js";

// ── Host interface (provided by index.ts) ──────────────────────────────────

export interface ToolHost {
  getGoal(): ThreadGoal | null;
  setGoal(goal: ThreadGoal, source: GoalEntrySource, ctx: ExtensionContext): void;
  completeGoal(source: GoalEntrySource, ctx: ExtensionContext): GoalResult;
}

// ── Tool parameters ────────────────────────────────────────────────────────

const CreateGoalParams = Type.Object({
  objective: Type.String({
    description:
      "Required. The concrete objective to start pursuing. " +
      "This starts a new active goal only when no goal is currently defined; " +
      "if a goal already exists, this tool fails.",
  }),
  token_budget: Type.Optional(
    Type.Integer({
      description: "Optional positive integer token budget.",
      minimum: 1,
    }),
  ),
});

const UpdateGoalParams = Type.Object({
  status: Type.String({
    description: "Only \"complete\" is accepted. Do not call this until no required work remains.",
  }),
  summary: Type.String({
    description:
      "Required. Concise summary of what was accomplished and how it was verified. " +
      "This is recorded in the session log.",
  }),
});

// ── Tool prompt guidelines ─────────────────────────────────────────────────

const TOOL_PROMPT_GUIDELINES = [
  "Use create_goal only when the user explicitly asks you to start tracking a concrete goal; do not infer goals from ordinary tasks and do not create a second goal while one already exists.",
  "Use update_goal with status complete only after a completion audit proves the objective is actually achieved and no required work remains.",
  "Before using update_goal, map every explicit requirement in the goal to concrete evidence from files, command output, test results, PR state, or other real artifacts; uncertainty means the goal is not complete.",
  "Do not use update_goal merely because work is stopping, substantial progress was made, tests passed without covering every requirement, or the token budget is nearly exhausted.",
  "When a goal is active, keep working through clear low-risk next steps instead of stopping at a plan.",
];

// ── Tool response formatting ───────────────────────────────────────────────

interface GoalToolResponse {
  goal: {
    goalId: string;
    objective: string;
    status: string;
    tokenBudget: number | null;
    tokensUsed: number;
    timeUsedSeconds: number;
    createdAt: number;
    updatedAt: number;
  } | null;
  remainingTokens: number | null;
  completionBudgetReport: string | null;
}

function toToolResponse(
  goal: ThreadGoal | null,
  includeCompletionReport = false,
): GoalToolResponse {
  const wireGoal = goal
    ? {
        goalId: goal.goalId,
        objective: goal.objective,
        status: goal.status,
        tokenBudget: goal.tokenBudget,
        tokensUsed: goal.usage.tokensUsed,
        timeUsedSeconds: goal.usage.activeSeconds,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      }
    : null;

  const remainingTokens = goal?.tokenBudget === null || goal?.tokenBudget === undefined
    ? null
    : Math.max(0, goal.tokenBudget - goal.usage.tokensUsed);

  let completionBudgetReport: string | null = null;
  if (includeCompletionReport && goal?.status === "complete") {
    const parts: string[] = [];
    if (goal.tokenBudget !== null) {
      parts.push(`tokens used: ${goal.usage.tokensUsed.toLocaleString("en-US")} of ${goal.tokenBudget.toLocaleString("en-US")}`);
    }
    if (goal.usage.activeSeconds > 0) {
      parts.push(`time used: ${goal.usage.activeSeconds} seconds`);
    }
    if (parts.length > 0) {
      completionBudgetReport = `Goal achieved. Report final budget usage to the user: ${parts.join("; ")}.`;
    }
  }

  return { goal: wireGoal, remainingTokens, completionBudgetReport };
}

function textResult(
  text: string,
  goal: ThreadGoal | null,
  isError = false,
  includeCompletionReport = false,
) {
  return {
    content: [{ type: "text" as const, text: isError ? `Error: ${text}` : text }],
    details: toToolResponse(goal, includeCompletionReport),
  };
}

// ── Registration ───────────────────────────────────────────────────────────

export function registerGoalTools(pi: ExtensionAPI, host: ToolHost): void {
  pi.registerTool({
    name: "create_goal",
    label: "Create Goal",
    description:
      "Create a goal only when explicitly requested by the user or system/developer instructions; " +
      "do not infer goals from ordinary tasks. Set token_budget only when an explicit token budget is requested. " +
      "Fails if a goal exists; use update_goal only for status.",
    promptSnippet: "Create a new active long-running thread goal when explicitly requested",
    promptGuidelines: TOOL_PROMPT_GUIDELINES,
    parameters: CreateGoalParams,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      if (host.getGoal()) {
        return textResult(
          "Cannot create a new goal because this thread already has a goal; use update_goal only when the existing goal is complete.",
          host.getGoal(),
          true,
        );
      }

      const result = createGoal(
        params.objective,
        params.token_budget ?? null,
      );
      if (!result.ok || !result.goal) {
        return textResult(result.message, null, true);
      }

      host.setGoal(result.goal, "tool", ctx);
      return textResult(JSON.stringify(toToolResponse(result.goal), null, 2), result.goal);
    },
  });

  pi.registerTool({
    name: "update_goal",
    label: "Update Goal",
    description:
      "Mark the current goal complete only after the objective is actually achieved and no required work remains. " +
      "Do not use this tool just because work is stopping, budget is low, or partial progress looks sufficient.",
    promptSnippet:
      "Mark the current goal complete only after an evidence-backed completion audit proves no required work remains.",
    promptGuidelines: TOOL_PROMPT_GUIDELINES,
    parameters: UpdateGoalParams,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      if (params.status !== "complete") {
        return textResult(
          "update_goal can only mark the existing goal complete.",
          host.getGoal(),
          true,
        );
      }

      const result = host.completeGoal("tool", ctx);
      if (!result.ok || !result.goal) {
        return textResult(result.message, result.goal, true);
      }

      // The summary is logged to the session via the tool result text.
      const summaryText = `Goal complete: ${params.summary}`;
      return textResult(summaryText, result.goal, false, true);
    },
  });
}
