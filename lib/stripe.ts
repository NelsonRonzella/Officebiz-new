import Stripe from "stripe"

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set")

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

export async function createCustomerPortalSession(stripeCustomerId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set")

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/settings/billing`,
  })

  return session
}
