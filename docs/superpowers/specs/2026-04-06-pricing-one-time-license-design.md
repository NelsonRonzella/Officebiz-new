# Pricing Redesign — One-Time License (Phase 1)

**Date:** 2026-04-06
**Status:** Design approved, pending spec review
**Phase:** 1 of 2 (Phase 2 = WhatsApp AI sales automation, separate spec)

## Problem

Current pricing is a R$ 390/mês Stripe subscription with self-serve signup and a trial. We want to switch to:

- **R$ 2.990 one-time payment** granting 2 years of platform access (promo: 3 years as "brinde").
- **No public signup.** Licenciados are onboarded by the admin after talking to a closer on WhatsApp.
- **Trial preserved but gated** — only the admin can create a 7-day trial user.
- **Contract expiration warnings** at 30 / 15 / 7 days before `contractEndsAt`.

Phase 2 (separate spec) will automate the WhatsApp closer with AI. This spec covers only the manual pricing/onboarding changes that Phase 2 will later build on.

## Goals

1. Admin creates a licenciado as either `TRIAL` (7 days) or `PRO` (contract in months).
2. Admin generates a Stripe one-time payment link to send via WhatsApp.
3. On successful payment, user is set to `PRO` with `contractEndsAt = now + contractDurationMonths`.
4. Landing page removes "Criar conta"; keeps Login + "Falar com especialista" → `https://wa.me/5517997014962`.
5. Pricing section reflects R$ 2.990 / 2 anos (promo 3 anos).
6. Users receive in-app + email + WhatsApp notifications 30/15/7 days before contract expires.
7. `hasAccess()` blocks PRO users whose `contractEndsAt` has passed.

## Non-Goals

- WhatsApp AI sales automation (Phase 2).
- Renewal/upgrade self-serve flow — admin handles renewals manually for now.
- Migrating existing subscription users — there are none in production under the new model; existing test users can be reset manually.
- Refunds / partial refunds.

## Data Model Changes

`prisma/schema.prisma` — `User`:

```prisma
model User {
  // ... existing fields
  plan                    Plan      @default(FREE)
  trialEndsAt             DateTime?

  // NEW
  contractDurationMonths  Int?      // 24 or 36; null for TRIAL/FREE
  contractEndsAt          DateTime? // computed on payment; null until paid
  contractExpiryNotified  Json?     // { "30": true, "15": false, "7": false } — idempotency for cron

  // Stripe fields remain but repurposed for one-time payment
  stripeCustomerId        String?   @unique
  stripeCheckoutSessionId String?   // last generated license checkout session
  stripePaymentIntentId   String?   // set on payment success
  // stripePriceId / stripeSubscriptionId / stripeCurrentPeriodEnd kept for backwards compat, unused going forward
}
```

Migration: `prisma db push` (per project convention).

## Stripe Checkout — One-Time

New function in `lib/stripe.ts`:

```ts
createLicenseCheckoutSession({
  userId,
  userEmail,
  contractDurationMonths, // 24 | 36
}) => { id, url }
```

- `mode: "payment"` (not subscription)
- `line_items`: single price_data with `unit_amount: 299000`, `currency: "brl"`, `product_data.name: "OfficeBiz — Licença ${contractDurationMonths}m"`
- `metadata: { type: "license", userId, contractDurationMonths }`
- `success_url` / `cancel_url`: admin area confirmation page

## Webhook Handler

`app/api/stripe/webhook/route.ts` — `checkout.session.completed`:

Discriminate on `session.metadata.type`:

- `"license"` (new): look up user by `metadata.userId`, set:
  - `plan = "PRO"`
  - `contractDurationMonths = metadata.contractDurationMonths`
  - `contractEndsAt = now + contractDurationMonths` (using date-fns `addMonths`)
  - `stripeCustomerId`, `stripePaymentIntentId`
  - `contractExpiryNotified = {}`
  - Send welcome email + WhatsApp via existing helpers.
- `"order"` (existing order payment flow): unchanged.
- Subscription events (`invoice.payment_succeeded`, `customer.subscription.*`): leave the handlers in place but treat as dead code — no new subscriptions created. Add a comment flagging them for removal after Phase 2 ships.

## Admin — User Form

`components/admin/user-form.tsx`:

When `role === "LICENCIADO"`, show:

- **Plano inicial** select: `TRIAL` | `PRO`
- If `TRIAL`: info text "7 dias grátis a partir de hoje" (`trialEndsAt = now + 7 days`)
- If `PRO`: **Duração do contrato** select: `24 meses` | `36 meses (promo)`
  - On create, user is saved with `plan = PRO`, `contractDurationMonths`, but `contractEndsAt = null` until payment.

After creation, the user edit page shows a **"Gerar link de pagamento"** button (only if `plan === PRO && !contractEndsAt`). Clicking it:

1. Calls `POST /api/admin/users/:id/payment-link`
2. Backend creates Stripe checkout session, saves `stripeCheckoutSessionId`, returns `{ url }`
3. UI shows the URL in a copyable input + "Enviar por WhatsApp" button that opens `https://wa.me/<phone>?text=<encoded message with link>`

## Subscription Gate

`lib/subscription.ts` — `hasAccess(user)`:

```ts
function hasAccess(user) {
  if (user.plan === "FREE") return false
  if (user.plan === "TRIAL") return user.trialEndsAt && user.trialEndsAt > now
  if (user.plan === "PRO")   return user.contractEndsAt && user.contractEndsAt > now
  return false
}
```

Existing callers (`app/api/orders/route.ts` etc.) already use `hasAccess` — no call-site changes.

## Contract Expiry Cron

New route `app/api/cron/contracts-expiring/route.ts` (Vercel Cron, daily 09:00 BRT):

- Query `User` where `plan = PRO` and `contractEndsAt` is within 30 days
- For each, compute days remaining; if it matches 30 / 15 / 7 and not yet notified (`contractExpiryNotified[days] !== true`):
  - Send in-app notification + email + WhatsApp ("Seu contrato expira em X dias. Entre em contato para renovar: wa.me/5517997014962")
  - Set `contractExpiryNotified[days] = true`
- Protected by `CRON_SECRET` header check.

Reuses existing notification infra (`lib/notifications.ts`, `lib/email.ts`, `lib/whatsapp.ts`). Does **not** use `notifyOrderParticipants` (that's order-scoped).

New helper: `lib/contract-notifications.ts` with `notifyContractExpiring(user, daysRemaining)`.

## Landing Page Changes

- `components/landing/header.tsx` / `nav.tsx`: remove "Criar conta" CTA. Keep Login. Add "Falar com especialista" button → `https://wa.me/5517997014962?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20OfficeBiz`.
- `components/landing/hero.tsx` + `cta-final.tsx`: same CTA swap.
- `components/landing/pricing.tsx`: single plan card — "R$ 2.990 / pagamento único / 2 anos de acesso". Badge "Promoção: 3 anos pelo mesmo preço". CTA = "Falar com especialista".
- Remove `/signup` route if it exists, or redirect it to `/` — verify during implementation.

## Error Handling

- Stripe checkout creation failure: admin sees toast error, no user state changes.
- Webhook receives `license` payment for unknown `userId`: log error, return 200 (avoid Stripe retries for impossible recovery).
- Cron double-run in the same day: idempotent via `contractExpiryNotified` flags.
- User already `PRO` with `contractEndsAt` in the past tries to use app: `hasAccess()` returns false → existing 403 paths apply. Frontend needs a "Contrato expirado — fale com um especialista" banner on the dashboard (similar to existing trial-expired banner; reuse the component if present).

## Testing

- Unit: `hasAccess()` — FREE / TRIAL active / TRIAL expired / PRO active / PRO expired / PRO without contractEndsAt.
- Unit: contract end date computation (`addMonths` with edge cases — leap year, end-of-month).
- Manual E2E on preview (master branch):
  1. Admin creates LICENCIADO as PRO / 24m → generates payment link → pays with Stripe test card → user becomes active, `contractEndsAt` is +24 months.
  2. Admin creates LICENCIADO as TRIAL → can log in for 7 days, `hasAccess()` flips false after.
  3. Cron: manually invoke route with a seeded user at T-30 / T-15 / T-7 → notifications fire exactly once each.
  4. Landing page: no signup CTA, WhatsApp link opens correctly.

## Rollout

1. Merge to `master` → deploy to preview → manual E2E above.
2. Merge `master` → `main` → production.
3. No data migration needed (no live paying users yet).

## Open Questions

None — all resolved in brainstorming conversation.
