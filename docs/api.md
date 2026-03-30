# API Reference

## Route handlers

### `GET|POST /api/auth/[...nextauth]`

- Backed by Auth.js (`next-auth` v5 handlers).
- Handles provider sign-in, callbacks, and session routes.

### `POST /api/uploads`

- Auth required (`401` when no session).
- Accepts multipart form data with `file`.
- Max size: 5 MB.
- Server validates file bytes (JPEG, PNG, WebP, GIF).
- Returns:

```json
{
  "url": "/uploads/<generated-key>",
  "key": "<generated-key>"
}
```

Error shape:

```json
{
  "error": "message"
}
```

### `POST /api/publish`

- Auth required (handled inside publishing action).
- Returns `400` when request JSON is invalid or `pageId` is missing/invalid.
- Request body:

```json
{
  "pageId": "<page-id>"
}
```

- Success response:

```json
{
  "success": true,
  "liveUrl": "https://<app-domain>/p/<slug>",
  "artifacts": [
    {
      "pageId": "<page-id>",
      "slug": "<slug>",
      "variantId": "<variant-id>",
      "storageProvider": "local",
      "storageKey": "pages/<page-id>/<content-hash>.html",
      "contentHash": "<sha256>",
      "trafficWeight": 50,
      "primaryGoalElementId": "<element-id|null>",
      "publishedAt": "<ISO date>"
    }
  ]
}
```

- Error response:

```json
{
  "success": false,
  "errorCode": "<code>",
  "message": "<message>"
}
```

- Status mapping:
  - `400` -> invalid JSON or invalid publish payload
  - `401` -> `NOT_AUTHENTICATED`
  - `403` -> `PAGE_ACCESS_DENIED`
  - `404` -> `PAGE_NOT_FOUND`
  - `409` -> `PUBLISH_CONFLICT`
  - `422` -> `INVALID_DOCUMENT`
  - `429` -> `RATE_LIMITED`
  - `500` -> unknown/internal publish failures

- `500` fallback payload (for unexpected thrown errors in route handler):

```json
{
  "success": false,
  "errorCode": "UNKNOWN_ERROR",
  "message": "Publish failed. Try again."
}
```

## Server actions (internal mutation API)

### Dashboard

- `createPage(formData)`
- `deletePage(formData)`

### Editor

- `savePage(pageId, document, expectedUpdatedAt?)`

These actions enforce auth and server-side validation before database writes.

## Public published routes

### `GET /p/[slug]`

- Public published-page route.
- Loads all published variants for the slug, reuses or creates a sticky assignment cookie, and serves the assigned prebuilt HTML artifact.
- Successful HTML responses use:
  - `Content-Type: text/html; charset=utf-8`
  - `X-Content-Type-Options: nosniff`
  - `Cache-Control: private, no-store, max-age=0`
- Not-found or unavailable artifacts return `404` with `Cache-Control: no-store`.
- New assignments set a session-scoped `pb-assignment-<slug>` cookie with `HttpOnly` and `SameSite=Lax` (`Secure` in production).

### `POST /p/[slug]/conversion`

- Public conversion beacon endpoint for published pages.
- Request body:

```json
{
  "goalElementId": "<element-id>"
}
```

- Uses the sticky assignment cookie plus published metadata validation to dedupe one conversion per assignment.
- Returns `204` on accepted beacon requests.
- Returns `400` for invalid JSON or invalid payload shape.
- Returns `404` when the slug is empty after trimming.
