# File organization

Where content goes — follow strictly, no exceptions.

| Content | Location | Auto-loaded? |
|---|---|---|
| App docs (architecture, API, getting started) | `docs/*.md` | No |
| Project roadmap (phases, ordering, deliverables, progress) | `ROADMAP.md` | No |
| Competitive research, user research, market analysis | `research/*.md` | No |
| Architecture decisions (ADR format) | `decisions/NNN-*.md` | No |
| Personal notes (interview prep, learning log) | `notes/*.md` | No |
| Code standards, git rules, working rules | `.claude/rules/*.md` | Yes (keep short) |
| Claude persistent memory | `~/.claude/projects/.../memory/` | Index only |

## Rules

- `docs/` = shareable, contributor-facing living docs only. No roadmap, no personal notes, no internal process.
- `ROADMAP.md` = phase plan, ordering rationale, progress tracking. Internal project management.
- `decisions/` = one file per decision, ADR-lite format. Numbered sequentially. Stays at root.
- `research/` = pre-decision analysis only. Referenced by ADRs, not duplicated. Stays at root.
- `notes/` = personal only. Never referenced in app docs.
- `.claude/rules/` = short, actionable rules. Injected every conversation — keep each file under 30 lines.
- Never duplicate content across locations. Reference instead.
