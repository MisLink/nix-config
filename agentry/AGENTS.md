# Agentry Pi Package

Local pi package for custom pi extensions, skills, and shared helper code.

## Project intent

- Keep extensions small, focused, and easy to inspect.
- Prefer explicit user-facing commands/tools over hidden behavior.
- Treat command names, tool names, and bundled skills as public surface.
- Keep runtime code independent from local `node_modules/` layout details.

## Rules

- Do not edit `node_modules/`.
- Do not revive or migrate code from `pi-package/legacy/` without user confirmation.
- Put new runtime extensions under `pi-package/extensions/<name>/`.
- Keep extension-specific code inside its extension directory.
- Put genuinely shared helpers in `pi-package/lib/`; avoid abstractions for one extension.
- Keep top-level `pi-package/extensions/` limited to runtime extension entries, not stray test files.
- When changing a command, tool, or bundled skill, update the user-facing surface table and related tests.

## User-facing surface

| Surface | Commands / tools |
| --- | --- |
| **notify** | Desktop notifications when pi waits for input |
| **review** | `/review`、`/end-review`、`/review status` + bundled `review` skill |
| **static-check** | `/staticcheck` |
| **web-fetch** | `fetch_content_local` + `get_fetch_content_local` tools |
| **goal** | `/goal` + `create_goal` / `update_goal` tools |
| **rtk** | `/rtk` |
| **simple-plannotator** | `/plannotator-annotate`、`/plannotator-last` |

Some extensions may be disabled by `dotfiles/pi/settings.json`.
`pi-package/skills/workflow/` is kept in the repo for debugging, but is intentionally omitted from the default `package.json` `pi.skills` manifest.

## Tests

- After code changes, run the most specific affected test file.
- For documentation/layout changes, run:

```sh
node --test pi-package/tests/*.test.ts
```

## Layout

Keep this map high-level; do not paste a full generated tree.

```text
pi-package/
├── extensions/
│   ├── goal/
│   ├── notify/
│   ├── review/
│   ├── simple-plannotator/
│   ├── static-check/
│   ├── web-fetch/
│   └── rtk.ts
├── skills/
├── lib/
├── tests/
└── legacy/
```

`pi-package/skills/review/` is the only skill loaded by this package by default. `pi-package/skills/workflow/` remains available in the repo for opt-in testing while it is being debugged.
