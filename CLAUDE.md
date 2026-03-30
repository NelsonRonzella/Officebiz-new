# OfficeBiz — Convenções do Projeto

@AGENTS.md

## Stack
- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS 4 + shadcn/ui
- Prisma 7 + PostgreSQL (Neon)
- Auth.js v5 (OTP passwordless via Resend)
- Stripe (assinatura R$ 390/mês)
- TanStack Query + Zod
- Framer Motion (animações)

## Regras
- Nunca usar hex hardcoded nos componentes — sempre tokens semânticos Tailwind
- Design tokens definidos em `design-system/tokens.ts` (fonte única de verdade)
- `npm run tokens` gera CSS vars no globals.css
- Middleware NÃO importa Auth.js (limite 1MB Edge Function Vercel)
- Middleware checa cookie `authjs.session-token` diretamente
- Stripe client usa lazy init (proxy pattern)
- Variáveis AUTH_ (não NEXTAUTH_) — padrão Auth.js v5

## Estrutura
- `app/(public)/` — rotas públicas (landing, login, privacy, terms)
- `app/(auth)/` — rotas protegidas (dashboard, settings)
- `components/landing/` — seções da landing page
- `components/dashboard/` — componentes do dashboard
- `design-system/` — tokens, utils, generate-css
- `lib/` — auth, db, stripe, email, subscription, validations

## Comandos
- `npm run dev` — desenvolvimento
- `npm run tokens` — gerar CSS vars
- `npm run tokens:check` — verificar sincronização
