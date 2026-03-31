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
.pb-lead-form {
  width: 100%;
}
.pb-form-field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.pb-form-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #94a3b8;
}
.pb-form-field {
  width: 100%;
  border: none;
  border-bottom: 1.5px solid #e2e8f0;
  border-radius: 0;
  padding: 10px 0;
  font-size: 15px;
  line-height: 1.5;
  color: #1e293b;
  background: transparent;
  font-family: inherit;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  resize: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}
.pb-form-field:focus {
  border-bottom: 2px solid #2563eb;
}
.pb-form-field::placeholder {
  color: #cbd5e1;
}
.pb-form-submit {
  cursor: pointer;
  font-family: inherit;
  border: none;
  display: block;
  width: 100%;
  margin-top: 8px;
  transition: opacity 0.15s ease, transform 0.1s ease;
}
.pb-form-submit:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}
.pb-form-submit:active {
  transform: translateY(0);
}
.pb-form-status {
  margin: 0;
  min-height: 18px;
  font-size: 13px;
}
.pb-form-privacy {
  margin: 0;
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1.6;
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
