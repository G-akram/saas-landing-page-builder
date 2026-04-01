import { type BlockTemplate } from './block-template-types'
import { container, heading, icon, text } from './block-element-factories'
import { CARD_STYLE_LIGHT } from './block-templates-features-cards'

/** Icon cards with shadows — 3 columns. */
export const FEATURES_TEMPLATE_1: BlockTemplate = {
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
}

/** 2-column feature cards. */
export const FEATURES_TEMPLATE_2: BlockTemplate = {
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
}
