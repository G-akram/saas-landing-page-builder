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

## Server actions (internal mutation API)

### Dashboard

- `createPage(formData)`
- `deletePage(formData)`

### Editor

- `savePage(pageId, document, expectedUpdatedAt?)`

These actions enforce auth and server-side validation before database writes.
