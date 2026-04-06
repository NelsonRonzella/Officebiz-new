# WhatsApp AI Sales Automation (Phase 2)

**Date:** 2026-04-06
**Status:** Design approved, pending spec review
**Phase:** 2 of 2 (Phase 1 = one-time license pricing, shipped in prior spec)
**Depends on:** `2026-04-06-pricing-one-time-license-design.md`

## Problem

Phase 1 replaced the subscription model with a R$ 2.990 one-time license that must go through a human closer on WhatsApp (`wa.me/5517997014962`). This is a bottleneck: every lead needs the owner's attention. We want an AI closer that qualifies leads, answers questions, and generates Stripe payment links automatically — while letting the admin take over at any point.

## Goals

1. Lead clicks "Falar com especialista" on the landing page → AI responds on WhatsApp within seconds.
2. AI qualifies (name, email, business context), explains the offer, and closes deals using function calls.
3. When the AI closes a deal, it creates a `User` (LICENCIADO/PRO) and sends a Stripe payment link automatically.
4. Admin has `/admin/vendas` panel to watch all conversations, take over manually, and see conversion stage.
5. If admin replies from their phone (outside the panel), the system detects it via `fromMe=true` and disables AI for that conversation automatically.
6. Phase 1's Stripe webhook already activates PRO on payment — Phase 2 adds stage update + welcome WhatsApp on top.

## Non-Goals

- Outbound AI (admin-initiated cold messages). Reactive only for MVP.
- Audio / image / document handling. Any non-text message triggers handoff to human.
- Multi-number routing. Single Evolution instance, single phone number.
- Multi-language. PT-BR only.
- Rate limiting / abuse prevention beyond basic dedupe.

## Data Model

Add to `prisma/schema.prisma`:

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
  direction      String            // "IN" | "OUT"
  sender         String            // "LEAD" | "AI" | "ADMIN"
  content        String            @db.Text
  evolutionMsgId String?           @unique
  createdAt      DateTime          @default(now())

  @@index([conversationId, createdAt])
}
```

Add to `User` model:

```prisma
salesConversion SalesConversation? @relation("SalesConversion")
```

Migration: `npx prisma db push`.

## Environment Variables

- `EVOLUTION_WEBHOOK_SECRET` — shared secret, sent by Evolution as `apikey` header.
- `OPENROUTER_API_KEY` — already set (used by `lib/openrouter.ts`).
- `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_API_INSTANCE` — already set.

## Evolution Webhook

`app/api/webhooks/evolution/route.ts` — public POST.

```ts
export async function POST(req: Request) {
  if (req.headers.get("apikey") !== process.env.EVOLUTION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const event = await req.json()
  if (event.event !== "messages.upsert") return NextResponse.json({ ok: true })
  // ... process
}
```

**Processing logic** (per Evolution message upsert):

1. Extract `phone` (E.164, normalize — strip `+`, `@s.whatsapp.net`), `content`, `fromMe`, `evolutionMsgId`, `messageType`.
2. If `messageType` is not `conversation` or `extendedTextMessage` — log as `[{type} recebido]`, disable AI, return 200.
3. Dedupe: if `SalesMessage` with this `evolutionMsgId` exists, return 200.
4. Upsert `SalesConversation` by `phone` (`lastMessageAt = now`).
5. If `fromMe === true`:
   - Create `SalesMessage{ direction:"OUT", sender:"ADMIN", content }`.
   - Set `aiEnabled = false` on the conversation.
   - Return 200.
6. Else (`fromMe === false`):
   - Create `SalesMessage{ direction:"IN", sender:"LEAD", content }`.
   - If `aiEnabled === false` → return 200 (record only, do not reply).
   - Else → fire `handleAiReply(conversationId)` via `.catch(console.error)` (fire-and-forget) and return 200 immediately.

## AI Handler — `lib/sales-ai.ts`

```ts
export async function handleAiReply(conversationId: string) {
  const convo = await db.salesConversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
  })
  if (!convo || !convo.aiEnabled) return

  const messages = buildChatHistory(convo)  // system + history
  const tools = SALES_TOOLS

  const response = await callOpenRouter({ messages, tools })
  await processAssistantResponse(convo, response)
}
```

**`buildChatHistory`** maps:
- 1 system prompt (see below)
- Each `SalesMessage`: LEAD → `role:"user"`, AI → `role:"assistant"`, ADMIN → `role:"assistant"` (so IA sees admin messages as context)

**`callOpenRouter`**:
- Model: `openai/gpt-4o-mini`
- Temperature: `0.4`
- `tools` array with the 3 functions below
- Timeout: 20s via AbortController (matches `lib/openrouter.ts` pattern)

**`processAssistantResponse`**:
- If response contains `tool_calls`, execute each in order (sequential), append results to history, and call OpenRouter again until the assistant returns a plain text message (max 3 tool-call rounds to avoid loops).
- Send the final text via `sendText(phone, content)` and persist `SalesMessage{ direction:"OUT", sender:"AI", content }`.

### System Prompt (PT-BR)

```
Você é o closer de vendas do OfficeBiz, uma plataforma SaaS brasileira para
licenciados que oferecem serviços empresariais (registro de marca no INPI,
consultas, gestão de pedidos) aos seus próprios clientes.

OFERTA:
- R$ 2.990, pagamento único
- 2 anos de acesso completo
- Promoção atual: 3 anos pelo mesmo preço
- Suporte incluso

SEU PAPEL:
- Qualificar o lead: nome, email, cidade, ramo de atuação, dor principal.
- Explicar a plataforma de forma consultiva e direta.
- Responder dúvidas sem inventar. Se não souber, chame handoff_to_human.
- Quando houver intenção clara de compra E você tiver nome + email válido,
  chame generate_payment_link. Nunca gere o link sem confirmar dados primeiro.
- Após gerar o link, envie-o na resposta e diga que o acesso é liberado
  automaticamente após a confirmação do pagamento.

TOM: direto, consultivo, brasileiro. Respostas curtas (2-4 parágrafos no máximo).
Uma pergunta por vez. Sem emoji excessivo (no máximo 1 por mensagem).

REGRAS:
- Nunca minta sobre funcionalidades.
- Nunca negocie o preço.
- Se o lead pedir desconto insistente, chame handoff_to_human.
- Se perguntarem sobre algo fora do OfficeBiz, retome o foco.
```

### Tools

```ts
export const SALES_TOOLS = [
  {
    type: "function",
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
    type: "function",
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
    type: "function",
    function: {
      name: "handoff_to_human",
      description:
        "Transfira para atendimento humano. Use quando o lead pedir algo fora do seu escopo, insistir em desconto, pedir contrato customizado, ou quando você não souber responder.",
      parameters: {
        type: "object",
        required: ["reason"],
        properties: { reason: { type: "string" } },
      },
    },
  },
] as const
```

### Tool Handlers — `lib/sales-ai-tools.ts`

```ts
// update_lead_info
async function toolUpdateLeadInfo(convoId, args) {
  await db.salesConversation.update({
    where: { id: convoId },
    data: {
      leadName: args.leadName ?? undefined,
      leadEmail: args.leadEmail ?? undefined,
      leadCity: args.leadCity ?? undefined,
      stage: args.stage ?? undefined,
    },
  })
  return { ok: true }
}

// generate_payment_link
async function toolGeneratePaymentLink(convoId, args) {
  // Validate email
  if (!/^\S+@\S+\.\S+$/.test(args.leadEmail)) {
    return { ok: false, error: "email inválido" }
  }

  // Reuse existing conversion if any
  const convo = await db.salesConversation.findUnique({ where: { id: convoId } })
  if (convo.convertedUserId) {
    const existing = await db.user.findUnique({
      where: { id: convo.convertedUserId },
      select: { id: true, email: true },
    })
    if (existing) {
      const checkout = await createLicenseCheckoutSession({
        userId: existing.id,
        userEmail: existing.email,
        contractDurationMonths: args.contractDurationMonths,
      })
      return { ok: true, url: checkout.url }
    }
  }

  // Email already exists as a User?
  const existingByEmail = await db.user.findUnique({
    where: { email: args.leadEmail },
  })
  if (existingByEmail) {
    return { ok: false, error: "email já cadastrado, chame handoff_to_human" }
  }

  // Create User
  const user = await db.user.create({
    data: {
      name: args.leadName,
      email: args.leadEmail,
      telefone: convo.phone,
      role: "LICENCIADO",
      plan: "PRO",
      contractDurationMonths: args.contractDurationMonths,
      createdBy: null,
    },
  })

  const checkout = await createLicenseCheckoutSession({
    userId: user.id,
    userEmail: user.email,
    contractDurationMonths: args.contractDurationMonths,
  })

  await db.salesConversation.update({
    where: { id: convoId },
    data: {
      convertedUserId: user.id,
      stripeCheckoutSessionId: checkout.id,
      stage: "AGUARDANDO_PAGAMENTO",
    },
  })

  return { ok: true, url: checkout.url }
}

// handoff_to_human
async function toolHandoffToHuman(convoId, args) {
  await db.salesConversation.update({
    where: { id: convoId },
    data: { aiEnabled: false },
  })
  // Notify all ADMIN users
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
        link: `/admin/vendas/${convoId}`,
      },
    })
  }
  return { ok: true }
}
```

## Stripe Webhook Extension

In `app/api/stripe/webhook/route.ts`, inside the existing `metadata.type === "license"` branch, after updating the User:

```ts
// If this payment came from a sales conversation, update its stage
const convo = await db.salesConversation.findUnique({
  where: { convertedUserId: userId },
})
if (convo) {
  await db.salesConversation.update({
    where: { id: convo.id },
    data: { stage: "PAGO" },
  })
  // Send welcome WhatsApp
  sendText(
    convo.phone,
    `✅ *OfficeBiz* — Pagamento confirmado! Bem-vindo. Acesse: ${process.env.NEXT_PUBLIC_APP_URL}/login`
  ).catch(console.error)
}
```

## Admin Panel — `/admin/vendas`

### List page

`app/(admin)/admin/vendas/page.tsx` (server component, queries DB directly):

- Table columns: Lead (name + phone), Stage (colored badge), AI (icon 🤖/👤), Last message (truncated preview), `lastMessageAt` (relative).
- Filters (query params): `stage`, `aiEnabled`, `search` (matches leadName / phone / leadEmail).
- Ordering: `lastMessageAt DESC`.
- Pagination: 20 per page.

### Detail page

`app/(admin)/admin/vendas/[id]/page.tsx`:

- Header card: phone, name, email, city, stage select (editable by admin), `aiEnabled` toggle, "Abrir WhatsApp" link (`wa.me/<phone>`), button "Devolver à IA" (if `aiEnabled=false`).
- Timeline (client component for updates): message bubbles — IN left (gray), OUT right (primary); badge per sender (LEAD / AI / ADMIN).
- Compose box: textarea + send button. Submitting calls `POST /api/admin/vendas/[id]/send`.
- Auto-refresh: poll `GET /api/admin/vendas/[id]` every 5s while the page is open (simple, no websocket needed for MVP).

### APIs

- `GET /api/admin/vendas` — list with filters, ADMIN only, Zod-validated query params.
- `GET /api/admin/vendas/[id]` — detail + last 100 messages.
- `PATCH /api/admin/vendas/[id]` — update `aiEnabled`, `leadName`, `leadEmail`, `leadCity`, `stage`.
- `POST /api/admin/vendas/[id]/send` — admin sends message: `body: { content }`, disables AI, calls `sendText`, persists `SalesMessage{ direction:"OUT", sender:"ADMIN" }`.

All admin APIs check `session.user.role === "ADMIN"`.

### Sidebar

Add "Vendas" item with `MessageSquare` icon under the admin nav in `components/layout/sidebar.tsx` and `bottom-bar.tsx`.

## Lost-Lead Cron

New cron `app/api/cron/sales-mark-lost/route.ts` (daily at 03:00 UTC):

```ts
// SalesConversations where lastMessageAt < now - 7 days
// AND stage NOT IN (PAGO, AGUARDANDO_PAGAMENTO, PERDIDO)
// → set stage = PERDIDO
```

Add to `vercel.json` crons array.

## Testing

### Unit
- `lib/sales-ai-tools.ts`:
  - `toolUpdateLeadInfo` updates only provided fields.
  - `toolGeneratePaymentLink`: invalid email → error. Existing email → error. Happy path → creates User + checkout, sets convertedUserId.
  - `toolGeneratePaymentLink` called twice on same convo → reuses existing User.
  - `toolHandoffToHuman` disables AI and creates admin notifications.
- Evolution webhook phone normalization (input `+5517999998888@s.whatsapp.net` → `5517999998888`).
- Webhook dedupe by `evolutionMsgId`.

### Manual E2E
1. Send WhatsApp to the Evolution number → conversation created, AI responds.
2. Continue chat until AI generates payment link → verify User created as LICENCIADO/PRO, checkout URL works.
3. Pay with Stripe test card → webhook updates User + convo stage=PAGO, welcome WhatsApp arrives.
4. Reply from your phone mid-conversation → `aiEnabled` flips to false automatically.
5. Open `/admin/vendas/<id>` → send message from panel → arrives at lead's WhatsApp.
6. Click "Devolver à IA" → next lead message triggers AI response.
7. Send audio/image → AI is disabled, logged as `[audio recebido]`.
8. 7-day cron → inactive NOVO/QUALIFICANDO convos → PERDIDO.

## Error Handling Summary

| Scenario | Behavior |
|---|---|
| Webhook without valid secret | 401, log |
| Duplicate webhook event | Dedupe via `evolutionMsgId`, return 200 |
| Non-text message | Log stub message, disable AI, return 200 |
| OpenRouter timeout / error | Log, no OUT message. Next IN triggers retry |
| Tool call loop > 3 rounds | Abort, send generic error "Tive um problema, um humano vai te responder", call `handoff_to_human` |
| `generate_payment_link` invalid email | Tool returns error, IA asks again |
| `generate_payment_link` duplicate email | Tool returns error, IA calls `handoff_to_human` |
| Stripe checkout creation failure | Tool returns error, IA calls `handoff_to_human` |
| Admin sends empty message | 400 |

## File Structure

```
lib/
  sales-ai.ts              # handleAiReply, buildChatHistory, callOpenRouter, processAssistantResponse
  sales-ai-tools.ts        # SALES_TOOLS array, tool handlers
  sales-ai-prompt.ts       # SALES_SYSTEM_PROMPT constant
  sales-phone.ts           # normalizePhone helper (E.164)

app/api/
  webhooks/evolution/route.ts
  admin/vendas/route.ts
  admin/vendas/[id]/route.ts
  admin/vendas/[id]/send/route.ts
  cron/sales-mark-lost/route.ts

app/(admin)/admin/vendas/
  page.tsx
  [id]/page.tsx

components/admin/vendas/
  conversations-table.tsx
  conversation-detail.tsx
  message-bubble.tsx
  compose-box.tsx

prisma/schema.prisma       # modified
app/api/stripe/webhook/route.ts  # modified (welcome on PAGO)
components/layout/sidebar.tsx    # modified (nav item)
components/layout/bottom-bar.tsx # modified (nav item)
vercel.json                # modified (cron)
```

## Rollout

1. Implement all tasks, push to `master` (preview).
2. Configure Evolution webhook URL in Evolution Manager → `https://preview-url/api/webhooks/evolution` with `apikey` = `EVOLUTION_WEBHOOK_SECRET`.
3. Manual E2E from steps above.
4. Merge `master` → `main` for production.
5. Update Evolution webhook to production URL.

## Open Questions

None — all resolved in brainstorming.
