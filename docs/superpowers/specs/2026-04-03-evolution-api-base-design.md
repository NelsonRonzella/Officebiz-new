# Módulo 1 — Evolution API Base (WhatsApp)
**Data:** 2026-04-03
**Status:** Aprovado
**Acesso ao painel:** ADMIN
**Dependências externas:** Evolution API v2 rodando em Oracle Cloud Free Tier

---

## Visão geral

Integração base com a Evolution API para envio de mensagens WhatsApp. Inclui client library (`lib/whatsapp.ts`), rotas de API para status/envio/QR code, e painel administrativo para verificar conexão, reconectar via QR code e testar envio de mensagens.

Instância **central única** — todas as mensagens saem de um único número WhatsApp da OfficeBiz. Sem webhook (recebimento de mensagens) neste módulo — será adicionado nos módulos 5 e 6 (chatbot IA).

Este módulo é **pré-requisito** para os demais:
- Módulo 2: OTP via WhatsApp (login)
- Módulo 3: Notificações de pedidos via WhatsApp
- Módulo 4: Envio de mensagem para leads
- Módulo 5: Chatbot IA para captação de leads
- Módulo 6: Assistente IA completo

---

## Arquitetura

```
lib/whatsapp.ts  ← client Evolution API
       ↑
       │ importado por módulos 2, 3, 4, 5, 6
       │
[Vercel (Next.js)]
  ├─ app/api/whatsapp/status/route.ts  → GET: checa conexão
  ├─ app/api/whatsapp/send/route.ts    → POST: envio manual (admin)
  └─ app/api/whatsapp/qrcode/route.ts  → GET: QR code para reconectar

[Oracle Cloud VM — Docker]
  └── Evolution API v2
        ├─ REST API → https://evolution.officebiz.com.br
        └─ WhatsApp conectado via QR Code
```

---

## Variáveis de ambiente

```bash
EVOLUTION_API_URL=https://evolution.officebiz.com.br
EVOLUTION_API_KEY=chave-global-da-evolution-api
EVOLUTION_API_INSTANCE=officebiz
WHATSAPP_ADMIN_PHONE=5511999999999
```

---

## Client library — lib/whatsapp.ts

### sendText(phone, message)
Envia mensagem de texto via Evolution API.
- Endpoint: `POST {EVOLUTION_API_URL}/message/sendText/{INSTANCE}`
- Header: `apikey: {EVOLUTION_API_KEY}`
- Body: `{ number: phone, text: message }`
- Retorno: `{ success: boolean, error?: string }`
- Timeout: 10 segundos
- Tratamento: retorna `{ success: false }` em caso de erro (não lança exceção)

### sendMedia(phone, mediaUrl, caption)
Envia imagem/PDF via Evolution API (preparação para futuro).
- Endpoint: `POST {EVOLUTION_API_URL}/message/sendMedia/{INSTANCE}`
- Body: `{ number: phone, mediatype: "image"|"document", media: mediaUrl, caption }`

### checkInstanceStatus()
Verifica se a instância está conectada ao WhatsApp.
- Endpoint: `GET {EVOLUTION_API_URL}/instance/connectionState/{INSTANCE}`
- Retorno: `{ connected: boolean, number?: string }`

### getQrCode()
Obtém QR code para conectar/reconectar a instância.
- Endpoint: `GET {EVOLUTION_API_URL}/instance/connect/{INSTANCE}`
- Retorno: `{ qrcode: string | null }` (base64 da imagem)

---

## Rotas de API

### GET /api/whatsapp/status
- Auth: requireAuth() + ADMIN only
- Chama `checkInstanceStatus()`
- Retorna: `{ connected: boolean, number?: string }`

### POST /api/whatsapp/send
- Auth: requireAuth() + ADMIN only
- Body: `{ phone: string, message: string }`
- Validação Zod: phone min 10 dígitos, message min 1 char
- Chama `sendText(phone, message)`
- Retorna: `{ success: boolean, error?: string }`

### GET /api/whatsapp/qrcode
- Auth: requireAuth() + ADMIN only
- Chama `getQrCode()`
- Retorna: `{ qrcode: string | null }`

---

## Painel administrativo — /admin/whatsapp

### Seção 1: Status da conexão
- Indicador verde/vermelho: "Conectado" ou "Desconectado"
- Número conectado (quando disponível)
- Botão "Verificar status"
- Polling automático a cada 30 segundos quando a página está aberta

### Seção 2: QR Code (quando desconectado)
- Exibe imagem QR code (base64 da Evolution API)
- Botão "Gerar novo QR Code"
- Instruções: "Abra o WhatsApp > Aparelhos conectados > Conectar aparelho"
- QR code atualiza automaticamente (polling 5 segundos enquanto desconectado)

### Seção 3: Teste de envio
- Campo: número de telefone (com máscara brasileira)
- Campo: mensagem de texto (textarea)
- Botão "Enviar mensagem de teste"
- Resultado: toast de sucesso/erro

---

## Arquivos a criar/modificar

### Novos (5 arquivos)

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `lib/whatsapp.ts` | Client Evolution API: sendText, sendMedia, checkInstanceStatus, getQrCode |
| 2 | `app/api/whatsapp/status/route.ts` | GET status da instância (ADMIN) |
| 3 | `app/api/whatsapp/send/route.ts` | POST envio manual (ADMIN) |
| 4 | `app/api/whatsapp/qrcode/route.ts` | GET QR code (ADMIN) |
| 5 | `app/(admin)/admin/whatsapp/page.tsx` | Painel: status + QR + teste |
| 6 | `components/admin/whatsapp-panel.tsx` | Componente do painel WhatsApp |

### Modificados (3 arquivos)

| Arquivo | Mudança |
|---------|---------|
| `lib/permissions.ts` | + `canAccessWhatsApp()` → ADMIN only |
| `components/layout/sidebar.tsx` | + "WhatsApp" com ícone MessageCircle para ADMIN |
| `.env.example` | + EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_API_INSTANCE, WHATSAPP_ADMIN_PHONE |

### Dependências novas
Nenhuma — tudo usa fetch HTTP nativo.

---

## Permissões

```typescript
export function canAccessWhatsApp(role: Role): boolean {
  return role === "ADMIN"
}
```

---

## Infraestrutura necessária (fora do código)

Antes da implementação, o ADMIN precisa:
1. Criar VM Ubuntu no Oracle Cloud Free Tier (ARM Ampere, 4 OCPU, 24GB RAM)
2. Instalar Docker + Docker Compose
3. Subir Evolution API v2 via Docker Compose
4. Configurar DNS `evolution.officebiz.com.br` apontando para o IP da VM
5. Configurar SSL (Caddy ou Nginx + Certbot)
6. Conectar instância via QR Code
7. Copiar API key gerada pela Evolution API para as variáveis de ambiente do Vercel

---

## Fora do escopo deste módulo

- Recebimento de mensagens (webhook) → Módulos 5 e 6
- OTP via WhatsApp → Módulo 2
- Notificações de pedidos → Módulo 3
- Mensagem para leads → Módulo 4
- Chatbot IA → Módulos 5 e 6
- Múltiplas instâncias por licenciado → futuro
