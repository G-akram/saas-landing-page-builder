import { type BlockTemplate } from './block-template-types'
import { badge, container, heading, icon, text } from './block-element-factories'

const CARD_STYLE_LIGHT = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  border: '1px solid rgba(0,0,0,0.06)',
  padding: { top: 32, bottom: 32, left: 28, right: 28 },
}

const CARD_STYLE_DARK = {
  backgroundColor: '#1e293b',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  padding: { top: 28, bottom: 28, left: 24, right: 24 },
}

const CARD_STYLE_GLASS = {
  backgroundColor: 'rgba(255,255,255,0.12)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.25)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  padding: { top: 36, bottom: 36, left: 28, right: 28 },
}

export const FEATURES_TEMPLATES: BlockTemplate[] = [
  {
    // Elevated icon cards with shadows — each card is a real container element
    variantStyleId: 'features-1',
    label: 'Icon Cards',
    layout: { type: 'grid', columns: 3, gap: 24, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
    padding: { top: 96, bottom: 96, left: 40, right: 40 },
    createElements: () => [
      container(
        0,
        [
          icon(0, 'zap', {
            fontSize: 28,
            color: '#2563eb',
            colorToken: 'primary',
            backgroundColor: '#eff6ff',
            backgroundColorToken: 'surface',
            borderRadius: 10,
            padding: { top: 10, bottom: 10, left: 10, right: 10 },
          }),
          heading(0, 'Lightning Fast', 3, {
            fontSize: 18,
            fontWeight: 700,
            color: '#111827',
            colorToken: 'text-primary',
            textAlign: 'left',
            marginTop: 16,
          }),
          text(0, 'Optimized at every layer — from CDN delivery to render performance.', {
            fontSize: 15,
            textAlign: 'left',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_LIGHT,
      ),
      container(
        1,
        [
          icon(0, 'shield-check', {
            fontSize: 28,
            color: '#2563eb',
            colorToken: 'primary',
            backgroundColor: '#eff6ff',
            backgroundColorToken: 'surface',
            borderRadius: 10,
            padding: { top: 10, bottom: 10, left: 10, right: 10 },
          }),
          heading(0, 'Secure by Default', 3, {
            fontSize: 18,
            fontWeight: 700,
            color: '#111827',
            colorToken: 'text-primary',
            textAlign: 'left',
            marginTop: 16,
          }),
          text(0, 'Enterprise-grade security without the configuration headache.', {
            fontSize: 15,
            textAlign: 'left',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_LIGHT,
      ),
      container(
        2,
        [
          icon(0, 'bar-chart-2', {
            fontSize: 28,
            color: '#2563eb',
            colorToken: 'primary',
            backgroundColor: '#eff6ff',
            backgroundColorToken: 'surface',
            borderRadius: 10,
            padding: { top: 10, bottom: 10, left: 10, right: 10 },
          }),
          heading(0, 'Built-in Analytics', 3, {
            fontSize: 18,
            fontWeight: 700,
            color: '#111827',
            colorToken: 'text-primary',
            textAlign: 'left',
            marginTop: 16,
          }),
          text(0, 'Real-time dashboards, A/B test results, and conversion tracking.', {
            fontSize: 15,
            textAlign: 'left',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_LIGHT,
      ),
    ],
  },
  {
    // 2-col cards — icon + title + body grouped per card
    variantStyleId: 'features-2',
    label: 'Two Column Cards',
    layout: { type: 'grid', columns: 2, gap: 24, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#ffffff', valueToken: 'background' },
    padding: { top: 80, bottom: 80, left: 64, right: 64 },
    createElements: () => [
      container(
        0,
        [
          icon(0, 'rocket', { fontSize: 32, color: '#6366f1', colorToken: 'accent' }),
          heading(0, 'Quick Setup', 3, {
            fontSize: 20,
            fontWeight: 700,
            color: '#111827',
            colorToken: 'text-primary',
            textAlign: 'left',
            marginTop: 12,
          }),
          text(0, 'Go from zero to live in under 5 minutes. No developer needed — ever.', {
            textAlign: 'left',
            fontSize: 15,
            lineHeight: 1.7,
            color: '#4b5563',
            colorToken: 'text-secondary',
          }),
        ],
        CARD_STYLE_LIGHT,
      ),
      container(
        1,
        [
          icon(0, 'puzzle', { fontSize: 32, color: '#6366f1', colorToken: 'accent' }),
          heading(0, 'Fully Extensible', 3, {
            fontSize: 20,
            fontWeight: 700,
            color: '#111827',
            colorToken: 'text-primary',
            textAlign: 'left',
            marginTop: 12,
          }),
          text(0, 'Plugins and integrations for every tool in your stack — from HubSpot to Zapier.', {
            textAlign: 'left',
            fontSize: 15,
            lineHeight: 1.7,
            color: '#4b5563',
            colorToken: 'text-secondary',
          }),
        ],
        CARD_STYLE_LIGHT,
      ),
      container(
        2,
        [
          icon(0, 'users', { fontSize: 32, color: '#6366f1', colorToken: 'accent' }),
          heading(0, 'Team Collaboration', 3, {
            fontSize: 20,
            fontWeight: 700,
            color: '#111827',
            colorToken: 'text-primary',
            textAlign: 'left',
            marginTop: 12,
          }),
          text(0, 'Invite teammates, manage roles, and collaborate in real-time without conflicts.', {
            textAlign: 'left',
            fontSize: 15,
            lineHeight: 1.7,
            color: '#4b5563',
            colorToken: 'text-secondary',
          }),
        ],
        CARD_STYLE_LIGHT,
      ),
      container(
        3,
        [
          icon(0, 'globe', { fontSize: 32, color: '#6366f1', colorToken: 'accent' }),
          heading(0, 'One-Click Publish', 3, {
            fontSize: 20,
            fontWeight: 700,
            color: '#111827',
            colorToken: 'text-primary',
            textAlign: 'left',
            marginTop: 12,
          }),
          text(0, 'Push to your subdomain or custom domain instantly. Global CDN included.', {
            textAlign: 'left',
            fontSize: 15,
            lineHeight: 1.7,
            color: '#4b5563',
            colorToken: 'text-secondary',
          }),
        ],
        CARD_STYLE_LIGHT,
      ),
    ],
  },
  {
    // Dark grid — dark card containers
    variantStyleId: 'features-3',
    label: 'Dark Grid',
    layout: { type: 'grid', columns: 3, gap: 20, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#0f172a', valueToken: 'background' },
    padding: { top: 96, bottom: 96, left: 40, right: 40 },
    createElements: () => [
      container(
        0,
        [
          icon(0, 'cpu', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
          heading(0, 'AI-Powered', 3, {
            fontSize: 18,
            fontWeight: 700,
            color: '#f0fdfa',
            colorToken: 'text-on-dark',
            textAlign: 'left',
            marginTop: 14,
          }),
          text(0, 'Generate copy, suggest variants, and optimize for conversion automatically.', {
            fontSize: 14,
            textAlign: 'left',
            color: '#94a3b8',
            colorToken: 'text-muted',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_DARK,
      ),
      container(
        1,
        [
          icon(0, 'trending-up', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
          heading(0, 'Deep Analytics', 3, {
            fontSize: 18,
            fontWeight: 700,
            color: '#f0fdfa',
            colorToken: 'text-on-dark',
            textAlign: 'left',
            marginTop: 14,
          }),
          text(0, 'Track every interaction with session-level precision and real-time charts.', {
            fontSize: 14,
            textAlign: 'left',
            color: '#94a3b8',
            colorToken: 'text-muted',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_DARK,
      ),
      container(
        2,
        [
          icon(0, 'layers', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
          heading(0, 'A/B Testing', 3, {
            fontSize: 18,
            fontWeight: 700,
            color: '#f0fdfa',
            colorToken: 'text-on-dark',
            textAlign: 'left',
            marginTop: 14,
          }),
          text(0, 'Run statistically significant experiments on any element without code.', {
            fontSize: 14,
            textAlign: 'left',
            color: '#94a3b8',
            colorToken: 'text-muted',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_DARK,
      ),
    ],
  },
  {
    // Glassmorphism cards on gradient background
    variantStyleId: 'features-4',
    label: 'Glassmorphism Cards',
    layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
      valueToken: 'accent',
    },
    padding: { top: 96, bottom: 96, left: 40, right: 40 },
    createElements: () => [
      container(
        0,
        [
          badge(0, '01', {
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            colorToken: 'text-on-dark',
            letterSpacing: '0.12em',
          }),
          heading(0, 'No-Code Editor', 3, {
            fontSize: 20,
            fontWeight: 700,
            color: '#ffffff',
            colorToken: 'text-on-dark',
            marginTop: 12,
          }),
          text(0, 'Drag, drop, and publish. No developer degree required.', {
            fontSize: 14,
            color: 'rgba(255,255,255,0.75)',
            colorToken: 'text-on-dark',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_GLASS,
      ),
      container(
        1,
        [
          badge(0, '02', {
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            colorToken: 'text-on-dark',
            letterSpacing: '0.12em',
          }),
          heading(0, 'Smart Templates', 3, {
            fontSize: 20,
            fontWeight: 700,
            color: '#ffffff',
            colorToken: 'text-on-dark',
            marginTop: 12,
          }),
          text(0, 'Start from premium templates built by professional designers.', {
            fontSize: 14,
            color: 'rgba(255,255,255,0.75)',
            colorToken: 'text-on-dark',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_GLASS,
      ),
      container(
        2,
        [
          badge(0, '03', {
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            colorToken: 'text-on-dark',
            letterSpacing: '0.12em',
          }),
          heading(0, 'Instant Deploy', 3, {
            fontSize: 20,
            fontWeight: 700,
            color: '#ffffff',
            colorToken: 'text-on-dark',
            marginTop: 12,
          }),
          text(0, 'One click to push your page live. Custom domains, zero downtime.', {
            fontSize: 14,
            color: 'rgba(255,255,255,0.75)',
            colorToken: 'text-on-dark',
            lineHeight: 1.6,
          }),
        ],
        CARD_STYLE_GLASS,
      ),
    ],
  },
]
