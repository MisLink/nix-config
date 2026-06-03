# Agentry Pi Package

Local configuration package for pi extensions and tools.

## Extension Tree

```text
pi-package/extensions/
├── btw/
├── caveman/
├── goal/
├── notify/
├── plan-tracker/
├── questionnaire/
├── review/
├── static-check/
├── web-fetch/
└── rtk.ts
```

## Skill Tree

```text
pi-package/skills/
└── review/
```

## User-Facing Extensions

| Extension | Commands / tools |
| --- | --- |
| **notify** | Desktop notifications when pi waits for input |
| **review** | `/review`、`/end-review`、`/review status` + bundled `review` skill |
| **static-check** | `/staticcheck` |
| **web-fetch** | `fetch_content_local` + `get_fetch_content_local` tools |
| **goal** | `/goal` + `create_goal` / `update_goal` tools |
| **rtk** | `/rtk` |

Some extensions in the tree are optional and may be disabled by `dotfiles/pi/settings.json`.
