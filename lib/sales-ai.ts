import { db } from "@/lib/db"
import { sendText } from "@/lib/whatsapp"
import { getSalesSystemPrompt } from "@/lib/app-settings"
import { SALES_TOOLS, executeTool } from "@/lib/sales-ai-tools"
import { logError } from "@/lib/error-log"

const MAX_TOOL_ROUNDS = 3
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_TIMEOUT_MS = 45_000
const FALLBACK_REPLY =
  "Oi! Recebi sua mensagem e em instantes um atendente vai te responder 🙏"

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

  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    await logError({
      source: "AI_REPLY",
      message: "OPENROUTER_API_KEY não configurada",
      context: { conversationId },
    })
    return
  }

  const systemPrompt = await getSalesSystemPrompt()
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...convo.messages.map((m): ChatMessage => ({
      role: m.sender === "LEAD" ? "user" : "assistant",
      content: m.content,
    })),
  ]

  try {
    const finalText = await runToolLoop(apiKey, messages, conversationId)
    if (!finalText) return
    if (finalText === FALLBACK_REPLY) {
      await sendFallback(convo.id, convo.phone)
      return
    }
    const sendResult = await sendText(convo.phone, finalText)
    if (!sendResult.success) {
      await logError({
        source: "AI_REPLY",
        message: `IA gerou resposta mas o envio falhou: ${sendResult.error}`,
        context: { conversationId, phone: convo.phone, replyPreview: finalText.slice(0, 200) },
      })
      return
    }
    await db.salesMessage.create({
      data: {
        conversationId,
        direction: "OUT",
        sender: "AI",
        content: finalText,
        evolutionMsgId: sendResult.messageId ?? null,
      },
    })
  } catch (err) {
    const e = err as Error
    const isAbort = e.name === "AbortError" || /aborted/i.test(e.message)
    await logError({
      source: "AI_REPLY",
      severity: isAbort ? "WARN" : "ERROR",
      message: `handleAiReply falhou: ${e.message}`,
      context: { conversationId, stack: e.stack?.slice(0, 1000) },
    })
    await sendFallback(conversationId, convo.phone)
  }
}

async function sendFallback(conversationId: string, phone: string): Promise<void> {
  try {
    const sendResult = await sendText(phone, FALLBACK_REPLY)
    if (sendResult.success) {
      await db.salesMessage.create({
        data: {
          conversationId,
          direction: "OUT",
          sender: "AI",
          content: FALLBACK_REPLY,
          evolutionMsgId: sendResult.messageId ?? null,
        },
      })
    }
    await db.salesConversation.update({
      where: { id: conversationId },
      data: { aiEnabled: false },
    })
  } catch (err) {
    await logError({
      source: "AI_REPLY",
      message: `sendFallback falhou: ${(err as Error).message}`,
      context: { conversationId },
    })
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
  return FALLBACK_REPLY
}

async function callOpenRouter(
  apiKey: string,
  messages: ChatMessage[]
): Promise<{
  choices?: Array<{ message: { content: string | null; tool_calls?: ToolCall[] } }>
}> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS)
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
        // Lista 100% free com tool calling. OpenRouter tenta em ordem e
        // cai pro próximo em rate-limit/erro. Sem modelos pagos para não
        // disparar 402 (a conta não tem créditos).
        // Docs: https://openrouter.ai/docs/features/model-routing#fallback-models
        models: [
          "openai/gpt-4o-mini",
          "openrouter/free",
          "openai/gpt-oss-20b:free",
          "minimax/minimax-m2.5:free",
        ],
        messages,
        tools: SALES_TOOLS,
        temperature: 0.4,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text()
      await logError({
        source: "OPENROUTER",
        message: `OpenRouter respondeu ${res.status}`,
        context: { status: res.status, body: body.slice(0, 1000) },
      })
      throw new Error(`OpenRouter ${res.status}: ${body}`)
    }
    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}
