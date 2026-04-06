# WhatsApp AI Sales Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a reactive WhatsApp AI closer that qualifies leads via Evolution API, uses OpenRouter/GPT-4o-mini with function calling to close deals, and exposes an admin panel at `/admin/vendas` for monitoring and manual handoff.

**Architecture:** New Prisma models `SalesConversation` + `SalesMessage`. A public `/api/webhooks/evolution` receives incoming messages, handles dedupe, detects admin handoff via `fromMe`, and dispatches an AI reply handler. The AI handler (`lib/sales-ai.ts`) calls OpenRouter with a sales system prompt and three tools: `update_lead_info`, `generate_payment_link`, `handoff_to_human`. The payment-link tool creates a User + reuses `createLicenseCheckoutSession` from Phase 1. Admin panel uses server components for lists and a polling client component for the live chat detail.

**Tech Stack:** Next.js 16 App Router, Prisma 7, OpenRouter (GPT-4o-mini), Evolution API, Zod, TanStack Query, shadcn/Base UI.

**Spec:** `docs/superpowers/specs/2026-04-06-whatsapp-ai-sales-design.md`
**Depends on:** Phase 1 pricing redesign (shipped)

---

## File Structure

**Lib (backend logic, focused responsibilities):**
- Create: `lib/sales-phone.ts` — `normalizePhone()` E.164 helper
- Create: `lib/sales-ai-prompt.ts` — `SALES_SYSTEM_PROMPT` constant
- Create: `lib/sales-ai-tools.ts` — `SALES_TOOLS` schema + handlers (`toolUpdateLeadInfo`, `toolGeneratePaymentLink`, `toolHandoffToHuman`)
- Create: `lib/sales-ai.ts` — `handleAiReply`, `buildChatHistory`, `callOpenRouter`, `processAssistantResponse`

**Prisma:**
- Modify: `prisma/schema.prisma` — `SalesStage` enum, `SalesConversation`, `SalesMessage`, User relation

**API routes:**
- Create: `app/api/webhooks/evolution/route.ts`
- Create: `app/api/admin/vendas/route.ts`
- Create: `app/api/admin/vendas/[id]/route.ts`
- Create: `app/api/admin/vendas/[id]/send/route.ts`
- Create: `app/api/cron/sales-mark-lost/route.ts`
- Modify: `app/api/stripe/webhook/route.ts` — welcome message + stage=PAGO

**Admin UI:**
- Create: `app/(admin)/admin/vendas/page.tsx`
- Create: `app/(admin)/admin/vendas/[id]/page.tsx`
- Create: `components/admin/vendas/conversations-table.tsx`
- Create: `components/admin/vendas/conversation-detail.tsx` (client, polls)
- Create: `components/admin/vendas/message-bubble.tsx`
- Create: `components/admin/vendas/compose-box.tsx`

**Nav:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/bottom-bar.tsx`

**Cron config:**
- Modify: `vercel.json`

---

## Task 1: Prisma schema — sales models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add SalesStage enum and models**

In `prisma/schema.prisma`, add after the `LeadBuscado` model (end of file):

```prisma
enum SalesStage {
  NOVO
  QUALIFICANDO
  APRESENTADO
  AGUARDANDO_PAGAMENTO
  PAGO
  PERDIDO
}

model SalesConversation {
  id                      String         @id @default(cuid())
  phone                   String         @unique
  leadName                String?
  leadEmail               String?
  leadCity                String?
  stage                   SalesStage     @default(NOVO)
  aiEnabled               Boolean        @default(true)
  lastMessageAt           DateTime       @default(now())
  convertedUserId         String?        @unique
  convertedUser           User?          @relation("SalesConversion", fields: [convertedUserId], references: [id])
  stripeCheckoutSessionId String?
  createdAt               DateTime       @default(now())
  updatedAt               DateTime       @updatedAt
  messages                SalesMessage[]

  @@index([stage, lastMessageAt])
}

model SalesMessage {
  id             String            @id @default(cuid())
  conversationId String
  conversation   SalesConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  direction      String
  sender         String
  content        String            @db.Text
  evolutionMsgId String?           @unique
  createdAt      DateTime          @default(now())

  @@index([conversationId, createdAt])
}
```

- [ ] **Step 2: Add relation on User**

In `model User { ... }`, after `productsPrestador` relation, add:

```prisma
  salesConversion        SalesConversation? @relation("SalesConversion")
```

- [ ] **Step 3: Push schema**

Run: `npx prisma db push`
Expected: "Your database is now in sync with your Prisma schema."

- [ ] **Step 4: Generate client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add SalesConversation and SalesMessage models"
```

---

## Task 2: Phone normalizer

**Files:**
- Create: `lib/sales-phone.ts`

- [ ] **Step 1: Create normalizer**

```ts
// lib/sales-phone.ts
/**
 * Normalize a WhatsApp phone string to E.164 digits only.
 * Examples:
 *   "+5517999998888"            -> "5517999998888"
 *   "5517999998888@s.whatsapp.net" -> "5517999998888"
 *   "(17) 99999-8888" (BR)      -> "5517999998888" (assumes BR if < 11 digits missing country code)
 */
export function normalizePhone(raw: string): string {
  if (!raw) return ""
  // Strip anything after @ (Evolution JID format)
  const base = raw.split("@")[0]
  // Keep only digits
  const digits = base.replace(/\D/g, "")
  // If it looks like a Brazilian number without country code (10 or 11 digits), prepend 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  return digits
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/sales-phone.ts
git commit -m "feat(sales): add phone normalizer"
```

---

## Task 3: Sales system prompt

**Files:**
- Create: `lib/sales-ai-prompt.ts`

- [ ] **Step 1: Create prompt constant**

```ts
// lib/sales-ai-prompt.ts
export const SALES_SYSTEM_PROMPT = `Você é o closer de vendas do OfficeBiz, uma plataforma SaaS brasileira para licenciados que oferecem serviços empresariais (registro de marca no INPI, consultas, gestão de pedidos) aos seus próprios clientes.

OFERTA:
- R$ 2.990, pagamento único
- 2 anos de acesso completo
- Promoção atual: 3 anos pelo mesmo preço
- Suporte incluso

SEU PAPEL:
- Qualificar o lead: nome, email, cidade, ramo de atuação, dor principal.
- Explicar a plataforma de forma consultiva e direta.
- Responder dúvidas sem inventar. Se não souber, chame handoff_to_human.
- Use a tool update_lead_info para registrar dados conforme coleta.
- Quando houver intenção clara de compra E você tiver nome + email válido, chame generate_payment_link. Nunca gere o link sem confirmar os dados primeiro.
- Após gerar o link, envie-o na resposta e diga que o acesso é liberado automaticamente após a confirmação do pagamento.

TOM: direto, consultivo, brasileiro. Respostas curtas (2-4 parágrafos no máximo). Uma pergunta por vez. No máximo 1 emoji por mensagem.

REGRAS:
- Nunca minta sobre funcionalidades.
- Nunca negocie o preço.
- Se o lead pedir desconto insistente, chame handoff_to_human.
- Se o lead pedir contrato customizado ou algo fora do padrão, chame handoff_to_human.
- Se perguntarem sobre algo fora do OfficeBiz, retome o foco educadamente.`
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/sales-ai-prompt.ts
git commit -m "feat(sales): add AI sales system prompt"
```

---

## Task 4: Sales tools — schema + handlers

**Files:**
- Create: `lib/sales-ai-tools.ts`

- [ ] **Step 1: Create tools file**

```ts
// lib/sales-ai-tools.ts
import { db } from "@/lib/db"
import { createLicenseCheckoutSession } from "@/lib/stripe"
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

  // Reuse existing conversion
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
      return { ok: true, url: checkout.url }
    }
  }

  // Email already a User?
  const existingByEmail = await db.user.findUnique({
    where: { email: args.leadEmail },
  })
  if (existingByEmail) {
    return {
      ok: false,
      error: "email já cadastrado — chame handoff_to_human",
    }
  }

  const user = await db.user.create({
    data: {
      name: args.leadName,
      email: args.leadEmail,
      telefone: convo.phone,
      role: "LICENCIADO",
      plan: "PRO",
      contractDurationMonths: months,
    },
  })

  const checkout = await createLicenseCheckoutSession({
    userId: user.id,
    userEmail: user.email,
    contractDurationMonths: months,
  })

  await db.salesConversation.update({
    where: { id: conversationId },
    data: {
      convertedUserId: user.id,
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/sales-ai-tools.ts
git commit -m "feat(sales): add AI tool schemas and handlers"
```

---

## Task 5: AI handler

**Files:**
- Create: `lib/sales-ai.ts`

- [ ] **Step 1: Create handler**

```ts
// lib/sales-ai.ts
import { db } from "@/lib/db"
import { sendText } from "@/lib/whatsapp"
import { SALES_SYSTEM_PROMPT } from "@/lib/sales-ai-prompt"
import { SALES_TOOLS, executeTool } from "@/lib/sales-ai-tools"

const MAX_TOOL_ROUNDS = 3
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string }

interface ToolCall {
  id: string
  type: "function"
  function: { name: string; arguments: string }
}

export async function handleAiReply(conversationId: string): Promise<void> {
  const convo = await db.salesConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  })
  if (!convo || !convo.aiEnabled) return

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY not set")
    return
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SALES_SYSTEM_PROMPT },
    ...convo.messages.map((m): ChatMessage => ({
      role: m.sender === "LEAD" ? "user" : "assistant",
      content: m.content,
    })),
  ]

  try {
    const finalText = await runToolLoop(apiKey, messages, conversationId)
    if (!finalText) return
    await sendText(convo.phone, finalText)
    await db.salesMessage.create({
      data: {
        conversationId,
        direction: "OUT",
        sender: "AI",
        content: finalText,
      },
    })
  } catch (err) {
    console.error("handleAiReply failed:", err)
  }
}

async function runToolLoop(
  apiKey: string,
  messages: ChatMessage[],
  conversationId: string
): Promise<string | null> {
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await callOpenRouter(apiKey, messages)
    const choice = response.choices?.[0]?.message
    if (!choice) return null

    if (choice.tool_calls && choice.tool_calls.length > 0) {
      messages.push({
        role: "assistant",
        content: choice.content ?? null,
        tool_calls: choice.tool_calls,
      })
      for (const call of choice.tool_calls) {
        let parsedArgs: Record<string, unknown> = {}
        try {
          parsedArgs = JSON.parse(call.function.arguments)
        } catch {
          parsedArgs = {}
        }
        const result = await executeTool(conversationId, call.function.name, parsedArgs)
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        })
      }
      continue
    }

    return choice.content ?? null
  }
  return "Tive um problema técnico, um humano vai te responder em breve."
}

async function callOpenRouter(
  apiKey: string,
  messages: ChatMessage[]
): Promise<{
  choices?: Array<{ message: { content: string | null; tool_calls?: ToolCall[] } }>
}> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://officebiz.com.br",
        "X-Title": "OfficeBiz Sales AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
        tools: SALES_TOOLS,
        temperature: 0.4,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`OpenRouter ${res.status}: ${await res.text()}`)
    }
    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/sales-ai.ts
git commit -m "feat(sales): add AI reply handler with tool loop"
```

---

## Task 6: Evolution webhook

**Files:**
- Create: `app/api/webhooks/evolution/route.ts`

- [ ] **Step 1: Create route**

```ts
// app/api/webhooks/evolution/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/sales-phone"
import { handleAiReply } from "@/lib/sales-ai"

export async function POST(req: Request) {
  if (req.headers.get("apikey") !== process.env.EVOLUTION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let event: {
    event?: string
    data?: {
      key?: { id?: string; remoteJid?: string; fromMe?: boolean }
      message?: {
        conversation?: string
        extendedTextMessage?: { text?: string }
        [k: string]: unknown
      }
      messageType?: string
    }
  }
  try {
    event = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  if (event.event !== "messages.upsert") {
    return NextResponse.json({ ok: true })
  }

  const data = event.data
  if (!data?.key?.remoteJid) {
    return NextResponse.json({ ok: true })
  }

  const phone = normalizePhone(data.key.remoteJid)
  if (!phone) return NextResponse.json({ ok: true })

  const evolutionMsgId = data.key.id ?? null
  const fromMe = data.key.fromMe === true

  // Dedupe
  if (evolutionMsgId) {
    const existing = await db.salesMessage.findUnique({
      where: { evolutionMsgId },
    })
    if (existing) return NextResponse.json({ ok: true, deduped: true })
  }

  // Extract text content; non-text types → disable AI
  const messageType = data.messageType ?? ""
  const isText =
    messageType === "conversation" || messageType === "extendedTextMessage"
  const content = isText
    ? data.message?.conversation ??
      data.message?.extendedTextMessage?.text ??
      ""
    : `[${messageType || "mídia"} recebido]`

  // Upsert conversation
  const convo = await db.salesConversation.upsert({
    where: { phone },
    create: {
      phone,
      lastMessageAt: new Date(),
      aiEnabled: isText,
    },
    update: {
      lastMessageAt: new Date(),
      ...(isText ? {} : { aiEnabled: false }),
    },
  })

  // Admin replying from phone → handoff
  if (fromMe) {
    await db.salesMessage.create({
      data: {
        conversationId: convo.id,
        direction: "OUT",
        sender: "ADMIN",
        content,
        evolutionMsgId,
      },
    })
    if (convo.aiEnabled) {
      await db.salesConversation.update({
        where: { id: convo.id },
        data: { aiEnabled: false },
      })
    }
    return NextResponse.json({ ok: true })
  }

  // Lead message
  await db.salesMessage.create({
    data: {
      conversationId: convo.id,
      direction: "IN",
      sender: "LEAD",
      content,
      evolutionMsgId,
    },
  })

  if (!isText) {
    return NextResponse.json({ ok: true })
  }

  const fresh = await db.salesConversation.findUnique({
    where: { id: convo.id },
    select: { aiEnabled: true },
  })
  if (fresh?.aiEnabled) {
    handleAiReply(convo.id).catch((err) =>
      console.error("AI reply failed:", err)
    )
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/api/webhooks/evolution/route.ts
git commit -m "feat(sales): Evolution webhook with AI dispatch"
```

---

## Task 7: Stripe webhook — PAGO + welcome

**Files:**
- Modify: `app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Add sales conversation update inside license branch**

Read `app/api/stripe/webhook/route.ts`. Inside the `metaType === "license"` branch, after `db.user.update({...})`, add:

```ts
// If this payment came from a sales conversation, update its stage
const salesConvo = await db.salesConversation.findUnique({
  where: { convertedUserId: userId },
})
if (salesConvo) {
  await db.salesConversation.update({
    where: { id: salesConvo.id },
    data: { stage: "PAGO" },
  })
  const { sendText } = await import("@/lib/whatsapp")
  sendText(
    salesConvo.phone,
    `✅ *OfficeBiz* — Pagamento confirmado! Bem-vindo. Acesse: ${
      process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"
    }/login`
  ).catch((err) => console.error("welcome WhatsApp failed:", err))
}
```

(The dynamic import avoids adding another top-level import if the file is large — but if `sendText` is already imported, use the existing import instead.)

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/api/stripe/webhook/route.ts
git commit -m "feat(stripe): mark sales convo PAGO + welcome WhatsApp"
```

---

## Task 8: Admin vendas — list API + page

**Files:**
- Create: `app/api/admin/vendas/route.ts`
- Create: `app/(admin)/admin/vendas/page.tsx`
- Create: `components/admin/vendas/conversations-table.tsx`

- [ ] **Step 1: Create GET /api/admin/vendas**

```ts
// app/api/admin/vendas/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Prisma } from "@prisma/client"

export async function GET(req: Request) {
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

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get("stage") || ""
  const aiEnabled = searchParams.get("aiEnabled") || ""
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = 20
  const skip = (page - 1) * limit

  const where: Prisma.SalesConversationWhereInput = {}
  if (stage) where.stage = stage as Prisma.SalesConversationWhereInput["stage"]
  if (aiEnabled === "on") where.aiEnabled = true
  if (aiEnabled === "off") where.aiEnabled = false
  if (search) {
    where.OR = [
      { leadName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { leadEmail: { contains: search, mode: "insensitive" } },
    ]
  }

  const [items, total] = await Promise.all([
    db.salesConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip,
      take: limit,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    db.salesConversation.count({ where }),
  ])

  return NextResponse.json({ items, total, page, limit })
}
```

- [ ] **Step 2: Create list page (server component)**

```tsx
// app/(admin)/admin/vendas/page.tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ConversationsTable } from "@/components/admin/vendas/conversations-table"

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; aiEnabled?: string; search?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const limit = 20
  const skip = (page - 1) * limit

  const where: Parameters<typeof db.salesConversation.findMany>[0] extends
    | { where?: infer W }
    | undefined
    ? W
    : never = {} as never
  const w = where as Record<string, unknown>
  if (params.stage) w.stage = params.stage
  if (params.aiEnabled === "on") w.aiEnabled = true
  if (params.aiEnabled === "off") w.aiEnabled = false
  if (params.search) {
    w.OR = [
      { leadName: { contains: params.search, mode: "insensitive" } },
      { phone: { contains: params.search } },
      { leadEmail: { contains: params.search, mode: "insensitive" } },
    ]
  }

  const [items, total] = await Promise.all([
    db.salesConversation.findMany({
      where: w as never,
      orderBy: { lastMessageAt: "desc" },
      skip,
      take: limit,
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    db.salesConversation.count({ where: w as never }),
  ])

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Vendas</h1>
      <ConversationsTable
        items={items}
        total={total}
        page={page}
        limit={limit}
        filters={{ stage: params.stage, aiEnabled: params.aiEnabled, search: params.search }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Create table component**

```tsx
// components/admin/vendas/conversations-table.tsx
"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Bot, User as UserIcon } from "lucide-react"

interface Message {
  id: string
  content: string
  createdAt: string | Date
}
interface Conversation {
  id: string
  phone: string
  leadName: string | null
  leadEmail: string | null
  stage: string
  aiEnabled: boolean
  lastMessageAt: string | Date
  messages: Message[]
}

const STAGE_COLORS: Record<string, string> = {
  NOVO: "bg-blue-100 text-blue-800",
  QUALIFICANDO: "bg-yellow-100 text-yellow-800",
  APRESENTADO: "bg-purple-100 text-purple-800",
  AGUARDANDO_PAGAMENTO: "bg-orange-100 text-orange-800",
  PAGO: "bg-green-100 text-green-800",
  PERDIDO: "bg-gray-200 text-gray-700",
}

export function ConversationsTable({
  items,
  total,
  page,
  limit,
  filters,
}: {
  items: Conversation[]
  total: number
  page: number
  limit: number
  filters: { stage?: string; aiEnabled?: string; search?: string }
}) {
  const router = useRouter()
  const sp = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/admin/vendas?${params.toString()}`)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Buscar nome, telefone, email"
          defaultValue={filters.search}
          onBlur={(e) => updateFilter("search", e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={filters.stage || "ALL"}
          onValueChange={(v) => updateFilter("stage", v === "ALL" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" label="Todos os stages">Todos os stages</SelectItem>
            <SelectItem value="NOVO" label="Novo">Novo</SelectItem>
            <SelectItem value="QUALIFICANDO" label="Qualificando">Qualificando</SelectItem>
            <SelectItem value="APRESENTADO" label="Apresentado">Apresentado</SelectItem>
            <SelectItem value="AGUARDANDO_PAGAMENTO" label="Aguardando pagamento">Aguardando pagamento</SelectItem>
            <SelectItem value="PAGO" label="Pago">Pago</SelectItem>
            <SelectItem value="PERDIDO" label="Perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.aiEnabled || "ALL"}
          onValueChange={(v) => updateFilter("aiEnabled", v === "ALL" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" label="IA: todas">IA: todas</SelectItem>
            <SelectItem value="on" label="IA ativa">IA ativa</SelectItem>
            <SelectItem value="off" label="IA desligada">IA desligada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="p-3">Lead</th>
              <th className="p-3">Stage</th>
              <th className="p-3">IA</th>
              <th className="p-3">Última mensagem</th>
              <th className="p-3">Quando</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                className="cursor-pointer border-b hover:bg-muted/30"
                onClick={() => router.push(`/admin/vendas/${c.id}`)}
              >
                <td className="p-3">
                  <div className="font-medium">{c.leadName || "Sem nome"}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </td>
                <td className="p-3">
                  <Badge className={STAGE_COLORS[c.stage] || ""}>{c.stage}</Badge>
                </td>
                <td className="p-3">
                  {c.aiEnabled ? (
                    <Bot className="h-4 w-4 text-primary" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </td>
                <td className="p-3 max-w-xs truncate text-muted-foreground">
                  {c.messages[0]?.content || "—"}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(c.lastMessageAt).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Nenhuma conversa
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages} — {total} conversas
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/vendas?${new URLSearchParams({ ...sp, page: String(page - 1) } as Record<string, string>).toString()}`}
                className="rounded border px-3 py-1 text-sm"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/vendas?${new URLSearchParams({ ...sp, page: String(page + 1) } as Record<string, string>).toString()}`}
                className="rounded border px-3 py-1 text-sm"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. If the `where` typing in `page.tsx` is messy, simplify by importing `Prisma` type from `@prisma/client` and declaring `const where: Prisma.SalesConversationWhereInput = {}`.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/vendas/route.ts app/\(admin\)/admin/vendas/page.tsx components/admin/vendas/conversations-table.tsx
git commit -m "feat(admin): sales conversations list page"
```

---

## Task 9: Admin vendas — detail API + page + components

**Files:**
- Create: `app/api/admin/vendas/[id]/route.ts`
- Create: `app/api/admin/vendas/[id]/send/route.ts`
- Create: `app/(admin)/admin/vendas/[id]/page.tsx`
- Create: `components/admin/vendas/conversation-detail.tsx`
- Create: `components/admin/vendas/message-bubble.tsx`
- Create: `components/admin/vendas/compose-box.tsx`

- [ ] **Step 1: Create GET/PATCH /api/admin/vendas/[id]**

```ts
// app/api/admin/vendas/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  return me?.role === "ADMIN" ? session.user.id : null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }
  const { id } = await params
  const convo = await db.salesConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 100 },
    },
  })
  if (!convo) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  }
  return NextResponse.json(convo)
}

const patchSchema = z.object({
  aiEnabled: z.boolean().optional(),
  leadName: z.string().nullable().optional(),
  leadEmail: z.string().nullable().optional(),
  leadCity: z.string().nullable().optional(),
  stage: z
    .enum([
      "NOVO",
      "QUALIFICANDO",
      "APRESENTADO",
      "AGUARDANDO_PAGAMENTO",
      "PAGO",
      "PERDIDO",
    ])
    .optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
  const updated = await db.salesConversation.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json(updated)
}
```

- [ ] **Step 2: Create POST /api/admin/vendas/[id]/send**

```ts
// app/api/admin/vendas/[id]/send/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendText } from "@/lib/whatsapp"

export async function POST(
  req: Request,
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
  const body = await req.json()
  const content = typeof body?.content === "string" ? body.content.trim() : ""
  if (!content) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })
  }

  const convo = await db.salesConversation.findUnique({ where: { id } })
  if (!convo) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  }

  await sendText(convo.phone, content)

  await db.salesConversation.update({
    where: { id },
    data: { aiEnabled: false, lastMessageAt: new Date() },
  })

  const message = await db.salesMessage.create({
    data: {
      conversationId: id,
      direction: "OUT",
      sender: "ADMIN",
      content,
    },
  })

  return NextResponse.json(message)
}
```

- [ ] **Step 3: Create detail page (server → client)**

```tsx
// app/(admin)/admin/vendas/[id]/page.tsx
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ConversationDetail } from "@/components/admin/vendas/conversation-detail"

export default async function VendaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") redirect("/")

  const { id } = await params
  const convo = await db.salesConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 100 } },
  })
  if (!convo) notFound()

  return (
    <div className="p-6">
      <ConversationDetail
        initial={JSON.parse(JSON.stringify(convo))}
      />
    </div>
  )
}
```

- [ ] **Step 4: Create detail client component**

```tsx
// components/admin/vendas/conversation-detail.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, User as UserIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MessageBubble } from "./message-bubble"
import { ComposeBox } from "./compose-box"

interface Message {
  id: string
  direction: string
  sender: string
  content: string
  createdAt: string
}
interface Conversation {
  id: string
  phone: string
  leadName: string | null
  leadEmail: string | null
  leadCity: string | null
  stage: string
  aiEnabled: boolean
  messages: Message[]
}

export function ConversationDetail({ initial }: { initial: Conversation }) {
  const router = useRouter()
  const [convo, setConvo] = useState<Conversation>(initial)

  useEffect(() => {
    const iv = setInterval(async () => {
      const res = await fetch(`/api/admin/vendas/${initial.id}`)
      if (res.ok) {
        const data = await res.json()
        setConvo(data)
      }
    }, 5000)
    return () => clearInterval(iv)
  }, [initial.id])

  async function toggleAi() {
    const res = await fetch(`/api/admin/vendas/${convo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiEnabled: !convo.aiEnabled }),
    })
    if (res.ok) setConvo({ ...convo, aiEnabled: !convo.aiEnabled })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <div className="text-lg font-semibold">
            {convo.leadName || "Sem nome"}
          </div>
          <div className="text-sm text-muted-foreground">
            {convo.phone} {convo.leadEmail && `• ${convo.leadEmail}`}{" "}
            {convo.leadCity && `• ${convo.leadCity}`}
          </div>
          <Badge className="mt-2">{convo.stage}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            {convo.aiEnabled ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
            IA
            <Switch checked={convo.aiEnabled} onCheckedChange={toggleAi} />
          </div>
          <a
            href={`https://wa.me/${convo.phone}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm underline"
          >
            WhatsApp <ExternalLink className="h-3 w-3" />
          </a>
          <Button variant="outline" onClick={() => router.push("/admin/vendas")}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="flex h-[60vh] flex-col rounded-lg border">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {convo.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </div>
        <ComposeBox
          conversationId={convo.id}
          onSent={(msg) =>
            setConvo((c) => ({ ...c, messages: [...c.messages, msg], aiEnabled: false }))
          }
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create message bubble**

```tsx
// components/admin/vendas/message-bubble.tsx
import { cn } from "@/lib/utils"

interface Message {
  id: string
  direction: string
  sender: string
  content: string
  createdAt: string
}

const SENDER_LABEL: Record<string, string> = {
  LEAD: "Lead",
  AI: "🤖 IA",
  ADMIN: "👤 Admin",
}

export function MessageBubble({ message }: { message: Message }) {
  const isIn = message.direction === "IN"
  return (
    <div className={cn("flex", isIn ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-3 py-2 text-sm",
          isIn ? "bg-muted" : "bg-primary text-primary-foreground"
        )}
      >
        <div className="mb-1 text-xs opacity-70">
          {SENDER_LABEL[message.sender] || message.sender} •{" "}
          {new Date(message.createdAt).toLocaleString("pt-BR")}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create compose box**

```tsx
// components/admin/vendas/compose-box.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Message {
  id: string
  direction: string
  sender: string
  content: string
  createdAt: string
}

export function ComposeBox({
  conversationId,
  onSent,
}: {
  conversationId: string
  onSent: (msg: Message) => void
}) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function send() {
    const content = text.trim()
    if (!content) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/vendas/${conversationId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha ao enviar")
      onSent(data)
      setText("")
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 border-t p-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva uma mensagem..."
        className="min-h-[60px] flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
      />
      <Button onClick={send} disabled={loading || !text.trim()}>
        {loading ? "Enviando..." : "Enviar"}
      </Button>
    </div>
  )
}
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. If `Switch` or `Textarea` aren't in `components/ui`, use the project's equivalents — grep for existing usage in `components/` and match.

- [ ] **Step 8: Commit**

```bash
git add app/api/admin/vendas/ app/\(admin\)/admin/vendas/\[id\]/ components/admin/vendas/
git commit -m "feat(admin): sales conversation detail + compose"
```

---

## Task 10: Sidebar + bottom-bar nav item

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/bottom-bar.tsx`

- [ ] **Step 1: Find ADMIN nav items block**

Read both files. Locate the array/list of nav items shown when `role === "ADMIN"`.

- [ ] **Step 2: Add Vendas item**

In each file, add to the ADMIN nav items:

```tsx
import { MessageSquare } from "lucide-react"

// Add to admin items:
{ href: "/admin/vendas", label: "Vendas", icon: MessageSquare }
```

Match the exact shape used by other items (the object key names may differ — replicate them).

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: successful.

- [ ] **Step 4: Commit**

```bash
git add components/layout/sidebar.tsx components/layout/bottom-bar.tsx
git commit -m "feat(nav): add Vendas item to admin navigation"
```

---

## Task 11: Lost-lead cron

**Files:**
- Create: `app/api/cron/sales-mark-lost/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Create cron route**

```ts
// app/api/cron/sales-mark-lost/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const threshold = new Date()
  threshold.setDate(threshold.getDate() - 7)

  const result = await db.salesConversation.updateMany({
    where: {
      lastMessageAt: { lt: threshold },
      stage: { notIn: ["PAGO", "AGUARDANDO_PAGAMENTO", "PERDIDO"] },
    },
    data: { stage: "PERDIDO" },
  })

  return NextResponse.json({ marked: result.count })
}
```

- [ ] **Step 2: Add vercel.json cron entry**

Read `vercel.json` and append to the `crons` array:

```json
{
  "path": "/api/cron/sales-mark-lost",
  "schedule": "0 3 * * *"
}
```

- [ ] **Step 3: Type-check + commit**

```bash
npx tsc --noEmit
git add app/api/cron/sales-mark-lost/route.ts vercel.json
git commit -m "feat(cron): mark inactive sales conversations as PERDIDO"
```

---

## Task 12: Manual E2E verification

- [ ] **Step 1: Configure Evolution webhook**

Go to Evolution Manager → your instance → Webhook settings. Set:
- URL: `https://<preview-url>/api/webhooks/evolution`
- Events: enable `messages.upsert` only
- Headers: `apikey: <EVOLUTION_WEBHOOK_SECRET>`

Add `EVOLUTION_WEBHOOK_SECRET` to the Vercel preview environment.

- [ ] **Step 2: Inbound lead flow**

1. From a second phone, send a WhatsApp message to the Evolution-connected number.
2. In `/admin/vendas` (as admin), confirm a new conversation appeared with stage `NOVO`.
3. Confirm IA replied on the lead's WhatsApp within a few seconds.
4. Continue chatting as the lead until the IA asks for confirmation and calls `generate_payment_link`.
5. Verify: new User created (role LICENCIADO, plan PRO, contractDurationMonths=24), conversation stage=`AGUARDANDO_PAGAMENTO`, `convertedUserId` set, lead received Stripe URL.

- [ ] **Step 3: Payment flow**

1. Open the Stripe URL, pay with test card `4242 4242 4242 4242`.
2. Confirm Stripe webhook fired (Stripe dashboard → events).
3. Conversation stage → `PAGO`. Welcome WhatsApp arrives at lead.
4. New User has `contractEndsAt` ~24 months from now.

- [ ] **Step 4: Admin handoff from phone**

1. In a fresh conversation with a different number, send a lead message.
2. Before IA replies (or after), reply directly from the Evolution-connected phone.
3. Webhook detects `fromMe=true` → `aiEnabled=false`.
4. Confirm next lead message does NOT trigger IA.

- [ ] **Step 5: Admin panel compose + toggle**

1. Open the handoff conversation in `/admin/vendas/<id>`.
2. Send a message from the compose box → lead receives it.
3. Toggle IA back on → next lead message triggers IA reply.

- [ ] **Step 6: Non-text handoff**

1. Lead sends an audio message.
2. Conversation shows `[audio recebido]`, `aiEnabled=false`.

- [ ] **Step 7: Cron**

1. Manually seed a conversation with `lastMessageAt` 8 days ago and stage=QUALIFICANDO.
2. `curl -H "Authorization: Bearer $CRON_SECRET" https://<preview-url>/api/cron/sales-mark-lost`
3. Conversation now has stage=PERDIDO.

- [ ] **Step 8: Deploy + push**

```bash
git push origin master
# merge master → main after verification
```

---

## Self-Review Notes

- **Spec coverage:** Data model (Task 1), phone normalizer (Task 2), prompt (Task 3), tools + handlers (Task 4), AI handler with tool loop (Task 5), Evolution webhook with dedupe + handoff (Task 6), Stripe webhook extension (Task 7), admin list (Task 8), admin detail + compose + APIs (Task 9), nav (Task 10), lost-lead cron (Task 11), E2E (Task 12). ✅
- **Type consistency:** `handleAiReply(conversationId)` same signature across Task 5 (definition) and Task 6 (call site). `executeTool` signature matches across Task 4 and Task 5. Tool handler return type `ToolResult` consistent. `SalesConversation` field names match schema (Task 1) wherever used.
- **Placeholder scan:** No TBDs. Every step has concrete code. Task 10 asks the implementer to match existing shape — that's pattern-matching, not a placeholder.
- **Scope check:** Single spec, single plan. Focused on WhatsApp AI sales. Does not touch Phase 1 files beyond the one-line Stripe webhook extension (Task 7).
