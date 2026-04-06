import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { notifyOrderParticipants } from "@/lib/order-notifications"
import { sendText } from "@/lib/whatsapp"
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
        const checkoutSession = event.data.object as Stripe.Checkout.Session

        if (checkoutSession.metadata?.type === "license-lead") {
          // Lead vindo do chat de vendas — cria o User SOMENTE agora
          const conversationId = checkoutSession.metadata.conversationId
          const leadName = checkoutSession.metadata.leadName ?? ""
          const leadEmail = checkoutSession.metadata.leadEmail ?? ""
          const leadPhone = checkoutSession.metadata.leadPhone ?? ""
          const contractDurationMonths = parseInt(
            checkoutSession.metadata.contractDurationMonths ?? "0",
            10
          )

          // Idempotência: se a conversa já foi convertida, ignora
          const convo = await db.salesConversation.findUnique({
            where: { id: conversationId },
          })
          if (!convo) {
            console.error("license-lead webhook: conversation not found", conversationId)
            break
          }

          let userId = convo.convertedUserId
          if (!userId) {
            // Caso raro: durante o checkout outro fluxo criou o User com esse email
            const existing = await db.user.findUnique({ where: { email: leadEmail } })
            if (existing) {
              userId = existing.id
            } else {
              const contractEndsAt = new Date()
              contractEndsAt.setMonth(contractEndsAt.getMonth() + contractDurationMonths)
              const created = await db.user.create({
                data: {
                  name: leadName,
                  email: leadEmail,
                  telefone: leadPhone,
                  role: "LICENCIADO",
                  plan: "PRO",
                  contractDurationMonths,
                  contractEndsAt,
                  contractExpiryNotified: {},
                  stripeCustomerId: checkoutSession.customer as string | null,
                  stripePaymentIntentId: checkoutSession.payment_intent as string | null,
                },
              })
              userId = created.id
            }
          }

          // Garante dados de pagamento/contrato no User (cobre fluxo idempotente)
          const contractEndsAt = new Date()
          contractEndsAt.setMonth(contractEndsAt.getMonth() + contractDurationMonths)
          await db.user.update({
            where: { id: userId },
            data: {
              plan: "PRO",
              contractDurationMonths,
              contractEndsAt,
              stripeCustomerId: checkoutSession.customer as string | null,
              stripePaymentIntentId: checkoutSession.payment_intent as string | null,
            },
          })

          await db.salesConversation.update({
            where: { id: conversationId },
            data: {
              convertedUserId: userId,
              stage: "PAGO",
            },
          })

          sendText(
            convo.phone,
            `✅ *OfficeBiz* — Pagamento confirmado! Bem-vindo. Acesse: ${
              process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"
            }/login`
          ).catch((err) => console.error("welcome WhatsApp failed:", err))
        } else if (checkoutSession.metadata?.type === "license") {
          // One-time license payment flow
          const userId = checkoutSession.metadata.userId
          const contractDurationMonths = parseInt(
            checkoutSession.metadata.contractDurationMonths ?? "0",
            10
          )

          const contractEndsAt = new Date()
          contractEndsAt.setMonth(contractEndsAt.getMonth() + contractDurationMonths)

          await db.user.update({
            where: { id: userId },
            data: {
              plan: "PRO",
              contractDurationMonths,
              contractEndsAt,
              contractExpiryNotified: {},
              stripeCustomerId: checkoutSession.customer as string,
              stripePaymentIntentId: checkoutSession.payment_intent as string | null,
            },
          })

          const salesConvo = await db.salesConversation.findUnique({
            where: { convertedUserId: userId },
          })
          if (salesConvo) {
            await db.salesConversation.update({
              where: { id: salesConvo.id },
              data: { stage: "PAGO" },
            })
            sendText(
              salesConvo.phone,
              `✅ *OfficeBiz* — Pagamento confirmado! Bem-vindo. Acesse: ${
                process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"
              }/login`
            ).catch((err) => console.error("welcome WhatsApp failed:", err))
          }
        } else {
          const orderId = checkoutSession.metadata?.orderId
          const userId = checkoutSession.metadata?.userId

          if (orderId) {
            // Order payment flow
            await db.order.update({
              where: { id: orderId },
              data: {
                status: "PAGO",
                stripePaymentIntentId: checkoutSession.payment_intent as string | null,
              },
            })

            // Notify all order participants about payment
            notifyOrderParticipants({
              orderId,
              title: "Pagamento confirmado",
              message: "O pagamento do pedido foi confirmado via Stripe.",
              emailSubject: "Pagamento confirmado — OfficeBiz",
              emailBody: "O pagamento do seu pedido foi confirmado. O serviço será iniciado em breve.",
              whatsappMessage: `💰 *OfficeBiz* — Pagamento confirmado para o seu pedido. Acesse: ${process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"}/app/pedidos/${orderId}`,
            }).catch(console.error)
          // DEAD CODE: legacy subscription flow
          } else if (userId) {
            const subscription = await stripe.subscriptions.retrieve(
              checkoutSession.subscription as string
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
                stripeCustomerId: checkoutSession.customer as string,
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: periodEnd,
              },
            })
          }
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
