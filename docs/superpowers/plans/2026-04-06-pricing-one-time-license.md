# Pricing Redesign — One-Time License Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch OfficeBiz from R$ 390/mês subscription to a R$ 2.990 one-time license granting 2 or 3 years of access, with admin-managed onboarding and contract-expiry warnings.

**Architecture:** Extend `User` with `contractDurationMonths` / `contractEndsAt` / `contractExpiryNotified`. Add a `createLicenseCheckoutSession` helper (Stripe `mode: "payment"`) and branch the existing webhook on `metadata.type`. Admin UI gains a "Gerar link de pagamento" action. A daily cron checks PRO users approaching expiry and fires notifications via the existing in-app/email/WhatsApp infra. Landing page loses the signup CTA and gains a "Falar com especialista" WhatsApp link.

**Tech Stack:** Next.js 16 App Router, Prisma 7, Stripe, Auth.js v5, Resend, Evolution API, TanStack Query, Zod, date-fns.

**Spec:** `docs/superpowers/specs/2026-04-06-pricing-one-time-license-design.md`

---

## File Structure

**Prisma schema:**
- Modify: `prisma/schema.prisma` — add 3 fields to `User`

**Lib (backend logic):**
- Modify: `lib/stripe.ts` — add `createLicenseCheckoutSession`
- Modify: `lib/subscription.ts` — update `isSubscribed` / `hasAccess` to use `contractEndsAt`
- Create: `lib/contract-notifications.ts` — `notifyContractExpiring(user, days)`
- Modify: `lib/validations.ts` — add `createLicenciadoSchema` fields

**API routes:**
- Modify: `app/api/stripe/webhook/route.ts` — branch on `metadata.type === "license"`
- Create: `app/api/admin/users/[id]/payment-link/route.ts` — POST → returns checkout URL
- Create: `app/api/cron/contracts-expiring/route.ts` — daily job
- Modify: `app/api/admin/users/route.ts` — accept `contractDurationMonths` on create (if form posts it)

**Admin UI:**
- Modify: `components/admin/user-form.tsx` — TRIAL/PRO toggle + contract duration select
- Modify: admin user edit page — "Gerar link de pagamento" button (locate actual file during Task 8)

**Landing:**
- Modify: `components/landing/navbar.tsx` — remove signup, add WhatsApp CTA
- Modify: `components/landing/hero.tsx` — swap CTA
- Modify: `components/landing/cta-final.tsx` — swap CTA
- Modify: `components/landing/pricing.tsx` — single R$ 2.990 card

**Cron config:**
- Modify: `vercel.json` (create if missing) — cron schedule

**Constants:**
- Create: `lib/pricing.ts` — central constants (`LICENSE_PRICE_CENTS`, `CLOSER_WHATSAPP`, `CLOSER_WHATSAPP_URL`)

---

## Task 1: Add pricing constants

**Files:**
- Create: `lib/pricing.ts`

- [ ] **Step 1: Create constants file**

```ts
// lib/pricing.ts
export const LICENSE_PRICE_CENTS = 299000 // R$ 2.990,00
export const LICENSE_PRICE_LABEL = "R$ 2.990"
export const CONTRACT_DURATION_OPTIONS = [24, 36] as const
export type ContractDurationMonths = typeof CONTRACT_DURATION_OPTIONS[number]
export const DEFAULT_CONTRACT_MONTHS: ContractDurationMonths = 24
export const TRIAL_DURATION_DAYS = 7

export const CLOSER_WHATSAPP = "5517997014962"
export const CLOSER_WHATSAPP_URL = `https://wa.me/${CLOSER_WHATSAPP}?text=${encodeURIComponent(
  "Olá, quero saber mais sobre o OfficeBiz"
)}`

export const CONTRACT_EXPIRY_WARNING_DAYS = [30, 15, 7] as const
```

- [ ] **Step 2: Commit**

```bash
git add lib/pricing.ts
git commit -m "feat(pricing): add license pricing constants"
```

---

## Task 2: Prisma schema — add contract fields

**Files:**
- Modify: `prisma/schema.prisma` (User model)

- [ ] **Step 1: Add fields to User model**

In `prisma/schema.prisma`, inside `model User`, after the `stripeCurrentPeriodEnd` line add:

```prisma
  contractDurationMonths  Int?
  contractEndsAt          DateTime?
  contractExpiryNotified  Json?
```

- [ ] **Step 2: Push schema**

Run: `npx prisma db push`
Expected: "Your database is now in sync with your Prisma schema."

- [ ] **Step 3: Regenerate client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add contract fields to User"
```

---

## Task 3: Update `lib/subscription.ts`

**Files:**
- Modify: `lib/subscription.ts`

- [ ] **Step 1: Replace `isSubscribed` and `hasAccess`**

Replace the `isSubscribed` and `hasAccess` functions with:

```ts
export function isSubscribed(
  user: Pick<User, "plan" | "contractEndsAt">
): boolean {
  return (
    user.plan === "PRO" &&
    !!user.contractEndsAt &&
    user.contractEndsAt > new Date()
  )
}

export function hasAccess(
  user: Pick<User, "plan" | "trialEndsAt" | "contractEndsAt">
): boolean {
  return isTrialActive(user) || isSubscribed(user)
}

export function daysUntilContractEnd(
  user: Pick<User, "contractEndsAt">
): number | null {
  if (!user.contractEndsAt) return null
  const diff = user.contractEndsAt.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
```

- [ ] **Step 2: Run type-check**

Run: `npx tsc --noEmit`
Expected: May fail at call sites that pass `stripeCurrentPeriodEnd`. Note each failing file.

- [ ] **Step 3: Fix call sites**

For every file that errors because it passed `stripeCurrentPeriodEnd`, change the selected fields to `contractEndsAt` instead. Typical locations:
- `app/api/orders/route.ts` (user select includes `stripeCurrentPeriodEnd`)
- Any dashboard/page server component querying the user's plan

Example fix pattern (replace in each file):

```ts
select: {
  id: true,
  role: true,
  plan: true,
  trialEndsAt: true,
  contractEndsAt: true, // was: stripeCurrentPeriodEnd
},
```

- [ ] **Step 4: Re-run type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add lib/subscription.ts app/api/orders/route.ts
# plus any other modified files
git commit -m "feat(subscription): gate PRO access on contractEndsAt"
```

---

## Task 4: Add `createLicenseCheckoutSession` to `lib/stripe.ts`

**Files:**
- Modify: `lib/stripe.ts`

- [ ] **Step 1: Append new function**

Add at the bottom of `lib/stripe.ts`:

```ts
import { LICENSE_PRICE_CENTS, type ContractDurationMonths } from "@/lib/pricing"

export async function createLicenseCheckoutSession({
  userId,
  userEmail,
  contractDurationMonths,
}: {
  userId: string
  userEmail: string
  contractDurationMonths: ContractDurationMonths
}) {
  const appUrl = resolveAppUrl()

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `OfficeBiz — Licença ${contractDurationMonths} meses`,
          },
          unit_amount: LICENSE_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "license",
      userId,
      contractDurationMonths: String(contractDurationMonths),
    },
    success_url: `${appUrl}/admin/usuarios/${userId}?payment=success`,
    cancel_url: `${appUrl}/admin/usuarios/${userId}?payment=cancelled`,
  })

  return session
}
```

Place the `import` at the top with the other imports.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/stripe.ts
git commit -m "feat(stripe): add one-time license checkout session"
```

---

## Task 5: Stripe webhook — handle `license` payments

**Files:**
- Modify: `app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Branch on metadata.type in `checkout.session.completed`**

Replace the `case "checkout.session.completed":` block with:

```ts
case "checkout.session.completed": {
  const checkoutSession = event.data.object as Stripe.Checkout.Session
  const metaType = checkoutSession.metadata?.type

  if (metaType === "license") {
    const userId = checkoutSession.metadata?.userId
    const months = parseInt(
      checkoutSession.metadata?.contractDurationMonths || "24",
      10
    )
    if (!userId) break

    const now = new Date()
    const contractEndsAt = new Date(now)
    contractEndsAt.setMonth(contractEndsAt.getMonth() + months)

    await db.user.update({
      where: { id: userId },
      data: {
        plan: "PRO",
        contractDurationMonths: months,
        contractEndsAt,
        contractExpiryNotified: {},
        stripeCustomerId: (checkoutSession.customer as string) || undefined,
        stripePaymentIntentId:
          (checkoutSession.payment_intent as string) || undefined,
      },
    })
    break
  }

  // Existing order payment flow (unchanged)
  const orderId = checkoutSession.metadata?.orderId
  const userId = checkoutSession.metadata?.userId

  if (orderId) {
    await db.order.update({
      where: { id: orderId },
      data: {
        status: "PAGO",
        stripePaymentIntentId:
          checkoutSession.payment_intent as string | null,
      },
    })

    notifyOrderParticipants({
      orderId,
      title: "Pagamento confirmado",
      message: "O pagamento do pedido foi confirmado via Stripe.",
      emailSubject: "Pagamento confirmado — OfficeBiz",
      emailBody:
        "O pagamento do seu pedido foi confirmado. O serviço será iniciado em breve.",
      whatsappMessage: `💰 *OfficeBiz* — Pagamento confirmado para o seu pedido. Acesse: ${
        process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"
      }/app/pedidos/${orderId}`,
    }).catch(console.error)
  } else if (userId) {
    // DEAD CODE: legacy subscription flow. No new subscriptions created.
    // TODO: remove after Phase 2 ships.
  }
  break
}
```

Note the rename from `session` to `checkoutSession` to avoid confusion.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/api/stripe/webhook/route.ts
git commit -m "feat(stripe): handle one-time license payment in webhook"
```

---

## Task 6: Admin user form — TRIAL/PRO toggle + contract duration

**Files:**
- Modify: `components/admin/user-form.tsx`

- [ ] **Step 1: Read current file**

Read `components/admin/user-form.tsx` to locate the LICENCIADO-specific section and find how form state is managed.

- [ ] **Step 2: Add state and fields**

Add to the component state:

```tsx
import {
  CONTRACT_DURATION_OPTIONS,
  DEFAULT_CONTRACT_MONTHS,
  TRIAL_DURATION_DAYS,
} from "@/lib/pricing"

// inside component, with other useState calls:
const [initialPlan, setInitialPlan] = useState<"TRIAL" | "PRO">("PRO")
const [contractMonths, setContractMonths] =
  useState<number>(DEFAULT_CONTRACT_MONTHS)
```

When `role === "LICENCIADO"` and creating (not editing), render after the existing licenciado fields:

```tsx
{role === "LICENCIADO" && !isEditing && (
  <>
    <div>
      <Label>Plano inicial</Label>
      <Select
        value={initialPlan}
        onValueChange={(v) => setInitialPlan(v as "TRIAL" | "PRO")}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TRIAL" label={`Trial (${TRIAL_DURATION_DAYS} dias)`}>
            Trial ({TRIAL_DURATION_DAYS} dias)
          </SelectItem>
          <SelectItem value="PRO" label="PRO (pagamento único)">
            PRO (pagamento único)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    {initialPlan === "PRO" && (
      <div>
        <Label>Duração do contrato</Label>
        <Select
          value={String(contractMonths)}
          onValueChange={(v) => setContractMonths(parseInt(v, 10))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTRACT_DURATION_OPTIONS.map((m) => (
              <SelectItem
                key={m}
                value={String(m)}
                label={`${m} meses${m === 36 ? " (promo)" : ""}`}
              >
                {m} meses{m === 36 ? " (promo)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
  </>
)}
```

- [ ] **Step 3: Include in submit payload**

Where the form posts to the API, include:

```ts
body: JSON.stringify({
  // ...existing fields
  initialPlan: role === "LICENCIADO" ? initialPlan : undefined,
  contractDurationMonths:
    role === "LICENCIADO" && initialPlan === "PRO" ? contractMonths : undefined,
}),
```

Match the exact existing `fetch` structure in the file.

- [ ] **Step 4: Use the correct Select import**

Confirm the file already uses `@base-ui/react/select` style `SelectItem` with `label` prop (per CLAUDE.md pattern). Adapt syntax if the file uses shadcn/ui Select.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add components/admin/user-form.tsx
git commit -m "feat(admin): add plan/contract fields to user form"
```

---

## Task 7: Admin users API — persist plan + contract

**Files:**
- Modify: `app/api/admin/users/route.ts` (POST handler)

- [ ] **Step 1: Read file to find POST handler**

Read `app/api/admin/users/route.ts`. Locate where a LICENCIADO is created.

- [ ] **Step 2: Accept new fields and set plan/trial**

Add to the Zod schema / body parsing:

```ts
initialPlan: z.enum(["TRIAL", "PRO"]).optional(),
contractDurationMonths: z.number().int().refine((v) => v === 24 || v === 36).optional(),
```

In the `db.user.create` data, for LICENCIADO:

```ts
import { TRIAL_DURATION_DAYS } from "@/lib/pricing"

// compute plan state:
let planData: {
  plan: "TRIAL" | "PRO" | "FREE"
  trialEndsAt?: Date | null
  contractDurationMonths?: number | null
} = { plan: "FREE" }

if (body.role === "LICENCIADO") {
  if (body.initialPlan === "TRIAL") {
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS)
    planData = { plan: "TRIAL", trialEndsAt }
  } else {
    // PRO — contract not active until payment
    planData = {
      plan: "PRO",
      contractDurationMonths: body.contractDurationMonths ?? 24,
    }
  }
}

// use `...planData` in the create call
```

Note: `contractEndsAt` stays `null` until payment lands.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/users/route.ts
git commit -m "feat(admin): persist plan and contract on user create"
```

---

## Task 8: "Gerar link de pagamento" API + UI

**Files:**
- Create: `app/api/admin/users/[id]/payment-link/route.ts`
- Modify: admin user edit page (locate in Step 1)

- [ ] **Step 1: Locate the admin user edit page**

Run: `ls app/\(auth\)/admin/usuarios/` (or wherever the admin area lives)
Find the `[id]/page.tsx` or equivalent. Note its path for Step 4.

- [ ] **Step 2: Create POST route**

`app/api/admin/users/[id]/payment-link/route.ts`:

```ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createLicenseCheckoutSession } from "@/lib/stripe"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      plan: true,
      contractDurationMonths: true,
      contractEndsAt: true,
    },
  })
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }
  if (user.plan !== "PRO") {
    return NextResponse.json(
      { error: "Usuário não é PRO" },
      { status: 400 }
    )
  }

  const months =
    user.contractDurationMonths === 24 || user.contractDurationMonths === 36
      ? user.contractDurationMonths
      : 24

  const checkout = await createLicenseCheckoutSession({
    userId: user.id,
    userEmail: user.email,
    contractDurationMonths: months,
  })

  await db.user.update({
    where: { id: user.id },
    data: { stripeCheckoutSessionId: checkout.id },
  })

  return NextResponse.json({ url: checkout.url })
}
```

Note: `stripeCheckoutSessionId` already exists on `Order`, not `User`. If the User model doesn't have it, skip the `db.user.update` — it's not required for functionality.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. If it complains about `stripeCheckoutSessionId` on User, delete that update call.

- [ ] **Step 4: Add UI button to user edit page**

In the edit page located in Step 1, add (inside the form or a sidebar, only when `user.plan === "PRO"`):

```tsx
"use client"
// if the page is a server component, extract this block into a new
// components/admin/generate-payment-link-button.tsx client component
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CLOSER_WHATSAPP } from "@/lib/pricing"

export function GeneratePaymentLinkButton({
  userId,
  userPhone,
}: { userId: string; userPhone: string | null }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/payment-link`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha")
      setUrl(data.url)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const waHref = url
    ? `https://wa.me/${(userPhone || CLOSER_WHATSAPP).replace(/\D/g, "")}?text=${encodeURIComponent(
        `Segue o link de pagamento da sua licença OfficeBiz: ${url}`
      )}`
    : null

  return (
    <div className="space-y-2">
      <Button onClick={generate} disabled={loading}>
        {loading ? "Gerando..." : "Gerar link de pagamento"}
      </Button>
      {url && (
        <>
          <input
            readOnly
            value={url}
            className="w-full rounded border px-2 py-1 text-sm"
            onFocus={(e) => e.currentTarget.select()}
          />
          <a
            href={waHref!}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline"
          >
            Enviar por WhatsApp
          </a>
        </>
      )}
    </div>
  )
}
```

Create this file at `components/admin/generate-payment-link-button.tsx`, then import and render it in the admin user edit page where `user.plan === "PRO"`.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/users/\[id\]/payment-link/route.ts components/admin/generate-payment-link-button.tsx
# plus the edit page file
git commit -m "feat(admin): generate Stripe license payment link"
```

---

## Task 9: Contract expiry notifications helper

**Files:**
- Create: `lib/contract-notifications.ts`

- [ ] **Step 1: Read existing notification helpers**

Read `lib/notifications.ts` (for `createNotification`), `lib/email.ts` (for Resend helper pattern), `lib/whatsapp.ts` (`sendText`). Confirm import names.

- [ ] **Step 2: Create helper**

```ts
// lib/contract-notifications.ts
import { db } from "@/lib/db"
import { sendText } from "@/lib/whatsapp"
import { Resend } from "resend"
import { CLOSER_WHATSAPP } from "@/lib/pricing"

const resend = new Resend(process.env.RESEND_API_KEY)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"

export async function notifyContractExpiring(
  user: { id: string; name: string | null; email: string; telefone: string | null },
  daysRemaining: number
) {
  const title = `Seu contrato expira em ${daysRemaining} dias`
  const message = `Seu contrato OfficeBiz expira em ${daysRemaining} dias. Entre em contato para renovar.`

  // 1) In-app
  await db.notification.create({
    data: {
      userId: user.id,
      title,
      message,
      type: "WARNING",
      link: "/settings/billing",
    },
  })

  // 2) Email
  resend.emails
    .send({
      from: "OfficeBiz <noreply@zella.digital>",
      to: user.email,
      subject: title,
      html: `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1E3A5F;">OfficeBiz</h1>
          <p>${message}</p>
          <p>Fale com um especialista: <a href="https://wa.me/${CLOSER_WHATSAPP}">${CLOSER_WHATSAPP}</a></p>
          <a href="${appUrl}/settings/billing" style="display:inline-block;background:#1E3A5F;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;">Ver detalhes</a>
        </div>
      `,
    })
    .catch((err) => console.error("Email contract expiring failed:", err))

  // 3) WhatsApp
  if (user.telefone) {
    sendText(
      user.telefone,
      `⚠️ *OfficeBiz* — ${message} Fale com um especialista: wa.me/${CLOSER_WHATSAPP}`
    ).catch((err) => console.error("WhatsApp contract expiring failed:", err))
  }
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add lib/contract-notifications.ts
git commit -m "feat(notifications): add contract expiring helper"
```

---

## Task 10: Contract expiry cron route

**Files:**
- Create: `app/api/cron/contracts-expiring/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Create the cron route**

```ts
// app/api/cron/contracts-expiring/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifyContractExpiring } from "@/lib/contract-notifications"
import { CONTRACT_EXPIRY_WARNING_DAYS } from "@/lib/pricing"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const horizon = new Date(now)
  horizon.setDate(horizon.getDate() + 31)

  const users = await db.user.findMany({
    where: {
      plan: "PRO",
      contractEndsAt: { gte: now, lte: horizon },
    },
    select: {
      id: true,
      name: true,
      email: true,
      telefone: true,
      contractEndsAt: true,
      contractExpiryNotified: true,
    },
  })

  let notified = 0

  for (const user of users) {
    if (!user.contractEndsAt) continue
    const daysRemaining = Math.ceil(
      (user.contractEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const match = CONTRACT_EXPIRY_WARNING_DAYS.find((d) => d === daysRemaining)
    if (!match) continue

    const notifiedMap =
      (user.contractExpiryNotified as Record<string, boolean> | null) || {}
    if (notifiedMap[String(match)]) continue

    await notifyContractExpiring(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        telefone: user.telefone,
      },
      match
    )

    await db.user.update({
      where: { id: user.id },
      data: {
        contractExpiryNotified: { ...notifiedMap, [String(match)]: true },
      },
    })
    notified++
  }

  return NextResponse.json({ checked: users.length, notified })
}
```

- [ ] **Step 2: Add vercel.json cron entry**

If `vercel.json` exists, add to `"crons"`. Otherwise create:

```json
{
  "crons": [
    {
      "path": "/api/cron/contracts-expiring",
      "schedule": "0 12 * * *"
    }
  ]
}
```

(12:00 UTC = 09:00 BRT)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/contracts-expiring/route.ts vercel.json
git commit -m "feat(cron): daily contract expiry warnings"
```

---

## Task 11: Landing page — remove signup, add WhatsApp CTA

**Files:**
- Modify: `components/landing/navbar.tsx`
- Modify: `components/landing/hero.tsx`
- Modify: `components/landing/cta-final.tsx`
- Modify: `components/landing/pricing.tsx`

- [ ] **Step 1: Remove signup, add WhatsApp CTA in navbar**

Open `components/landing/navbar.tsx`. Find any `<Link>` or `<Button>` pointing to `/signup` or labeled "Criar conta" / "Cadastrar". Replace with:

```tsx
import { CLOSER_WHATSAPP_URL } from "@/lib/pricing"

<a
  href={CLOSER_WHATSAPP_URL}
  target="_blank"
  rel="noreferrer"
  className="/* copy classes of previous CTA */"
>
  Falar com especialista
</a>
```

Keep the Login link intact.

- [ ] **Step 2: Same swap in hero.tsx and cta-final.tsx**

Repeat Step 1 for `components/landing/hero.tsx` and `components/landing/cta-final.tsx`.

- [ ] **Step 3: Rewrite pricing.tsx**

Read the file first. Replace its plans array / cards with a single card:

```tsx
import { CLOSER_WHATSAPP_URL, LICENSE_PRICE_LABEL } from "@/lib/pricing"

// Inside the component's return — one card:
<div className="rounded-2xl border p-8 text-center">
  <div className="text-sm font-medium uppercase tracking-wide text-primary">
    Licença OfficeBiz
  </div>
  <div className="mt-4 text-5xl font-bold">{LICENSE_PRICE_LABEL}</div>
  <div className="text-sm text-muted-foreground">pagamento único</div>
  <div className="mt-4 text-lg font-semibold">2 anos de acesso</div>
  <div className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
    Promoção: 3 anos pelo mesmo preço
  </div>
  <a
    href={CLOSER_WHATSAPP_URL}
    target="_blank"
    rel="noreferrer"
    className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground"
  >
    Falar com especialista
  </a>
</div>
```

Preserve the existing section wrapper, heading, and layout around the card. Keep Tailwind token usage consistent with the rest of the file.

- [ ] **Step 4: Remove /signup route if it exists**

Run: `ls app/\(public\)/` — if `signup` or `register` dir exists, delete it:
`rm -r app/\(public\)/signup`

- [ ] **Step 5: Build check**

Run: `npm run build`
Expected: successful build.

- [ ] **Step 6: Commit**

```bash
git add components/landing/ app/
git commit -m "feat(landing): replace signup with WhatsApp CTA, new pricing"
```

---

## Task 12: Expired contract banner on dashboard

**Files:**
- Modify: the dashboard layout or page where the trial banner lives (locate in Step 1)

- [ ] **Step 1: Find existing trial banner**

Run: grep for `trialEndsAt` or `isTrialActive` in `components/` and `app/(auth)/`. The file that renders a "trial expira em X dias" banner is where the expired-contract banner should live.

- [ ] **Step 2: Extend banner logic**

Add a sibling conditional for expired PRO contracts:

```tsx
import { CLOSER_WHATSAPP_URL } from "@/lib/pricing"

{user.plan === "PRO" && user.contractEndsAt && user.contractEndsAt < new Date() && (
  <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm">
    <strong>Contrato expirado.</strong> Fale com um especialista para renovar:{" "}
    <a href={CLOSER_WHATSAPP_URL} target="_blank" rel="noreferrer" className="underline">
      WhatsApp
    </a>
  </div>
)}
```

Ensure `contractEndsAt` is selected in whatever query feeds this component.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(dashboard): expired contract banner"
```

---

## Task 13: Manual E2E verification

- [ ] **Step 1: TRIAL flow**

1. Log in as ADMIN.
2. Create a LICENCIADO with plan=TRIAL.
3. Confirm in DB (`npx prisma studio`) that `plan=TRIAL`, `trialEndsAt ≈ now+7d`, `contractDurationMonths=null`.
4. Log in as the new licenciado → dashboard loads. `hasAccess()` returns true.

- [ ] **Step 2: PRO payment flow**

1. Create a LICENCIADO with plan=PRO, 24 months.
2. On edit page, click "Gerar link de pagamento".
3. Open the URL in incognito, pay with Stripe test card `4242 4242 4242 4242`.
4. Verify webhook fires (Stripe dashboard → webhooks → recent events).
5. DB now shows `plan=PRO`, `contractEndsAt ≈ now+24 months`, `contractExpiryNotified={}`.
6. Licenciado can log in and access dashboard.

- [ ] **Step 3: Cron**

1. Manually seed a user with `contractEndsAt` exactly 30 days from now.
2. `curl` the cron route with `Authorization: Bearer $CRON_SECRET`.
3. Check the user received an in-app notification, email, and WhatsApp (if phone set).
4. Run again → should not re-notify (`contractExpiryNotified.30 = true`).

- [ ] **Step 4: Landing**

1. Visit `/` (production build or preview).
2. Confirm no "Criar conta" / "Cadastrar" anywhere.
3. Click "Falar com especialista" → opens `wa.me/5517997014962` with preset text.
4. Pricing section shows R$ 2.990, 2 anos, promo 3 anos badge.

- [ ] **Step 5: Expired contract**

1. Manually set a PRO user's `contractEndsAt` to yesterday.
2. Log in as that user → dashboard shows "Contrato expirado" banner.
3. Order creation API returns 403 (hasAccess false).

- [ ] **Step 6: Final commit & deploy**

```bash
git push origin master
# merge master → main via PR or CLI for production
```

---

## Self-Review Notes

- All spec sections covered: data model (Task 2), checkout (Task 4), webhook (Task 5), admin form (Task 6-7), payment link (Task 8), cron (Task 9-10), landing (Task 11), expired banner (Task 12), subscription gate (Task 3).
- No placeholders. No "TBD".
- `createLicenseCheckoutSession` signature matches between Task 4 and Task 8.
- `contractExpiryNotified` Json shape is consistent between Task 5 (init `{}`), Task 10 (read/write), and Task 2 (schema).
- Non-goals from spec (renewals, migration, refunds) are not in the plan — correct.
