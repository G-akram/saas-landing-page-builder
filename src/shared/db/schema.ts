import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { type PageDocument } from '@/shared/types'

// Auth tables (required by NextAuth.js v5 Drizzle adapter)

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })],
)

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationTokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

// App tables

export const pages = pgTable('pages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  document: jsonb('document').$type<PageDocument>().notNull(),
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

// Published artifact metadata index.
// HTML/CSS artifacts are stored in external storage; this table keeps lookup and integrity fields.
export const publishedPages = pgTable(
  'publishedPages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pageId: text('pageId')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    variantId: text('variantId').notNull(),
    storageProvider: text('storageProvider', { enum: ['local', 'object-storage'] }).notNull(),
    storageKey: text('storageKey').notNull(),
    contentHash: text('contentHash').notNull(),
    trafficWeight: integer('trafficWeight').notNull(),
    primaryGoalElementId: text('primaryGoalElementId'),
    publishedAt: timestamp('publishedAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (publishedPage) => [
    uniqueIndex('published_pages_page_variant_unique').on(
      publishedPage.pageId,
      publishedPage.variantId,
    ),
    index('published_pages_slug_idx').on(publishedPage.slug),
  ],
)

export const publishedPageEvents = pgTable(
  'publishedPageEvents',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pageId: text('pageId')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    variantId: text('variantId').notNull(),
    assignmentId: text('assignmentId').notNull(),
    contentHash: text('contentHash').notNull(),
    eventType: text('eventType', { enum: ['view', 'conversion'] }).notNull(),
    goalElementId: text('goalElementId'),
    occurredAt: timestamp('occurredAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (publishedPageEvent) => [
    uniqueIndex('published_page_events_assignment_event_unique').on(
      publishedPageEvent.assignmentId,
      publishedPageEvent.eventType,
    ),
    index('published_page_events_page_variant_idx').on(
      publishedPageEvent.pageId,
      publishedPageEvent.variantId,
    ),
    index('published_page_events_occurred_at_idx').on(publishedPageEvent.occurredAt),
  ],
)

export const rateLimitEvents = pgTable(
  'rateLimitEvents',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    scope: text('scope').notNull(),
    key: text('key').notNull(),
    occurredAt: timestamp('occurredAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (rateLimitEvent) => [
    index('rate_limit_events_scope_key_occurred_at_idx').on(
      rateLimitEvent.scope,
      rateLimitEvent.key,
      rateLimitEvent.occurredAt,
    ),
    index('rate_limit_events_occurred_at_idx').on(rateLimitEvent.occurredAt),
  ],
)
