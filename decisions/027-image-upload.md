# ADR-022: Image Upload — Local Storage + Service Abstraction

**Status:** Accepted
**Date:** 2026-03-28
**Context:** Phase 3 step 7. Editor has image elements and section background images but no upload mechanism — users can only type a URL manually. This ADR defines the upload architecture.

## The Problem

Image elements (`content.type === 'image'`) and section backgrounds (`background.type === 'image'`) both store a URL string but provide no upload path. Manual URL entry is unusable for a landing page builder. In Phase 4 this will need to be cloud-backed (S3/Cloudinary), so the solution must be easy to swap.

## Decision — API Route + Local Disk + Upload Service Abstraction

### Upload service interface

`UploadService` interface with `upload()` and `delete()` methods. `LocalUploadAdapter` implements it by writing to `public/uploads/`. `getUploadService()` is the swap point — returns `LocalUploadAdapter` in dev, will return a cloud adapter in Phase 4.

### API route `POST /api/uploads`

Accepts `multipart/form-data`. Validates auth, type, and size server-side, delegates to `getUploadService()`. Returns `{ url, key }`.

### Client `ImageUploadButton` component

Drop zone + hidden file input. Validates client-side before the network call. Calls the API route and fires `onUpload(url)` on success. Shows current image preview with a "Replace" overlay.

### Validation

- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `image/gif`
- Max size: 5 MB
- Validated both client-side (fast fail) and server-side (authoritative)
- UUID-prefixed filenames to prevent collisions

## Alternatives Rejected

### react-dropzone or similar library for the drop zone UI

The drag-and-drop in `ImageUploadButton` uses native HTML5 drag events (`onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop`) directly — no library. dnd-kit (already in the project) is designed for sortable/positional drag interactions, not file drops; it doesn't help here. react-dropzone wraps exactly the same native events we're using, adds ~8 KB, and brings nothing we don't already have. The only non-obvious implementation detail is the drag-counter pattern (`dragCounterRef`) to prevent `isDragging` flickering when the cursor crosses child elements — that's 5 lines of code, not a reason to add a dependency.

### Server Action + FormData

Server Actions default to a 1 MB body limit for non-streaming payloads. They cannot stream progress. We would have rewritten to an API route before Phase 4 anyway. Rejected in favour of an API route from the start.

### Base64 inline in element content

Stores the image data directly in the document JSON. A 500 KB image becomes ~667 KB of base64 in the DB, bloating every page save/load. Page performance degrades sharply with more than a few images. No path to CDN delivery. Completely rejected.

## Consequences

- `LocalUploadAdapter` writes to `public/uploads/` (gitignored, `.gitkeep` preserves dir)
- `getUploadService()` is the only swap point needed for Phase 4 cloud migration
- Section background upload deferred until section-level panel controls exist
- No image gallery, cropping, or progress bar — out of scope for this step
