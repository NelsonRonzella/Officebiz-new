import { db } from "@/lib/db"
import { sendText } from "@/lib/whatsapp"
import { getSalesSystemPrompt } from "@/lib/app-settings"
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
        model: "google/gemini-2.0-flash-exp:free",
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
