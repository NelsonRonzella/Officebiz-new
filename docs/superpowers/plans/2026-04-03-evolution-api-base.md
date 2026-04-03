# Módulo 1 — Evolution API Base: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Evolution API as a WhatsApp client library with an admin panel for monitoring connection status, reconnecting via QR code, and testing message delivery.

**Architecture:** A thin `lib/whatsapp.ts` client wraps the Evolution API REST endpoints (sendText, sendMedia, checkInstanceStatus, getQrCode). Three Next.js API routes expose status/send/qrcode to the admin panel. A `"use client"` panel component at `/admin/whatsapp` provides real-time status, QR reconnection, and test send UI.

**Tech Stack:** Next.js 16 App Router, Evolution API v2 REST, Zod validation, shadcn/ui components, Tailwind CSS 4

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `lib/whatsapp.ts` | Evolution API client: sendText, sendMedia, checkInstanceStatus, getQrCode |
| Create | `app/api/whatsapp/status/route.ts` | GET — instance connection status (ADMIN) |
| Create | `app/api/whatsapp/send/route.ts` | POST — send test message (ADMIN) |
| Create | `app/api/whatsapp/qrcode/route.ts` | GET — fetch QR code for reconnection (ADMIN) |
| Create | `components/admin/whatsapp-panel.tsx` | Client component: status card, QR display, test send form |
| Create | `app/(admin)/admin/whatsapp/page.tsx` | Admin page rendering the panel |
| Modify | `lib/permissions.ts` | Add `canAccessWhatsApp()` |
| Modify | `lib/validations.ts` | Add `whatsappSendSchema` |
| Modify | `components/layout/sidebar.tsx` | Add "WhatsApp" menu item for ADMIN |
| Modify | `.env.example` | Add 4 Evolution API env vars |

---

### Task 1: Environment Variables

**Files:**
- Modify: `.env.example`
- Modify: `.env` (local only, not committed)

- [ ] **Step 1: Add env vars to .env.example**

Append to the end of `.env.example`:

```bash
# Evolution API (WhatsApp)
EVOLUTION_API_URL=       # URL da instância Evolution API (ex: https://evolution.officebiz.com.br)
EVOLUTION_API_KEY=       # API key global da Evolution API
EVOLUTION_API_INSTANCE=  # Nome da instância (ex: officebiz)
WHATSAPP_ADMIN_PHONE=    # Telefone do admin para notificações (ex: 5511999999999)
```

- [ ] **Step 2: Add placeholder values to local .env**

Append to `.env`:

```bash
# Evolution API (WhatsApp)
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_API_INSTANCE=officebiz
WHATSAPP_ADMIN_PHONE=
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add Evolution API env vars to .env.example"
```

---

### Task 2: Permissions and Validation

**Files:**
- Modify: `lib/permissions.ts` (add after line 69)
- Modify: `lib/validations.ts` (add at end)

- [ ] **Step 1: Add canAccessWhatsApp to permissions**

Add after the `canAccessBuscadorLeads` function at line 69 in `lib/permissions.ts`:

```typescript
export function canAccessWhatsApp(role: Role): boolean {
  return role === "ADMIN"
}
```

- [ ] **Step 2: Add whatsappSendSchema to validations**

Append to `lib/validations.ts`:

```typescript
// ---------------------------------------------------------------------------
// WhatsApp
// ---------------------------------------------------------------------------
export const whatsappSendSchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(15, "Telefone inválido")),
  message: z.string().min(1, "Mensagem obrigatória").max(4096, "Mensagem muito longa"),
})

export type WhatsAppSendInput = z.infer<typeof whatsappSendSchema>
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/permissions.ts lib/validations.ts
git commit -m "feat(whatsapp): add canAccessWhatsApp permission and send schema"
```

---

### Task 3: WhatsApp Client Library

**Files:**
- Create: `lib/whatsapp.ts`

- [ ] **Step 1: Create the Evolution API client**

Create `lib/whatsapp.ts`:

```typescript
// ---------------------------------------------------------------------------
// Evolution API client — central WhatsApp integration
// ---------------------------------------------------------------------------

interface SendResult {
  success: boolean
  error?: string
}

interface InstanceStatus {
  connected: boolean
  number?: string
}

interface QrCodeResult {
  qrcode: string | null
}

function getConfig() {
  return {
    url: process.env.EVOLUTION_API_URL ?? "",
    key: process.env.EVOLUTION_API_KEY ?? "",
    instance: process.env.EVOLUTION_API_INSTANCE ?? "officebiz",
  }
}

function isConfigured(): boolean {
  const { url, key } = getConfig()
  return Boolean(url && key)
}

async function evolutionFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const { url, key } = getConfig()
  if (!url || !key) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch(`${url}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        ...options.headers,
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return res
  } catch {
    return null
  }
}

export async function sendText(phone: string, message: string): Promise<SendResult> {
  if (!isConfigured()) return { success: false, error: "WhatsApp não configurado" }

  const { instance } = getConfig()
  const res = await evolutionFetch(`/message/sendText/${instance}`, {
    method: "POST",
    body: JSON.stringify({ number: phone, text: message }),
  })

  if (!res) return { success: false, error: "Falha na conexão com Evolution API" }
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    return { success: false, error: `Evolution API: ${res.status} ${body}`.trim() }
  }

  return { success: true }
}

export async function sendMedia(
  phone: string,
  mediaUrl: string,
  caption: string,
  mediatype: "image" | "document" = "image"
): Promise<SendResult> {
  if (!isConfigured()) return { success: false, error: "WhatsApp não configurado" }

  const { instance } = getConfig()
  const res = await evolutionFetch(`/message/sendMedia/${instance}`, {
    method: "POST",
    body: JSON.stringify({ number: phone, mediatype, media: mediaUrl, caption }),
  })

  if (!res) return { success: false, error: "Falha na conexão com Evolution API" }
  if (!res.ok) return { success: false, error: `Evolution API: ${res.status}` }

  return { success: true }
}

export async function checkInstanceStatus(): Promise<InstanceStatus> {
  const { instance } = getConfig()
  const res = await evolutionFetch(`/instance/connectionState/${instance}`)

  if (!res || !res.ok) return { connected: false }

  try {
    const data = await res.json()
    // Evolution API v2 returns { instance: { state: "open" | "close", ... } }
    const state = data?.instance?.state ?? data?.state
    const connected = state === "open"
    const number = data?.instance?.ownerJid?.split("@")?.[0] ?? undefined
    return { connected, number }
  } catch {
    return { connected: false }
  }
}

export async function getQrCode(): Promise<QrCodeResult> {
  const { instance } = getConfig()
  const res = await evolutionFetch(`/instance/connect/${instance}`)

  if (!res || !res.ok) return { qrcode: null }

  try {
    const data = await res.json()
    // Evolution API v2 returns { base64: "data:image/png;base64,..." } or { code: "..." }
    const qrcode = data?.base64 ?? data?.qrcode ?? null
    return { qrcode }
  } catch {
    return { qrcode: null }
  }
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/whatsapp.ts
git commit -m "feat(whatsapp): add Evolution API client library"
```

---

### Task 4: API Routes

**Files:**
- Create: `app/api/whatsapp/status/route.ts`
- Create: `app/api/whatsapp/send/route.ts`
- Create: `app/api/whatsapp/qrcode/route.ts`

- [ ] **Step 1: Create status route**

Create `app/api/whatsapp/status/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessWhatsApp } from "@/lib/permissions"
import { checkInstanceStatus } from "@/lib/whatsapp"

export async function GET() {
  const session = await requireAuth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || !canAccessWhatsApp(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const status = await checkInstanceStatus()
  return NextResponse.json(status)
}
```

- [ ] **Step 2: Create send route**

Create `app/api/whatsapp/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessWhatsApp } from "@/lib/permissions"
import { whatsappSendSchema } from "@/lib/validations"
import { sendText } from "@/lib/whatsapp"

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || !canAccessWhatsApp(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 })
  }

  const parsed = whatsappSendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const result = await sendText(parsed.data.phone, parsed.data.message)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Falha ao enviar" },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Create qrcode route**

Create `app/api/whatsapp/qrcode/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessWhatsApp } from "@/lib/permissions"
import { getQrCode } from "@/lib/whatsapp"

export async function GET() {
  const session = await requireAuth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || !canAccessWhatsApp(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const result = await getQrCode()
  return NextResponse.json(result)
}
```

- [ ] **Step 4: Create directories and run type check**

Run:
```bash
mkdir -p app/api/whatsapp/status app/api/whatsapp/send app/api/whatsapp/qrcode
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add app/api/whatsapp/
git commit -m "feat(whatsapp): add status, send, and qrcode API routes"
```

---

### Task 5: Admin Panel Component

**Files:**
- Create: `components/admin/whatsapp-panel.tsx`

- [ ] **Step 1: Create the panel component**

Create `components/admin/whatsapp-panel.tsx`:

```tsx
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
} from "lucide-react"
import { toast } from "sonner"

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

  // Poll status every 30 seconds
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  // Poll QR code every 5 seconds when disconnected
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
        if (!data.qrcode) toast.error("Não foi possível gerar QR Code")
      }
    } catch {
      toast.error("Erro ao gerar QR Code")
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
        body: JSON.stringify({ phone: phone.trim(), message: message.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Mensagem enviada com sucesso!")
        setMessage("")
      } else {
        toast.error((data as { error?: string }).error ?? "Erro ao enviar")
      }
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setSending(false)
    }
  }

  const isConnected = status?.connected === true

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Status Card */}
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

          {/* QR Code Section (when disconnected) */}
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

      {/* Send Test Card */}
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
                placeholder="5511999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
  )
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/admin/whatsapp-panel.tsx
git commit -m "feat(whatsapp): add admin panel component (status, QR, test send)"
```

---

### Task 6: Admin Page

**Files:**
- Create: `app/(admin)/admin/whatsapp/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/(admin)/admin/whatsapp/page.tsx`:

```tsx
import { WhatsAppPanel } from "@/components/admin/whatsapp-panel"

export default function AdminWhatsAppPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          WhatsApp
        </h1>
        <p className="text-muted-foreground">
          Status da conexão, QR Code e teste de envio de mensagens.
        </p>
      </div>
      <WhatsAppPanel />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(admin\)/admin/whatsapp/page.tsx
git commit -m "feat(whatsapp): add admin WhatsApp page"
```

---

### Task 7: Sidebar Navigation

**Files:**
- Modify: `components/layout/sidebar.tsx`

- [ ] **Step 1: Add MessageCircle to imports**

In `components/layout/sidebar.tsx`, add `MessageCircle` to the lucide-react import (after `MapPin` on line 22):

```typescript
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  User,
  Headphones,
  LogOut,
  Menu,
  Package,
  Video,
  ClipboardList,
  DollarSign,
  Building2,
  Globe,
  ShieldCheck,
  MapPin,
  MessageCircle,
} from "lucide-react"
```

- [ ] **Step 2: Add WhatsApp nav item for ADMIN**

In the `getNavItems` function, add after the "Buscador de Leads" entry in the ADMIN case (after line 54):

```typescript
        { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
```

The ADMIN array should end with:
```typescript
        { label: "Buscador de Leads", href: "/admin/leads", icon: MapPin },
        { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
      ]
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat(whatsapp): add WhatsApp menu item to admin sidebar"
```

---

### Task 8: Final Verification and Deploy

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Verify file structure**

Run:
```bash
ls -la lib/whatsapp.ts
ls -la app/api/whatsapp/*/route.ts
ls -la app/\(admin\)/admin/whatsapp/page.tsx
ls -la components/admin/whatsapp-panel.tsx
```

Expected: All 6 files exist

- [ ] **Step 3: Deploy to Vercel production**

Run:
```bash
npx vercel deploy --prod
```

Expected: Build succeeds, deployed to `officebiz.com.br`

- [ ] **Step 4: Verify in browser**

Navigate to `https://officebiz.com.br/admin/whatsapp` (logged in as ADMIN).
Expected: Panel shows "Desconectado" status (Evolution API not yet running).

---

## Summary of All Files

**Created (6 files):**
1. `lib/whatsapp.ts` — Evolution API client
2. `app/api/whatsapp/status/route.ts` — GET status
3. `app/api/whatsapp/send/route.ts` — POST send
4. `app/api/whatsapp/qrcode/route.ts` — GET QR code
5. `components/admin/whatsapp-panel.tsx` — Admin panel UI
6. `app/(admin)/admin/whatsapp/page.tsx` — Admin page

**Modified (3 files):**
1. `lib/permissions.ts` — +canAccessWhatsApp
2. `lib/validations.ts` — +whatsappSendSchema
3. `components/layout/sidebar.tsx` — +MessageCircle import, +WhatsApp nav item

**Modified (not committed):**
1. `.env.example` — +4 env vars
2. `.env` — +4 env vars (placeholder values)
