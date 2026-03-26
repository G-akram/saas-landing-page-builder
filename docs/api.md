# API Reference

(to be filled in Phase 1 as routes are implemented)

## Conventions

- All API routes live under `/api/`
- Auth-protected routes return `401` if no session
- Errors return `{ error: string }` with an appropriate HTTP status
- Mutations use POST/PATCH/DELETE — no RPC-style GET mutations
