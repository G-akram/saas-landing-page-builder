# File organization

Where content goes — follow strictly, no exceptions.

| Content | Location | Auto-loaded? |
|---|---|---|
| App documentation (what it does, how it works, status, roadmap) | `docs.md` | No |
| Competitive research, user research, market analysis | `research/*.md` | No |
| Architecture decisions (ADR format) | `decisions/NNN-*.md` | No |
| Code standards, git rules, working rules | `.claude/rules/*.md` | Yes (keep short) |
| Claude persistent memory | `~/.claude/projects/.../memory/` | Index only |

## Rules

- `docs.md` = app-facing documentation. No research, no internal process notes.
- `research/` = analysis done before decisions. Referenced by ADRs, not duplicated.
- `decisions/` = one file per decision, ADR-lite format. Numbered sequentially.
- `.claude/rules/` = short, actionable rules. These are injected every conversation — keep each file under 30 lines.
- Never duplicate content across locations. Reference instead.
