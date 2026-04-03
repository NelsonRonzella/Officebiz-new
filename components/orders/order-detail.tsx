"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Loader2,
  Check,
  ArrowRight,
  Ban,
  RotateCcw,
  UserPlus,
  Send,
  Upload,
  Download,
  Paperclip,
  CreditCard,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

/* ─── STATUS CONFIG ─── */

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  AGUARDANDO_PAGAMENTO: {
    label: "Aguardando Pagamento",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  PAGO: {
    label: "Pago",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  EM_ANDAMENTO: {
    label: "Em Andamento",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  RETORNO: {
    label: "Retorno",
    color: "bg-cyan-100 text-cyan-800 border-cyan-300",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-300",
  },
  CONCLUIDO: {
    label: "Concluído",
    color: "bg-green-100 text-green-800 border-green-300",
  },
}

/* ─── TYPES ─── */

interface OrderStep {
  id: string
  title: string
  description: string
  order: number
  durationDays: number
  startedAt: string | null
  finishedAt: string | null
}

interface OrderDocCategory {
  id: string
  title: string
  description: string
  order: number
  attachments: OrderAttachment[]
}

interface OrderAttachment {
  id: string
  file: string
  fileName: string
  createdAt: string
  user: { id: string; name: string | null }
}

interface OrderMessage {
  id: string
  message: string
  file: string | null
  fileName: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string }
}

interface OrderData {
  id: string
  status: string
  progresso: number
  createdAt: string
  updatedAt: string
  currentStepId: string | null
  user: { id: string; name: string | null; email: string }
  criador: { id: string; name: string | null }
  prestador: { id: string; name: string | null } | null
  product: { id: string; name: string; type: string; price: string }
  steps: OrderStep[]
  documentCategories: OrderDocCategory[]
  messages: OrderMessage[]
}

interface PrestadorOption {
  id: string
  name: string | null
  email: string
}

interface OrderDetailProps {
  order: OrderData
  currentUserRole: string
  currentUserId: string
}

/* ─── HELPERS ─── */

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

/* ─── COMPONENT ─── */

export function OrderDetail({
  order: initialOrder,
  currentUserRole,
  currentUserId,
}: OrderDetailProps) {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Prestador assignment
  const [prestadores, setPrestadores] = useState<PrestadorOption[]>([])
  const [selectedPrestador, setSelectedPrestador] = useState("")
  const [loadingPrestadores, setLoadingPrestadores] = useState(false)

  // Messages
  const [messageText, setMessageText] = useState("")
  const [messageFile, setMessageFile] = useState<File | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // File upload for doc categories
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null)

  const statusCfg = STATUS_CONFIG[order.status]
  const isPontual = order.product.type === "PONTUAL"
  const isRecorrente = order.product.type === "RECORRENTE"
  const isAdmin = currentUserRole === "ADMIN"
  const isLicenciado = currentUserRole === "LICENCIADO"
  const isPrestador = currentUserRole === "PRESTADOR"
  const isCliente = currentUserRole === "CLIENTE"
  const canSendMessage = isAdmin || isLicenciado || isPrestador

  // Load prestadores for admin
  useEffect(() => {
    if (!isAdmin) return
    setLoadingPrestadores(true)
    fetch("/api/users?role=PRESTADOR&limit=100")
      .then((res) => res.json())
      .then((data) => {
        setPrestadores(data.users || [])
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoadingPrestadores(false))
  }, [isAdmin])

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [order.messages])

  async function refreshOrder() {
    try {
      const res = await fetch(`/api/orders/${order.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch {
      /* silent */
    }
  }

  async function handleAction(action: string, body?: Record<string, unknown>) {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/orders/${order.id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Erro ao executar ação")
      }

      toast.success("Ação realizada com sucesso!")
      await refreshOrder()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao executar ação")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleAssignPrestador() {
    if (!selectedPrestador) {
      toast.error("Selecione um prestador.")
      return
    }
    await handleAction("prestador", { prestadorId: selectedPrestador })
    setSelectedPrestador("")
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!messageText.trim() && !messageFile) return

    setSendingMessage(true)
    try {
      const formData = new FormData()
      formData.append("message", messageText.trim())
      if (messageFile) {
        formData.append("file", messageFile)
      }

      const res = await fetch(`/api/orders/${order.id}/mensagem`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Erro ao enviar mensagem")
      }

      setMessageText("")
      setMessageFile(null)
      toast.success("Mensagem enviada!")
      await refreshOrder()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar mensagem")
    } finally {
      setSendingMessage(false)
    }
  }

  async function handleUploadDocument(categoryId: string, file: File) {
    setUploadingCategory(categoryId)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("categoryId", categoryId)

      const res = await fetch(`/api/orders/${order.id}/documento`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Erro ao enviar documento")
      }

      toast.success("Documento enviado!")
      await refreshOrder()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar documento")
    } finally {
      setUploadingCategory(null)
    }
  }

  function getInitial(name: string | null, email: string): string {
    return (name?.[0] || email[0] || "?").toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Pedido
            </h1>
            <span className="font-mono text-sm text-muted-foreground">
              #{order.id.slice(0, 8)}
            </span>
            {statusCfg && (
              <Badge variant="outline" className={statusCfg.color}>
                {statusCfg.label}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground font-medium">{order.product.name}</span>
            <Badge variant="secondary">
              {isPontual ? "Pontual" : "Recorrente"}
            </Badge>
          </div>
          {isPontual && (
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${order.progresso}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {order.progresso}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── INFO CARDS ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-foreground">
              {order.user.name || "—"}
            </p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Licenciado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-foreground">
              {order.criador.name || "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prestador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-foreground">
              {order.prestador?.name || "Não atribuído"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">
              Criado: {dateFormatter.format(new Date(order.createdAt))}
            </p>
            <p className="text-sm text-muted-foreground">
              Atualizado: {dateFormatter.format(new Date(order.updatedAt))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── ACTION BUTTONS ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Admin + AGUARDANDO_PAGAMENTO: Marcar como Pago */}
            {isAdmin && order.status === "AGUARDANDO_PAGAMENTO" && (
              <Button
                onClick={() => handleAction("pago")}
                disabled={actionLoading !== null}
              >
                {actionLoading === "pago" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 size-4" />
                )}
                Marcar como Pago
              </Button>
            )}

            {/* Prestador + PAGO + no prestador: Aceitar Pedido */}
            {isPrestador &&
              order.status === "PAGO" &&
              !order.prestador && (
                <Button
                  onClick={() => handleAction("aceitar")}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "aceitar" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 size-4" />
                  )}
                  Aceitar Pedido
                </Button>
              )}

            {/* Admin/Licenciado/Prestador + EM_ANDAMENTO + PONTUAL: Avançar Etapa */}
            {(isAdmin || isLicenciado || isPrestador) &&
              order.status === "EM_ANDAMENTO" &&
              isPontual && (
                <Button
                  variant="outline"
                  onClick={() => handleAction("avancar")}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "avancar" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 size-4" />
                  )}
                  Avançar Etapa
                </Button>
              )}

            {/* Admin + EM_ANDAMENTO: Concluir */}
            {isAdmin && order.status === "EM_ANDAMENTO" && (
              <Button
                onClick={() => handleAction("concluir")}
                disabled={actionLoading !== null}
              >
                {actionLoading === "concluir" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 size-4" />
                )}
                Concluir
              </Button>
            )}

            {/* Admin + EM_ANDAMENTO: Retorno */}
            {isAdmin && order.status === "EM_ANDAMENTO" && (
              <Button
                variant="outline"
                onClick={() => handleAction("retorno")}
                disabled={actionLoading !== null}
              >
                {actionLoading === "retorno" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 size-4" />
                )}
                Retorno
              </Button>
            )}

            {/* Admin + not CANCELADO/CONCLUIDO: Cancelar */}
            {isAdmin &&
              order.status !== "CANCELADO" &&
              order.status !== "CONCLUIDO" && (
                <Button
                  variant="destructive"
                  onClick={() => handleAction("cancelar")}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "cancelar" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Ban className="mr-2 size-4" />
                  )}
                  Cancelar
                </Button>
              )}
          </div>

          {/* Admin: Atribuir Prestador */}
          {isAdmin && (
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label>Atribuir Prestador</Label>
                <Select
                  value={selectedPrestador}
                  onValueChange={(val) => setSelectedPrestador(val as string)}
                  disabled={loadingPrestadores}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingPrestadores
                          ? "Carregando..."
                          : "Selecione um prestador"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {prestadores.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name || p.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAssignPrestador}
                disabled={!selectedPrestador || actionLoading !== null}
              >
                {actionLoading === "prestador" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 size-4" />
                )}
                Atribuir
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── STEPS SECTION (PONTUAL) ─── */}
      {isPontual && order.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Etapas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {order.steps
                .sort((a, b) => a.order - b.order)
                .map((step, idx) => {
                  const isFinished = !!step.finishedAt
                  const isCurrent = step.id === order.currentStepId
                  const isFuture = !isFinished && !isCurrent

                  return (
                    <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                      {/* Vertical line */}
                      {idx < order.steps.length - 1 && (
                        <div
                          className={`absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 ${
                            isFinished ? "bg-success" : "bg-border"
                          }`}
                        />
                      )}

                      {/* Circle */}
                      <div className="relative z-10 flex-shrink-0">
                        {isFinished ? (
                          <div className="flex size-8 items-center justify-center rounded-full bg-success text-success-foreground">
                            <Check className="size-4" />
                          </div>
                        ) : isCurrent ? (
                          <div className="flex size-8 items-center justify-center rounded-full bg-info text-info-foreground ring-4 ring-info/20">
                            <span className="text-xs font-bold">{step.order}</span>
                          </div>
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <span className="text-xs font-bold">{step.order}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>Prazo: {step.durationDays} dias</span>
                          {step.startedAt && (
                            <span>
                              Iniciado:{" "}
                              {dateFormatter.format(new Date(step.startedAt))}
                            </span>
                          )}
                          {step.finishedAt && (
                            <span>
                              Concluído:{" "}
                              {dateFormatter.format(new Date(step.finishedAt))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── DOCUMENT CATEGORIES (RECORRENTE) ─── */}
      {isRecorrente && order.documentCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={order.documentCategories[0]?.id}>
              <TabsList>
                {order.documentCategories
                  .sort((a, b) => a.order - b.order)
                  .map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id}>
                      {cat.title}
                    </TabsTrigger>
                  ))}
              </TabsList>

              {order.documentCategories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id}>
                  <div className="space-y-4">
                    {cat.description && (
                      <p className="text-sm text-muted-foreground">
                        {cat.description}
                      </p>
                    )}

                    {cat.attachments.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        Nenhum documento enviado nesta categoria.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {cat.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between rounded-lg border border-border p-3"
                          >
                            <div className="flex items-center gap-2">
                              <Paperclip className="size-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">
                                {att.fileName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                por {att.user.name || "Usuário"} em{" "}
                                {dateFormatter.format(new Date(att.createdAt))}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm" render={<a href={att.file} target="_blank" rel="noopener noreferrer" />}>
                              <Download className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload button */}
                    {canSendMessage && (
                      <div>
                        <Label
                          htmlFor={`upload-${cat.id}`}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          {uploadingCategory === cat.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Upload className="size-4" />
                          )}
                          Enviar documento
                        </Label>
                        <input
                          id={`upload-${cat.id}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUploadDocument(cat.id, file)
                            e.target.value = ""
                          }}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* ─── MESSAGES SECTION ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages timeline */}
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {order.messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma mensagem ainda.
              </p>
            ) : (
              order.messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {getInitial(msg.user.name, msg.user.email)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {msg.user.name || msg.user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {dateTimeFormatter.format(new Date(msg.createdAt))}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    {msg.file && msg.fileName && (
                      <a
                        href={msg.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Paperclip className="size-3" />
                        {msg.fileName}
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message form */}
          {canSendMessage && (
            <form
              onSubmit={handleSendMessage}
              className="mt-4 space-y-3 border-t border-border pt-4"
            >
              <Textarea
                placeholder="Escreva uma mensagem..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="message-file"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <Paperclip className="size-3" />
                    {messageFile ? messageFile.name : "Anexar arquivo"}
                  </Label>
                  <input
                    id="message-file"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      setMessageFile(e.target.files?.[0] || null)
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendingMessage || (!messageText.trim() && !messageFile)}
                >
                  {sendingMessage ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  Enviar
                </Button>
              </div>
            </form>
          )}

          {isCliente && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Apenas administradores, licenciados e prestadores podem enviar mensagens.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
