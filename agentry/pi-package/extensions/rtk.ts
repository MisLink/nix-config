/**
 * rtk.ts — RTK token-saving proxy for pi.
 *
 * Uses `rtk rewrite` (requires rtk ≥ 0.23.0) to optimize shell commands.
 * Covers both agent-initiated bash tool calls and user-issued `!<cmd>` commands.
 * Commands entered with `!!<cmd>` are intentionally not intercepted.
 *
 * Install rtk:
 *   brew install rtk
 *   curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
 *
 * Commands:
 *   /rtk          — overlay toggle (enable / disable / status)
 *   /rtk gain     — cumulative token-savings report
 *   /rtk status   — version and session stats
 */
import {
	createLocalBashOperations,
	isToolCallEventType,
	type ExtensionAPI,
	type ExtensionContext,
} from "@earendil-works/pi-coding-agent";

// ─── Constants ────────────────────────────────────────────────────────────────

/** `rtk rewrite` was introduced in 0.23.0. */
const MIN_SUPPORTED_RTK_MINOR = 23;
const REWRITE_TIMEOUT_MS = 2_000;
const GAIN_TIMEOUT_MS = 5_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSemver(raw: string): [number, number, number] | null {
	const m = raw.trim().match(/(\d+)\.(\d+)\.(\d+)/);
	if (!m) return null;
	return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function isTooOld(versionStr: string): boolean {
	const parsed = parseSemver(versionStr.replace(/^rtk\s+/, ""));
	if (!parsed) return false;

	const [major, minor] = parsed;
	return major === 0 && minor < MIN_SUPPORTED_RTK_MINOR;
}

function shouldBypass(command: string): boolean {
	const trimmed = command.trimStart();
	return (
		trimmed === "rtk" ||
		trimmed.startsWith("rtk ") ||
		trimmed.startsWith("RTK_DISABLED=1 ") ||
		process.env.RTK_DISABLED === "1"
	);
}

// ─── Extension ────────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
	let enabled = true;
	let rtkReady = false;
	let rtkVersion = "";
	let rewriteCount = 0;
	let warnedUnavailable = false;

	const localBashOperations = createLocalBashOperations();

	// ── Status bar ───────────────────────────────────────────────────────────

	function refreshStatus(ctx: ExtensionContext): void {
		if (!rtkReady) {
			ctx.ui.setStatus("rtk", undefined);
			return;
		}
		if (!enabled) {
			ctx.ui.setStatus("rtk", ctx.ui.theme.fg("muted", "rtk off"));
			return;
		}
		const badge = rewriteCount > 0 ? `  ${rewriteCount}↺` : "";
		ctx.ui.setStatus("rtk", `🔧 rtk${badge}`);
	}

	function showStatus(ctx: ExtensionContext): void {
		ctx.ui.notify(
			[
				rtkReady ? `✅ rtk  ${rtkVersion}` : "❌ rtk unavailable",
				`   enabled  : ${enabled}`,
				`   rewrites : ${rewriteCount} this session`,
				"",
				"Tip: bypass rtk for one command with !RTK_DISABLED=1 <cmd>",
			].join("\n"),
			"info",
		);
	}

	async function showGain(ctx: ExtensionContext): Promise<void> {
		if (!rtkReady) {
			ctx.ui.notify("rtk not available", "warning");
			return;
		}
		try {
			const res = await pi.exec("rtk", ["gain"], { timeout: GAIN_TIMEOUT_MS });
			ctx.ui.notify(res.stdout?.trim() || res.stderr?.trim() || "No stats yet.", "info");
		} catch (err) {
			console.warn("[rtk] unexpected error while running rtk gain", err);
			ctx.ui.notify("rtk gain failed", "warning");
		}
	}

	// ── RTK availability check ───────────────────────────────────────────────

	async function checkRtk(ctx: ExtensionContext): Promise<void> {
		try {
			const res = await pi.exec("rtk", ["--version"], { timeout: REWRITE_TIMEOUT_MS });

			if (res.killed || res.code !== 0) {
				throw new Error("rtk exited non-zero");
			}

			rtkVersion = (res.stdout ?? "").trim();
			if (isTooOld(rtkVersion)) {
				rtkReady = false;
				if (!warnedUnavailable) {
					warnedUnavailable = true;
					ctx.ui.notify(
						`⚠️  rtk ${rtkVersion} is too old (need ≥ 0.${MIN_SUPPORTED_RTK_MINOR}.0).\n` +
							"Upgrade:  brew upgrade rtk",
						"warning",
					);
				}
			} else {
				rtkReady = true;
				warnedUnavailable = false;
			}
		} catch (err: unknown) {
			rtkReady = false;
			if (!warnedUnavailable) {
				warnedUnavailable = true;
				const hint = [
					"⚠️  rtk not found — extension inactive.",
					"",
					"Install:  brew install rtk",
					"or:       curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh",
					"",
					"Restart pi after installing.",
				].join("\n");
				console.warn("[rtk] rtk binary unavailable or unsupported", err);
				ctx.ui.notify(hint, "warning");
			}
		}
	}

	// ── Core rewrite (shared by tool_call and user_bash) ─────────────────────

	async function rtkRewrite(command: string, signal?: AbortSignal): Promise<string | undefined> {
		if (!enabled || !rtkReady) return undefined;
		if (shouldBypass(command)) return undefined;

		try {
			const res = await pi.exec("rtk", ["rewrite", command], {
				timeout: REWRITE_TIMEOUT_MS,
				signal,
			});

			if (res.killed) return undefined;

			// Exit codes: 0=rewritten, 1=no equivalent, 2=deny, 3=advisory rewrite
			if (res.code !== 0 && res.code !== 3) return undefined;
			const out = (res.stdout ?? "").trim();
			return out.length > 0 && out !== command ? out : undefined;
		} catch (err) {
			console.warn("[rtk] unexpected error while rewriting command", err);
			return undefined;
		}
	}

	// ── Session lifecycle ────────────────────────────────────────────────────

	function handleRewrite(): void {
		rewriteCount++;
	}

	pi.on("session_start", async (_event, ctx) => {
		rewriteCount = 0;
		await checkRtk(ctx);
		refreshStatus(ctx);
	});

	// ── Agent bash tool calls ────────────────────────────────────────────────

	pi.on("tool_call", async (event, ctx) => {
		try {
			if (!enabled || !rtkReady) return;
			if (!isToolCallEventType("bash", event)) return;

			const cmd = event.input.command;
			if (typeof cmd !== "string" || cmd.trim() === "") return;

			const rewritten = await rtkRewrite(cmd, ctx.signal);
			if (rewritten) {
				event.input.command = rewritten;
				handleRewrite();
				refreshStatus(ctx);
			}
		} catch (err) {
			// Fail open: never block execution on an unexpected error.
			console.warn("[rtk] unexpected error in tool_call handler; passing through command", err);
		}
	});

	// ── User !<cmd> shell commands ───────────────────────────────────────────

	pi.on("user_bash", async (event, ctx) => {
		// !!<cmd> → context-excluded, don't intercept
		if (event.excludeFromContext) return;
		if (!enabled || !rtkReady) return;

		const rewritten = await rtkRewrite(event.command, ctx.signal);
		if (!rewritten) return;

		handleRewrite();
		refreshStatus(ctx);
		return {
			operations: {
				exec: (_command, cwd, options) =>
					localBashOperations.exec(rewritten, cwd, options),
			},
		};
	});

	// ── /rtk command ─────────────────────────────────────────────────────────

	pi.registerCommand("rtk", {
		description: "Toggle rtk on/off · subcommands: enable, disable, status, gain",
		getArgumentCompletions: (prefix) =>
			[
				{ value: "enable", label: "enable — turn on rewriting" },
				{ value: "disable", label: "disable — turn off rewriting" },
				{ value: "gain", label: "gain — cumulative token-savings report" },
				{ value: "status", label: "status — version and session stats" },
			].filter((s) => s.value.startsWith(prefix)),
		handler: async (args, ctx) => {
			const sub = args?.trim().toLowerCase() ?? "";

			if (sub === "enable") {
				enabled = true;
				ctx.ui.notify("rtk enabled ✓", "info");
				refreshStatus(ctx);
				return;
			}

			if (sub === "disable") {
				enabled = false;
				ctx.ui.notify("rtk disabled", "warning");
				refreshStatus(ctx);
				return;
			}

			if (sub === "gain") {
				await showGain(ctx);
				return;
			}

			if (sub === "status") {
				showStatus(ctx);
				return;
			}

			// No args → overlay
			const selected = await ctx.ui.select("rtk", ["enable", "disable", "status", "gain"]);
			if (!selected) return;

			if (selected === "enable") {
				enabled = true;
				ctx.ui.notify("rtk enabled ✓", "info");
			} else if (selected === "disable") {
				enabled = false;
				ctx.ui.notify("rtk disabled", "warning");
			} else if (selected === "status") {
				showStatus(ctx);
			} else if (selected === "gain") {
				await showGain(ctx);
			}
			refreshStatus(ctx);
		},
	});
}

