import { db } from "@/lib/db"
import {
  createLicenseCheckoutSession,
  createLicenseCheckoutSessionForLead,
  expireCheckoutSessionSafe,
} from "@/lib/stripe"
import type { ContractDurationMonths } from "@/lib/pricing"

export const SALES_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "update_lead_info",
      description: "Registre informações coletadas sobre o lead.",
      parameters: {
        type: "object",
        properties: {
          leadName: { type: "string" },
          leadEmail: { type: "string" },
          leadCity: { type: "string" },
          stage: {
            type: "string",
            enum: ["QUALIFICANDO", "APRESENTADO"],
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generate_payment_link",
      description:
        "Cria o usuário PRO e retorna um link de pagamento Stripe. Use apenas quando o lead demonstrar intenção clara de compra e você tiver nome e email válido.",
      parameters: {
        type: "object",
        required: ["leadName", "leadEmail", "contractDurationMonths"],
        properties: {
          leadName: { type: "string" },
          leadEmail: { type: "string" },
          contractDurationMonths: { type: "number", enum: [24, 36] },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "handoff_to_human",
      description:
        "Transfira para atendimento humano. Use quando o lead pedir algo fora do escopo, insistir em desconto, pedir contrato customizado, ou quando você não souber responder.",
      parameters: {
        type: "object",
        required: ["reason"],
        properties: { reason: { type: "string" } },
      },
    },
  },
]

type ToolResult = { ok: true; [k: string]: unknown } | { ok: false; error: string }

export async function toolUpdateLeadInfo(
  conversationId: string,
  args: {
    leadName?: string
    leadEmail?: string
    leadCity?: string
    stage?: "QUALIFICANDO" | "APRESENTADO"
  }
): Promise<ToolResult> {
  await db.salesConversation.update({
    where: { id: conversationId },
    data: {
      leadName: args.leadName ?? undefined,
      leadEmail: args.leadEmail ?? undefined,
      leadCity: args.leadCity ?? undefined,
      stage: args.stage ?? undefined,
    },
  })
  return { ok: true }
}

export async function toolGeneratePaymentLink(
  conversationId: string,
  args: {
    leadName: string
    leadEmail: string
    contractDurationMonths: number
  }
): Promise<ToolResult> {
  if (!/^\S+@\S+\.\S+$/.test(args.leadEmail)) {
    return { ok: false, error: "email inválido" }
  }
  if (args.contractDurationMonths !== 24 && args.contractDurationMonths !== 36) {
    return { ok: false, error: "contractDurationMonths deve ser 24 ou 36" }
  }
  const months = args.contractDurationMonths as ContractDurationMonths

  const convo = await db.salesConversation.findUnique({
    where: { id: conversationId },
  })
  if (!convo) return { ok: false, error: "conversa não encontrada" }

  // Caso 1: lead já virou User num pagamento anterior (ex: renovação)
  if (convo.convertedUserId) {
    const existing = await db.user.findUnique({
      where: { id: convo.convertedUserId },
      select: { id: true, email: true },
    })
    if (existing) {
      const checkout = await createLicenseCheckoutSession({
        userId: existing.id,
        userEmail: existing.email,
        contractDurationMonths: months,
      })
      await db.salesConversation.update({
        where: { id: conversationId },
        data: { stripeCheckoutSessionId: checkout.id },
      })
      return { ok: true, url: checkout.url }
    }
  }

  // Caso 2: email já pertence a um User existente — handoff
  const existingByEmail = await db.user.findUnique({
    where: { email: args.leadEmail },
  })
  if (existingByEmail) {
    return {
      ok: false,
      error: "email já cadastrado — chame handoff_to_human",
    }
  }

  // Caso 3: lead novo. Expira checkout anterior (se houver) e cria novo.
  // O User só será criado pelo webhook após confirmação do pagamento.
  await expireCheckoutSessionSafe(convo.stripeCheckoutSessionId)

  const checkout = await createLicenseCheckoutSessionForLead({
    conversationId,
    leadName: args.leadName,
    leadEmail: args.leadEmail,
    leadPhone: convo.phone,
    contractDurationMonths: months,
  })

  await db.salesConversation.update({
    where: { id: conversationId },
    data: {
      stripeCheckoutSessionId: checkout.id,
      stage: "AGUARDANDO_PAGAMENTO",
      leadName: args.leadName,
      leadEmail: args.leadEmail,
    },
  })

  return { ok: true, url: checkout.url }
}

export async function toolHandoffToHuman(
  conversationId: string,
  args: { reason: string }
): Promise<ToolResult> {
  await db.salesConversation.update({
    where: { id: conversationId },
    data: { aiEnabled: false },
  })
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  })
  for (const a of admins) {
    await db.notification.create({
      data: {
        userId: a.id,
        title: "Handoff de venda",
        message: `IA pediu atendimento humano: ${args.reason}`,
        type: "WARNING",
        link: `/admin/vendas/${conversationId}`,
      },
    })
  }
  return { ok: true }
}

export async function executeTool(
  conversationId: string,
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  switch (name) {
    case "update_lead_info":
      return toolUpdateLeadInfo(conversationId, args as Parameters<typeof toolUpdateLeadInfo>[1])
    case "generate_payment_link":
      return toolGeneratePaymentLink(
        conversationId,
        args as Parameters<typeof toolGeneratePaymentLink>[1]
      )
    case "handoff_to_human":
      return toolHandoffToHuman(conversationId, args as { reason: string })
    default:
      return { ok: false, error: `unknown tool: ${name}` }
  }
}
