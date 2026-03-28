# Deployment Checklist

Steps required when deploying to a new production environment. Add to this as new infrastructure is introduced.

---

## OAuth Providers

Both providers are configured for `http://localhost:3000` during development. Production requires separate entries (do not remove the localhost ones — add alongside them).

### GitHub

- Go to **github.com → Settings → Developer settings → OAuth Apps → your app**
- Update (or create a separate prod app):
  - **Homepage URL:** `https://yourdomain.com`
  - **Authorization callback URL:** `https://yourdomain.com/api/auth/callback/github`
- Copy the Client ID and Secret into production env vars

### Google

- Go to **console.cloud.google.com → APIs & Services → Credentials → your OAuth client**
- Add to **Authorized JavaScript origins:** `https://yourdomain.com`
- Add to **Authorized redirect URIs:** `https://yourdomain.com/api/auth/callback/google`
- No new credentials needed — same Client ID and Secret work for both envs

### Recommended: separate dev and prod OAuth apps

Keeps credentials isolated. If prod secrets leak, dev is unaffected and vice versa. Create a second app for prod with only the production URLs.

---

## Environment Variables

Current minimum set for production auth + database:

| Variable | Where to get it |
|---|---|
| `AUTH_SECRET` | Run `npx auth secret` to generate |
| `AUTH_GITHUB_ID` | GitHub OAuth app → Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app → Client Secret |
| `AUTH_GOOGLE_ID` | Google Cloud Console → OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google Cloud Console → OAuth client secret |
| `DATABASE_URL` | Neon dashboard → Connection string |
| `PUBLISH_ROOT_DOMAIN` | App root domain for subdomain rewrites (e.g. `app.com`) |
| `PUBLISH_BASE_URL` | Canonical base URL used in publish responses |

---

## Publishing notes

- Current storage adapter defaults to local artifact storage in this project state.
- Current Neon serverless/http path does not provide transaction support; publish persistence is implemented as sequential idempotent operations.
- Keep `PUBLISH_ROOT_DOMAIN` aligned with your DNS/certificate setup or subdomain rewrite behavior will not apply as expected.

---

## Phase 4 hardening checks

Run these before shipping publish-related changes:

- `npm run typecheck`
- `npm run lint`
- `npx vitest run src/app/api/publish/__tests__/route.test.ts src/app/p/[slug]/__tests__/route.test.ts src/modules/publishing/queries/__tests__/published-page-queries.test.ts src/modules/publishing/actions/__tests__/publish-page-action.test.ts src/modules/publishing/storage/__tests__/publish-storage-adapter.test.ts src/modules/publishing/utils/__tests__/render-published-page.test.ts`
- `npm run build`
