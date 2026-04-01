# ADR-042: Email/Password Authentication Strategy

**Status:** accepted
**Phase:** 8.1

## Context

The app currently supports GitHub and Google OAuth via NextAuth v5 (beta 30) with the Drizzle adapter and database sessions. Phase 8 adds email/password sign-in with email verification. This requires choosing how to integrate credential-based auth alongside the existing OAuth flow.

## The Problem

NextAuth v5's Credentials provider does **not** trigger the Drizzle adapter's session creation flow. The adapter hooks (`createUser`, `linkAccount`, `createSession`) only fire for OAuth and Email (magic link) providers. With Credentials, NextAuth falls back to JWT-only sessions.

The current codebase uses database sessions exclusively — every `auth()` call reads from the `sessions` table via the Drizzle adapter. Switching to JWT would break existing OAuth user sessions and remove the ability to revoke sessions server-side.

## Options Evaluated

| Approach | Description | Rejected because |
|----------|-------------|-----------------|
| **A: Switch to JWT** | All sessions become stateless JWTs | Existing OAuth sessions break on upgrade. No server-side revocation. `sessions` table becomes dead weight. |
| **B: Hybrid strategy** | Database sessions for OAuth, JWT for credentials | NextAuth v5 has no per-provider session strategy. Would require forking session logic — fragile on beta software. |
| **C: Custom credential routes** | Standalone Route Handlers that hash passwords and manually insert into `sessions` table, setting the same cookie NextAuth reads | Zero disruption, `auth()` works for both flows, deeper portfolio signal. |
| **D: Magic link (Email provider)** | Use NextAuth's built-in Email provider | Works with DB sessions, but the spec requires a password-based registration form. |

## Decision

**Option C — Custom credential routes alongside NextAuth OAuth.**

Build `/api/auth/register` and credential login as standalone server actions / Route Handlers that:

1. Hash passwords with bcrypt
2. Insert users into the `users` table with a `passwordHash` column
3. Generate and consume verification tokens via the existing `verificationTokens` table
4. On successful login, insert a session row into `sessions` and set the `authjs.session-token` cookie

NextAuth continues to handle OAuth. The shared `auth()` function reads from the same `sessions` table regardless of how the session was created.

## Key Implementation Details

### Session cookie contract

NextAuth's Drizzle adapter stores sessions as `{ sessionToken, userId, expires }`. The cookie name is `authjs.session-token` in development and `__Secure-authjs.session-token` in production (HTTPS). Our custom login route must create a session row with the same schema and set the same cookie with matching attributes (httpOnly, secure in prod, sameSite=lax, path=/).

### Session token generation

Use `crypto.randomUUID()` — consistent with the existing users table pattern and NextAuth's internal token generation.

### Password storage

- `passwordHash` column added to `users` table (nullable — OAuth users have `null`)
- bcryptjs for hashing (pure JS, no native bindings, Vercel-safe)
- Minimum 8 characters, enforced by Zod validation

### Email verification flow

1. Registration inserts user with `emailVerified: null`
2. Generates a verification token in the existing `verificationTokens` table
3. Sends email with verification link (Resend in prod, structured logger in dev)
4. GET `/api/auth/verify-email?token=xxx&email=yyy` consumes token, sets `emailVerified`
5. Login action rejects unverified users with a redirect to the verification info page

### OAuth user collision handling

If an OAuth user tries to log in with the password form, the action checks for `passwordHash === null` and returns: "This email is registered via [provider]. Use the [provider] button to sign in."

## Consequences

- `auth()`, middleware, and every server action continue to work unmodified
- Zero disruption to existing OAuth users — database sessions remain the single strategy
- Custom session creation code must stay in sync with NextAuth's cookie format if NextAuth is upgraded
- NextAuth version should be pinned until v5 stable is released and cookie format is re-verified
