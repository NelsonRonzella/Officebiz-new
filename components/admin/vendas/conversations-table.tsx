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
  createdAt: string
}
interface Conversation {
  id: string
  phone: string
  leadName: string | null
  leadEmail: string | null
  stage: string
  aiEnabled: boolean
  lastMessageAt: string
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
          onValueChange={(v) => updateFilter("stage", !v || v === "ALL" ? "" : v)}
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
          onValueChange={(v) => updateFilter("aiEnabled", !v || v === "ALL" ? "" : v)}
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
                href={`/admin/vendas?${(() => {
                  const p = new URLSearchParams(sp.toString())
                  p.set("page", String(page - 1))
                  return p.toString()
                })()}`}
                className="rounded border px-3 py-1 text-sm"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/vendas?${(() => {
                  const p = new URLSearchParams(sp.toString())
                  p.set("page", String(page + 1))
                  return p.toString()
                })()}`}
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
