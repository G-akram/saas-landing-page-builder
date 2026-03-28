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
