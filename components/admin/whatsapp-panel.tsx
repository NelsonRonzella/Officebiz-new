"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  QrCode,
  Loader2,
  Smartphone,
  Shield,
  Save,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"
import { maskPhone, unmaskPhone } from "@/lib/masks"

interface InstanceStatus {
  connected: boolean
  number?: string
}

export function WhatsAppPanel() {
  const [status, setStatus] = useState<InstanceStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [promptValue, setPromptValue] = useState("")
  const [promptIsDefault, setPromptIsDefault] = useState(false)
  const [promptLoading, setPromptLoading] = useState(true)
  const [promptSaving, setPromptSaving] = useState(false)

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true)
    try {
      const res = await fetch("/api/whatsapp/status")
      if (res.ok) {
        const data: InstanceStatus = await res.json()
        setStatus(data)
        if (data.connected) setQrcode(null)
      }
    } catch {
      setStatus({ connected: false })
    } finally {
      setStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/admin/settings/sales-prompt")
        if (!res.ok) return
        const data: { prompt: string; isDefault: boolean } = await res.json()
        if (cancelled) return
        setPromptValue(data.prompt)
        setPromptIsDefault(data.isDefault)
      } catch {
        // noop
      } finally {
        if (!cancelled) setPromptLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function savePrompt(value: string | null) {
    setPromptSaving(true)
    try {
      const res = await fetch("/api/admin/settings/sales-prompt", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error((data as { error?: string } | null)?.error ?? "Erro ao salvar")
        return
      }
      const data: { prompt: string; isDefault: boolean } = await res.json()
      setPromptValue(data.prompt)
      setPromptIsDefault(data.isDefault)
      toast.success(value === null ? "Padrão restaurado" : "Guardrails salvos")
    } catch {
      toast.error("Erro de conexão com o servidor")
    } finally {
      setPromptSaving(false)
    }
  }

  useEffect(() => {
    if (status?.connected !== false || !qrcode) return
    const interval = setInterval(async () => {
      await fetchStatus()
    }, 5_000)
    return () => clearInterval(interval)
  }, [status?.connected, qrcode, fetchStatus])

  async function handleFetchQr() {
    setQrLoading(true)
    try {
      const res = await fetch("/api/whatsapp/qrcode")
      if (res.ok) {
        const data = await res.json()
        setQrcode(data.qrcode ?? null)
        if (!data.qrcode) {
          toast.error("Não foi possível gerar QR Code. Verifique se a Evolution API está rodando.")
        } else {
          toast.info("QR Code gerado. Escaneie em até 45 segundos.")
        }
      } else {
        toast.error("Erro ao conectar com a Evolution API")
      }
    } catch {
      toast.error("Erro de conexão com o servidor")
    } finally {
      setQrLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim() || !message.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "55" + unmaskPhone(phone), message: message.trim() }),
      })
      if (res.ok) {
        toast.success("Mensagem enviada com sucesso!")
        setMessage("")
      } else {
        const data = await res.json().catch(() => null)
        const errorMsg = (data as { error?: string } | null)?.error
        toast.error(errorMsg ?? "Erro ao enviar mensagem")
        if (res.status === 502 && !errorMsg) {
          await fetchStatus()
        }
      }
    } catch {
      toast.error("Erro de conexão com o servidor")
    } finally {
      setSending(false)
    }
  }

  const isConnected = status?.connected === true

  return (
    <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="size-4" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === null ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : isConnected ? (
                <CheckCircle className="size-5 text-green-500" />
              ) : (
                <XCircle className="size-5 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {status === null
                  ? "Verificando..."
                  : isConnected
                  ? "Conectado"
                  : "Desconectado"}
              </span>
            </div>
            {isConnected && status.number && (
              <Badge variant="outline" className="font-mono text-xs">
                +{status.number}
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            disabled={statusLoading}
            className="w-fit"
          >
            {statusLoading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="size-4 mr-2" />
            )}
            Verificar status
          </Button>

          {!isConnected && status !== null && (
            <div className="border-t pt-4 flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Abra o WhatsApp &gt; Aparelhos conectados &gt; Conectar aparelho
              </p>
              {qrcode ? (
                <div className="flex justify-center rounded-lg bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrcode}
                    alt="QR Code WhatsApp"
                    className="size-48"
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleFetchQr}
                  disabled={qrLoading}
                >
                  {qrLoading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="size-4 mr-2" />
                  )}
                  Gerar QR Code
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="size-4" />
            Teste de Envio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="wpp-phone" className="text-xs text-muted-foreground">
                Número de telefone
              </Label>
              <Input
                id="wpp-phone"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="wpp-message" className="text-xs text-muted-foreground">
                Mensagem
              </Label>
              <Textarea
                id="wpp-message"
                placeholder="Olá! Teste de mensagem do OfficeBiz."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
              />
            </div>
            <Button type="submit" disabled={sending || !isConnected}>
              {sending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              {!isConnected
                ? "WhatsApp desconectado"
                : sending
                ? "Enviando..."
                : "Enviar mensagem de teste"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" />
            Guardrails da IA de Vendas
            {promptIsDefault && (
              <Badge variant="outline" className="text-xs">Padrão</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Este texto define as regras da IA que responde no WhatsApp. Use Markdown livremente. Deixe vazio para usar o padrão.
          </p>
          <Textarea
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            disabled={promptLoading || promptSaving}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Carregando..."
          />
          <div className="flex gap-2">
            <Button
              onClick={() => savePrompt(promptValue)}
              disabled={promptLoading || promptSaving}
            >
              {promptSaving ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Save className="size-4 mr-2" />
              )}
              Salvar
            </Button>
            <Button
              variant="outline"
              onClick={() => savePrompt(null)}
              disabled={promptLoading || promptSaving}
            >
              <RotateCcw className="size-4 mr-2" />
              Restaurar padrão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
