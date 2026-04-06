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
          <Button
            variant="outline"
            onClick={async () => {
              if (!confirm("Encerrar a conversa? Todas as mensagens serão apagadas e a IA reassume do zero.")) return
              const res = await fetch(`/api/admin/vendas/${convo.id}/reset`, { method: "POST" })
              if (res.ok) {
                setConvo({ ...convo, messages: [], aiEnabled: true, stage: "NOVO", leadName: null, leadEmail: null, leadCity: null })
              }
            }}
          >
            Encerrar conversa
          </Button>
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
