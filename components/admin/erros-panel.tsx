"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface SystemErrorRow {
  id: string
  source: string
  severity: "ERROR" | "WARN"
  message: string
  context: Record<string, unknown> | null
  resolved: boolean
  createdAt: string
}

interface ListResponse {
  items: SystemErrorRow[]
  total: number
  page: number
  pageSize: number
  unresolvedCount: number
}

const SOURCES = [
  "WEBHOOK",
  "AI_REPLY",
  "WHATSAPP_SEND",
  "OPENROUTER",
  "EVOLUTION_CONNECTION",
  "ADMIN_SEND",
  "OTHER",
] as const

const SOURCE_LABELS: Record<string, string> = {
  WEBHOOK: "Webhook",
  AI_REPLY: "IA",
  WHATSAPP_SEND: "Envio WhatsApp",
  OPENROUTER: "OpenRouter",
  EVOLUTION_CONNECTION: "Conexão Evolution",
  ADMIN_SEND: "Envio Admin",
  OTHER: "Outro",
}

const SOURCE_COLORS: Record<string, string> = {
  WEBHOOK: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  AI_REPLY: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  WHATSAPP_SEND: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  OPENROUTER: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200",
  EVOLUTION_CONNECTION: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  ADMIN_SEND: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

export function ErrosPanel() {
  const qc = useQueryClient()
  const [source, setSource] = useState("")
  const [severity, setSeverity] = useState("")
  const [resolved, setResolved] = useState("false")
  const [range, setRange] = useState("7d")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SystemErrorRow | null>(null)

  const params = new URLSearchParams({
    source,
    severity,
    resolved,
    range,
    page: String(page),
  })

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: ["admin-erros", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/erros?${params}`)
      if (!res.ok) throw new Error("Falha ao carregar erros")
      return res.json()
    },
    refetchInterval: 15000,
  })

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const res = await fetch("/api/admin/erros", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, resolved }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-erros"] })
      toast.success("Erro atualizado")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/erros?scope=resolved", { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao limpar")
      return res.json()
    },
    onSuccess: (data: { deleted: number }) => {
      qc.invalidateQueries({ queryKey: ["admin-erros"] })
      toast.success(`${data.deleted} erros resolvidos removidos`)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Origem</label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Severidade</label>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas</option>
              <option value="ERROR">Erro</option>
              <option value="WARN">Aviso</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <select
              value={resolved}
              onChange={(e) => {
                setResolved(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="false">Não resolvidos</option>
              <option value="true">Resolvidos</option>
              <option value="">Todos</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Período</label>
            <select
              value={range}
              onChange={(e) => {
                setRange(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {data && (
              <span className="text-sm text-muted-foreground">
                {data.unresolvedCount} não resolvidos no total
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={cleanupMutation.isPending}
              onClick={() => {
                if (confirm("Remover todos os erros marcados como resolvidos?")) {
                  cleanupMutation.mutate()
                }
              }}
            >
              Limpar resolvidos
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum erro encontrado para os filtros atuais.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-2 p-4 hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={SOURCE_COLORS[row.source] ?? ""}>
                      {SOURCE_LABELS[row.source] ?? row.source}
                    </Badge>
                    {row.severity === "WARN" ? (
                      <Badge variant="secondary">Aviso</Badge>
                    ) : (
                      <Badge variant="destructive">Erro</Badge>
                    )}
                    {row.resolved && <Badge variant="outline">Resolvido</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="break-words text-sm text-foreground">{row.message}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                    Ver contexto
                  </Button>
                  <Button
                    variant={row.resolved ? "outline" : "default"}
                    size="sm"
                    disabled={resolveMutation.isPending}
                    onClick={() =>
                      resolveMutation.mutate({ id: row.id, resolved: !row.resolved })
                    }
                  >
                    {row.resolved ? "Reabrir" : "Resolver"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-3 text-sm">
            <span className="text-muted-foreground">
              Página {page} de {totalPages} — {data.total} erros
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contexto do erro</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-semibold">Mensagem:</span> {selected.message}
              </div>
              <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(selected.context ?? {}, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
