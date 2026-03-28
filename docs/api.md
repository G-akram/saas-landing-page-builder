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
  "artifact": {
    "pageId": "<page-id>",
    "slug": "<slug>",
    "variantId": "<variant-id>",
    "storageProvider": "local",
    "storageKey": "pages/<page-id>/<content-hash>.html",
    "contentHash": "<sha256>",
    "publishedAt": "<ISO date>"
  }
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
