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
