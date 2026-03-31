export * from './publish-renderer-link-utils'
export * from './publish-renderer-seo-utils'
export * from './publish-renderer-style-utils'

const DEFAULT_SECTION_HORIZONTAL_PADDING_PX = 24

export const PUBLISHED_PAGE_BASE_CSS = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #ffffff;
  color: #111827;
  line-height: 1.5;
}
main { width: 100%; }
h1, h2, h3, h4, p { margin: 0; }
a { color: inherit; }
img { display: block; max-width: 100%; height: auto; }
.pb-section {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.pb-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.pb-content {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  width: 100%;
  max-width: 1120px;
}
.pb-stack {
  display: flex;
  flex-direction: column;
}
.pb-grid {
  display: grid;
  grid-template-columns: repeat(var(--pb-columns, 1), minmax(0, 1fr));
}
.pb-slot {
  display: flex;
  flex-direction: column;
}
.pb-container {
  box-sizing: border-box;
}
.pb-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  color: #6b7280;
  font-size: 14px;
}
@media (max-width: 768px) {
  .pb-section {
    padding-left: ${String(DEFAULT_SECTION_HORIZONTAL_PADDING_PX)}px !important;
    padding-right: ${String(DEFAULT_SECTION_HORIZONTAL_PADDING_PX)}px !important;
  }
  .pb-grid {
    grid-template-columns: 1fr;
  }
}
`
