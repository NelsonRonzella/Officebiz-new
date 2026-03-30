# OfficeBiz Onepage Comercial — Design Spec

> **Data:** 2026-03-30 | **Status:** Draft
> **Produto:** Landing page de venda de licença OfficeBiz + Dashboard do licenciado
> **Base:** Boilerplate Manual MVP Generator

---

## 1. Contexto

OfficeBiz é uma plataforma white-label de serviços empresariais. Esta spec cobre a **onepage comercial** (landing page de alta conversão) + **área do licenciado** (dashboard mínimo com onboarding).

O projeto antigo era Laravel + Blade + Tailwind + Alpine.js. O novo projeto será construído do zero usando o boilerplate Next.js.

---

## 2. Decisões de Implementação

| Decisão | Escolha |
|---|---|
| Stack | Next.js 14 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui |
| Auth | Passwordless OTP via email (Resend) — sem magic link, sem Google OAuth |
| Pagamento | Stripe Checkout (assinatura R$ 390/mês) + Customer Portal |
| Banco | PostgreSQL (Neon) via Prisma |
| Hosting | Vercel (free tier) |
| Emails | Resend (OTP + transacionais) |
| Cores | Azul navy primária + verde destaques + cinza neutros |
| Conversão | Formulário de leads + WhatsApp flutuante + Stripe Checkout |
| Dashboard | Mínimo + wizard de onboarding |
| Contato | Placeholders (WhatsApp + domínio) |

---

## 3. Identidade Visual

### Paleta de Cores

```
Primary:     #1E3A5F (Navy Blue — confiança, profissionalismo)
Primary Dark:#0F2439 (Navy escuro — hover, footer)
Accent:      #22C55E (Verde — destaques R$ 0, sucesso)
Accent Dark: #16A34A (Verde escuro — hover)
Warning:     #F59E0B (Amber — trial, alertas)
Background:  #FFFFFF (Branco)
Surface:     #F8FAFC (Cinza claro — seções alternadas)
Foreground:  #0F172A (Texto principal)
Muted:       #64748B (Texto secundário)
Border:      #E2E8F0 (Bordas)
```

### Tipografia

- **Headings:** Inter (bold/semibold)
- **Body:** Inter (regular/medium)
- **Escala:** Sistema do Tailwind (text-sm → text-6xl)

### Design Tokens

Arquivo `design-system/tokens.ts` como fonte única de verdade, seguindo o boilerplate. Script `npm run tokens` gera CSS vars no `globals.css`.

---

## 4. Schema do Banco (Prisma)

### Entidades

```prisma
enum Plan {
  FREE
  TRIAL
  PRO
}

model User {
  id                       String    @id @default(cuid())
  name                     String?
  email                    String    @unique
  emailVerified            DateTime?
  image                    String?
  phone                    String?   // WhatsApp
  companyName              String?   // Nome da empresa do licenciado
  companyLogo              String?   // URL do logo white-label
  onboardingCompleted      Boolean   @default(false)
  plan                     Plan      @default(FREE)
  trialEndsAt              DateTime?
  stripeCustomerId         String?   @unique
  stripePriceId            String?
  stripeSubscriptionId     String?   @unique
  stripeCurrentPeriodEnd   DateTime?
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt
  accounts                 Account[]
  sessions                 Session[]
}

model Account {
  // Padrão Auth.js
}

model Session {
  // Padrão Auth.js
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model Lead {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String   // WhatsApp
  source    String?  // "Como conheceu a OfficeBiz?"
  createdAt DateTime @default(now())
}
```

---

## 5. Autenticação — OTP Passwordless

### Fluxo

1. Usuário digita email na tela de login
2. Sistema gera código OTP de 6 dígitos
3. Código enviado via Resend para o email
4. Usuário digita o código na tela
5. Código validado → sessão criada
6. Primeiro login → plan=TRIAL, trialEndsAt=now+14dias

### Implementação

- **Auth.js v5** com provider customizado de email OTP
- **VerificationToken** armazena o código + expiração (10 min)
- **Tela de login:** campo email → botão "Enviar código" → campo OTP → botão "Entrar"
- **Template de email:** simples, branded, com código em destaque
- **Rate limiting:** máximo 5 tentativas por email por hora

### Tela de Login

```
┌─────────────────────────────────────┐
│         Logo OfficeBiz              │
│                                     │
│   Acesse sua conta                  │
│                                     │
│   Email: [________________]         │
│                                     │
│   [  Enviar código  ]              │
│                                     │
│   ─── ou ───                        │
│                                     │
│   Ainda não é licenciado?           │
│   Conheça nossos planos →           │
└─────────────────────────────────────┘

        ↓ (após enviar)

┌─────────────────────────────────────┐
│   Código enviado para               │
│   seu@email.com                     │
│                                     │
│   [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]
│                                     │
│   [  Verificar  ]                  │
│                                     │
│   Não recebeu? Reenviar (30s)       │
└─────────────────────────────────────┘
```

---

## 6. Landing Page — 10 Seções

### Seção 01 · Hero Banner
- Headline: "Tenha seu próprio negócio de serviços empresariais — sem investimento inicial"
- Subheadline: "Plataforma completa + equipe de especialistas..."
- Badge "R$ 0 de entrada" em verde
- Selo "Zero taxa de licença · Zero setup · Zero treinamento"
- CTA primário: "Quero minha licença →" (scroll para checkout/formulário)
- CTA secundário: "Veja como funciona ↓"
- Background: gradiente sutil azul navy → branco
- Animação fade-in + slide-up nos textos

### Seção 02 · O que é OfficeBiz?
- Diagrama de fluxo: LICENCIADO → PLATAFORMA → ESPECIALISTAS → CLIENTE FINAL
- Horizontal no desktop, vertical no mobile
- Ícones em cada etapa, cards conectados por linha

### Seção 03 · Serviços
- Grid 4x2 (desktop) / 2x4 (tablet) / 1x8 (mobile)
- 8 cards: CNPJ, Contabilidade, Marca, Logotipos, Papelaria, Sites, Email/Domínios, Cartão Virtual
- Ícones consistentes (Lucide Icons — já incluídos no shadcn/ui)
- Hover expande descrição adicional
- Fundo Surface (#F8FAFC)

### Seção 04 · Como Funciona
- 3 passos com números grandes, ícones, título + descrição
- Linha conectora horizontal (desktop) / vertical (mobile)
- Animação sequencial ao scroll

### Seção 05 · Vantagens
- Grid 3x2 (desktop) / 2x3 (mobile)
- 6 cards: Zero investimento, Ganhe em cada venda, Equipe inclusa, Escalável, White-label, Suporte dedicado
- Cards com borda sutil e ícone colorido

### Seção 06 · Precificação
- Bloco visual: 3x "R$ 0" em verde com check animado
- Valor R$ 390/mês em destaque (azul, bold, grande)
- Badge: "Cancele quando quiser"
- CTA: "Começar agora — R$ 0 de entrada"

### Seção 07 · Depoimentos
- Carrossel 3 depoimentos (mockups iniciais)
- Foto avatar + nome + cargo + cidade + estrelas
- Autoplay + navegação manual (dots)

### Seção 08 · FAQ
- Accordion/collapse com shadcn/ui
- 8 perguntas conforme PRD
- Animação suave de expansão

### Seção 09 · CTA Final
- Formulário: Nome, Email, WhatsApp, "Como conheceu?" (select)
- Botão: "Quero ser licenciado →" (salva Lead no banco)
- Botão alternativo: "Falar no WhatsApp" (wa.me)
- Botão Stripe: "Ativar licença agora — R$ 0 de entrada"
- Fundo azul escuro, texto branco
- Badges: "Cancele quando quiser" + "Suporte incluso"

### Seção 10 · Footer
- Logo + links (Privacidade, Termos, Contato)
- CNPJ placeholder + redes sociais
- Fundo navy escuro (#0F2439)

### Elementos Globais
- **WhatsApp flutuante:** botão verde fixo no canto inferior direito
- **Navbar:** logo + links âncora (Serviços, Como Funciona, Preços, Contato) + botão "Entrar"
- **Scroll suave** entre seções
- **Animações:** Framer Motion para fade-in on scroll

---

## 7. Dashboard do Licenciado

### Rotas Protegidas

```
/dashboard          → Painel principal
/dashboard/onboarding → Wizard de onboarding (se não completou)
/settings/billing   → Gerenciar assinatura Stripe
/settings/profile   → Dados pessoais
```

### Wizard de Onboarding (3 passos)

**Passo 1 — Seus dados**
- Nome completo, telefone/WhatsApp
- Validação com Zod

**Passo 2 — Sua empresa**
- Nome da empresa (marca white-label)
- Upload do logotipo (opcional)

**Passo 3 — Conclusão**
- Resumo dos dados
- Botão "Começar a usar"
- Marca onboardingCompleted = true

### Dashboard Principal

```
┌─────────────────────────────────────────────────┐
│  Sidebar          │  Conteúdo                   │
│                   │                              │
│  📊 Dashboard     │  Bem-vindo, [Nome]!          │
│  👤 Perfil        │                              │
│  💳 Assinatura    │  ┌─────────┐  ┌─────────┐   │
│  🎧 Suporte      │  │ Plano   │  │ Válido  │   │
│                   │  │ PRO     │  │ até DD  │   │
│  ──────────       │  └─────────┘  └─────────┘   │
│  🚪 Sair         │                              │
│                   │  Trial Banner (se TRIAL)     │
│                   │  "X dias restantes"          │
│                   │  [Fazer upgrade →]           │
│                   │                              │
│                   │  ┌───────────────────────┐   │
│                   │  │ Próximos passos:      │   │
│                   │  │ • Configure seu perfil│   │
│                   │  │ • Explore os serviços │   │
│                   │  │ • Fale com o suporte  │   │
│                   │  └───────────────────────┘   │
└─────────────────────────────────────────────────┘
```

- **Trial Banner:** mostrado quando plan=TRIAL com dias restantes + CTA upgrade
- **Card de plano:** status atual (TRIAL/PRO) + data de validade
- **Próximos passos:** checklist de onboarding/orientação
- **Link suporte:** abre WhatsApp

### Billing Page (/settings/billing)

- Status da assinatura
- Botão "Gerenciar assinatura" → Stripe Customer Portal
- Botão "Fazer upgrade" (se TRIAL) → Stripe Checkout
- Histórico simplificado (via Stripe)

---

## 8. Trial e Assinatura

### Fluxo

1. **Primeiro login** → plan=TRIAL, trialEndsAt = now + 14 dias
2. **Trial ativo** → acesso total + trial banner com countdown
3. **Trial expirado** → bloqueado → redirect para pricing/checkout
4. **Pagou R$ 390/mês** → plan=PRO → acesso total
5. **Cancelou** → acesso até fim do período → volta FREE

### Upgrade durante Trial

- Checkout Stripe SEM `trial_period_days` → cobrança imediata
- Webhook `checkout.session.completed` → plan=PRO
- Pontos de upgrade: billing page + trial banner

---

## 9. Stripe

### Configuração

- **Produto:** "Licença OfficeBiz"
- **Preço:** R$ 390/mês (BRL, recorrente)
- **Modo:** Test mode (inicialmente)

### Webhooks

| Evento | Ação |
|---|---|
| `checkout.session.completed` | Cria assinatura, plan=PRO |
| `invoice.payment_succeeded` | Renova período |
| `customer.subscription.updated` | Atualiza status |
| `customer.subscription.deleted` | plan=FREE |

---

## 10. API Routes

```
POST /api/leads              → Salva lead do formulário
POST /api/auth/send-otp      → Envia código OTP
POST /api/auth/verify-otp    → Verifica código OTP
POST /api/stripe/checkout    → Cria Checkout Session
POST /api/stripe/portal      → Cria Customer Portal Session
POST /api/stripe/webhook     → Processa webhooks Stripe
PUT  /api/user/onboarding    → Atualiza dados do onboarding
PUT  /api/user/profile       → Atualiza perfil
```

---

## 11. Estrutura de Pastas

```
officebiz/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                # Landing page (10 seções)
│   │   ├── login/page.tsx          # Tela de login OTP
│   │   ├── privacy/page.tsx        # Política de privacidade
│   │   └── terms/page.tsx          # Termos de uso
│   ├── (auth)/
│   │   ├── dashboard/page.tsx      # Dashboard principal
│   │   ├── dashboard/onboarding/page.tsx  # Wizard
│   │   ├── settings/billing/page.tsx      # Assinatura
│   │   └── settings/profile/page.tsx      # Perfil
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── leads/route.ts
│   │   └── stripe/webhook/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── landing/               # Seções da landing page
│   │   ├── hero.tsx
│   │   ├── what-is.tsx
│   │   ├── services.tsx
│   │   ├── how-it-works.tsx
│   │   ├── advantages.tsx
│   │   ├── pricing.tsx
│   │   ├── testimonials.tsx
│   │   ├── faq.tsx
│   │   ├── cta-final.tsx
│   │   └── footer.tsx
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── whatsapp-button.tsx
│   ├── auth/
│   │   ├── otp-form.tsx
│   │   └── login-form.tsx
│   ├── dashboard/
│   │   ├── onboarding-wizard.tsx
│   │   ├── plan-card.tsx
│   │   └── trial-banner.tsx
│   └── paywall/
│       └── paywall-gate.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── stripe.ts
│   ├── email.ts
│   ├── subscription.ts
│   └── validations.ts
├── design-system/
│   ├── tokens.ts
│   ├── utils.ts
│   └── generate-css.ts
├── prisma/
│   └── schema.prisma
├── middleware.ts
└── package.json
```

---

## 12. Requisitos Não-Funcionais

| Requisito | Meta |
|---|---|
| PageSpeed (mobile) | > 90 |
| Tempo de carregamento | < 3s |
| Responsivo | Mobile-first |
| SEO | Meta tags, Open Graph, Schema.org |
| SSL | HTTPS obrigatório (Vercel) |
| Acessibilidade | WCAG 2.1 AA básico |

---

## 13. Verificação

### Como testar end-to-end

1. `npm run dev` → landing page renderiza com todas as 10 seções
2. Formulário de leads → salva no banco (verificar via Prisma Studio)
3. WhatsApp flutuante → abre wa.me com número placeholder
4. Login OTP → recebe código por email → acessa dashboard
5. Onboarding wizard → completa 3 passos → dashboard principal
6. Trial banner → mostra dias restantes
7. Stripe Checkout → cria assinatura test mode
8. Stripe Portal → gerencia assinatura
9. Webhook → plan atualizado no banco
10. `npm run tokens:check` → design tokens sincronizados
11. Lighthouse → PageSpeed > 90 mobile
