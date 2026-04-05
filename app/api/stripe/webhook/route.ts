import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { createBulkNotifications } from "@/lib/notifications"
import type Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId
        const userId = session.metadata?.userId

        if (orderId) {
          // Order payment flow
          await db.order.update({
            where: { id: orderId },
            data: {
              status: "PAGO",
              stripePaymentIntentId: session.payment_intent as string | null,
            },
          })

          // Notify prestadores that a new paid order is available
          const prestadores = await db.user.findMany({
            where: { role: "PRESTADOR", active: true },
            select: { id: true },
          })
          if (prestadores.length > 0) {
            createBulkNotifications(
              prestadores.map((p) => p.id),
              "Novo pedido disponível",
              "Um novo pedido foi pago e está disponível para execução.",
              "ORDER_UPDATE",
              `/app/pedidos/${orderId}`
            ).catch(console.error)
          }

          // Notify admins
          const admins = await db.user.findMany({
            where: { role: "ADMIN" },
            select: { id: true },
          })
          if (admins.length > 0) {
            createBulkNotifications(
              admins.map((a) => a.id),
              "Pagamento confirmado",
              "Um pedido foi pago e está pronto para execução.",
              "SUCCESS",
              `/app/pedidos/${orderId}`
            ).catch(console.error)
          }
        } else if (userId) {
          // Subscription payment flow
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          let periodEnd: Date | null = null
          if (subscription.latest_invoice) {
            const invoice = await stripe.invoices.retrieve(
              subscription.latest_invoice as string
            )
            if (invoice.period_end) {
              periodEnd = new Date(invoice.period_end * 1000)
            }
          }

          await db.user.update({
            where: { id: userId },
            data: {
              plan: "PRO",
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: periodEnd,
            },
          })
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          typeof invoice.parent?.subscription_details?.subscription === "string"
            ? invoice.parent.subscription_details.subscription
            : null

        if (!subscriptionId) break

        await db.user.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            stripeCurrentPeriodEnd: new Date(invoice.period_end * 1000),
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id

        let periodEnd: Date | null = null
        if (subscription.latest_invoice) {
          const invoice = await stripe.invoices.retrieve(
            subscription.latest_invoice as string
          )
          if (invoice.period_end) {
            periodEnd = new Date(invoice.period_end * 1000)
          }
        }

        await db.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: periodEnd,
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await db.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: "FREE",
            stripePriceId: null,
            stripeSubscriptionId: null,
            stripeCurrentPeriodEnd: null,
          },
        })
        break
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
