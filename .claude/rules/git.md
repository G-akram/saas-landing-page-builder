# Git rules

Solo dev — keep it simple.

## Commits

- Conventional prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- Message = what changed + why (if not obvious). One line, under 72 chars.
- Commit per logical unit. Don't bundle unrelated changes.

## Branches

- Work on `main` for now. Branch when needed for experiments or if we add CI.

## What not to commit

- `.env` / secrets — `.gitignore` them.
- `node_modules/`, `.next/`, build artifacts.
- Large binary files.
