import Stripe from "stripe"
import { LICENSE_PRICE_CENTS, type ContractDurationMonths } from "@/lib/pricing"

// Lazy init proxy pattern — avoids crash when STRIPE_SECRET_KEY is not set at build time
function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  return new Stripe(key, {
    typescript: true,
  })
}

let _stripe: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      _stripe = createStripeClient()
    }
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export async function createCheckoutSession(
  userId: string,
  email: string,
  stripeCustomerId?: string | null
) {
  const appUrl = resolveAppUrl()

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: stripeCustomerId || undefined,
    customer_email: stripeCustomerId ? undefined : email,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID_PRO!,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/settings/billing?checkout=cancelled`,
  })

  return session
}

function resolveAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL
  if (!raw) throw new Error("NEXT_PUBLIC_APP_URL is not set")
  // Ensure protocol is present
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw.replace(/\/$/, "")
  return `https://${raw}`.replace(/\/$/, "")
}

export async function createOrderCheckoutSession({
  orderId,
  productName,
  priceInCents,
  customerEmail,
  appUrl: appUrlOverride,
}: {
  orderId: string
  productName: string
  priceInCents: number
  customerEmail: string
  appUrl?: string
}) {
  const appUrl = appUrlOverride || resolveAppUrl()

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: productName,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
    },
    success_url: `${appUrl}/app/pedidos/${orderId}?payment=success`,
    cancel_url: `${appUrl}/app/pedidos/${orderId}?payment=cancelled`,
  })

  return session
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
  const appUrl = resolveAppUrl()

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/settings/billing`,
  })

  return session
}

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

export async function createLicenseCheckoutSessionForLead({
  conversationId,
  leadName,
  leadEmail,
  leadPhone,
  contractDurationMonths,
}: {
  conversationId: string
  leadName: string
  leadEmail: string
  leadPhone: string
  contractDurationMonths: ContractDurationMonths
}) {
  const appUrl = resolveAppUrl()

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: leadEmail,
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
      type: "license-lead",
      conversationId,
      leadName,
      leadEmail,
      leadPhone,
      contractDurationMonths: String(contractDurationMonths),
    },
    success_url: `${appUrl}/login?checkout=success`,
    cancel_url: `${appUrl}/?checkout=cancelled`,
  })

  return session
}

export async function expireCheckoutSessionSafe(sessionId: string | null | undefined) {
  if (!sessionId) return
  try {
    await stripe.checkout.sessions.expire(sessionId)
  } catch (err) {
    // Sessão pode já estar expirada/completed/inválida — não bloquear
    console.warn("expireCheckoutSessionSafe failed:", (err as Error).message)
  }
}
