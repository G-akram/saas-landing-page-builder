# ADR-043: Stripe Billing Architecture

**Status:** accepted
**Phase:** 8.1

## Context

The app is free and unrestricted — all users get unlimited pages, publishes, and features. Phase 8 introduces a Free/Pro tier system with Stripe payments to monetize the product and demonstrate production billing patterns.

## Decision

### Billing model: Subscriptions + one-time credit packs

**Subscriptions** are the core SaaS revenue model. **One-time credit packs** prepare for Phase 9 AI features and showcase a second Stripe payment mode.

#### Tier matrix

| Capability | Free | Pro ($12/mo or $99/yr) |
|---|---|---|
| Total pages | 3 | Unlimited |
| Published pages | 1 | Unlimited |
| Templates | Basic (2) | All (5+) |
| Themes | Default only | All themes |
| A/B variants per page | 1 (no A/B) | Up to 4 |
| "Built with PageForge" badge | Shown | Removable |
| Webhook delivery (forms) | No (DB only) | Yes |
| AI credits (Phase 9) | 0 | 50/month |

**Credit Pack:** $5 for 100 AI credits (one-time). Available to all users. Credits never expire. Pro users get 50 free credits/month that reset (don't roll over).

#### Pricing rationale

- Monthly $12 hits the "impulse SaaS" range — low enough to try, high enough to be meaningful
- Annual $99 is ~31% discount — standard retention lever
- No trial period — the free tier is generous enough to evaluate
- Credit pack creates a second revenue stream and preps the AI billing path

### Stripe integration points

| Stripe Feature | Purpose | Portfolio Signal |
|---|---|---|
| Products & Prices | Catalog management | Understands Stripe data model |
| Checkout Sessions | Secure payment page (subscription + one-time) | PCI compliance, hosted UX |
| Subscriptions | Recurring billing lifecycle | Core SaaS pattern |
| Customer Portal | Self-service billing management | Production-ready billing UX |
| Webhooks | Event-driven state sync | Async architecture, idempotency |
| Webhook signature verification | Security | Tamper-proof event handling |

### Stripe customer lifecycle

```
User signs up (free)
  → Stripe Customer created lazily on first checkout attempt
  → stripeCustomerId stored in subscriptions table with status 'free'

User clicks "Upgrade to Pro"
  → Server creates Checkout Session (mode: subscription)
  → User completes payment on Stripe-hosted page
  → Webhook: checkout.session.completed → status = 'active'

Subscription renews
  → Webhook: invoice.paid → grant monthly AI credits

Payment fails
  → Webhook: invoice.payment_failed → status = 'past_due'
  → Stripe sends dunning emails automatically

User cancels
  → Via Customer Portal → cancelAtPeriodEnd = true
  → Webhook: customer.subscription.deleted → status = 'canceled'
  → Features revert to free tier limits at period end
```

### Database schema

#### `subscriptions` table
- `userId` (unique FK → users, cascade delete)
- `stripeCustomerId` (unique)
- `stripeSubscriptionId` (nullable — free users have customer but no subscription)
- `stripePriceId` (nullable)
- `status`: `'free' | 'active' | 'canceled' | 'past_due'`
- `currentPeriodStart`, `currentPeriodEnd` (timestamps)
- `cancelAtPeriodEnd` (boolean, default false)

#### `creditBalances` table
- `userId` (unique FK → users, cascade delete)
- `balance` (integer, default 0)

#### `creditTransactions` table (audit ledger)
- `userId` (FK → users, cascade delete)
- `amount` (integer, positive = credit, negative = debit)
- `reason`: `'monthly_grant' | 'pack_purchase' | 'ai_usage'`
- `stripePaymentIntentId` (nullable — for pack purchases)

#### `stripeEvents` table (idempotency)
- `id` = Stripe event ID (`evt_xxx`) as primary key for dedup
- `eventType`, `processedAt`

### Webhook handler design

1. Read raw body with `request.text()` (not `.json()`) for signature verification
2. Verify signature: `stripe.webhooks.constructEvent(body, sig, secret)`
3. Check `stripeEvents` for idempotency — skip if already processed
4. Switch on `event.type`, update DB in a transaction
5. Insert event ID into `stripeEvents`
6. Return 200

Events handled:
- `checkout.session.completed` — activate subscription or credit credit pack
- `customer.subscription.updated` — sync status, period dates, cancel flag
- `customer.subscription.deleted` — set status to canceled
- `invoice.payment_failed` — set status to past_due
- `invoice.paid` — grant monthly AI credits on renewal

### Tier gating enforcement

Server actions check tier limits before mutations:
```
checkPageCreationAllowed(userId) → counts pages vs tier limit
checkPublishAllowed(userId) → counts published pages vs tier limit
checkVariantAllowed(userId, pageId) → counts variants vs tier limit
```

Gating happens at the server action level — the UI shows upgrade prompts but enforcement is server-side. This prevents bypass via direct API calls.

### Environment variables

```
STRIPE_SECRET_KEY          — sk_test_xxx / sk_live_xxx
STRIPE_PUBLISHABLE_KEY     — pk_test_xxx / pk_live_xxx
STRIPE_WEBHOOK_SECRET      — whsec_xxx
STRIPE_PRO_MONTHLY_PRICE_ID — price_xxx
STRIPE_PRO_ANNUAL_PRICE_ID  — price_xxx
STRIPE_CREDIT_PACK_PRICE_ID — price_xxx
```

Test and live mode use different env values — no code changes needed to switch.

## Consequences

- All existing users become "free tier" by default (no subscription row = free)
- Stripe Customer is created lazily — no Stripe interaction until first upgrade attempt
- The credit system is schema-ready for Phase 9 AI features
- Webhook handler must be the single source of truth for subscription state (never trust client-side Checkout redirect)
- Badge removal in published pages requires checking publisher's tier at render time
