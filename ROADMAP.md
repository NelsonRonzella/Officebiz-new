# OfficeBiz — Plano de Correções e Melhorias

> Branch: `feature/roadmap-page`
> Criado em: 2026-04-04

---

## FASE 1 — CORREÇÕES CRÍTICAS (Coisas quebradas)

### 1.1 Consulta INPI (Relay)
- [ ] **1.1.1** Instalar Cloudflare Tunnel (cloudflared) na máquina local
- [ ] **1.1.2** Configurar o tunnel para apontar para `localhost:3847` (porta do relay)
- [ ] **1.1.3** Testar `node relay/inpi-server.mjs` localmente
- [ ] **1.1.4** Copiar a URL pública gerada pelo Cloudflare Tunnel
- [ ] **1.1.5** Adicionar `INPI_RELAY_URL` na Vercel com a URL do tunnel
- [ ] **1.1.6** Adicionar `INPI_RELAY_SECRET` na Vercel (trocar o default hardcoded)
- [ ] **1.1.7** Testar consulta INPI no app em produção
- [ ] **1.1.8** Adicionar `INPI_RELAY_URL` e `INPI_RELAY_SECRET` no `.env.example`

### 1.2 Dashboard do Cliente (Placeholder → Dados Reais)
- [ ] **1.2.1** Consultar pedidos do cliente no banco (`Order` onde `userId = session.user.id`)
- [ ] **1.2.2** Mostrar cards de resumo: total de pedidos, em andamento, concluídos
- [ ] **1.2.3** Listar pedidos recentes com status, produto e data
- [ ] **1.2.4** Cada pedido clicável levando para `/app/pedidos/[id]`
- [ ] **1.2.5** Mostrar progresso do pedido atual (barra de progresso)
- [ ] **1.2.6** Manter mensagem "Nenhum pedido" apenas quando realmente não houver

### 1.3 Dashboard do Prestador (Placeholder → Dados Reais)
- [ ] **1.3.1** Consultar pedidos atribuídos ao prestador (`Order` onde `prestadorId = session.user.id`)
- [ ] **1.3.2** Mostrar cards de resumo: pedidos atribuídos, em andamento, concluídos
- [ ] **1.3.3** Listar pedidos com status, cliente, produto e data
- [ ] **1.3.4** Cada pedido clicável levando para `/app/pedidos/[id]`
- [ ] **1.3.5** Botão de "Aceitar" visível para pedidos pendentes
- [ ] **1.3.6** Manter mensagem "Nenhum pedido" apenas quando realmente não houver

### 1.4 Expiração Automática de Trials
- [ ] **1.4.1** Adicionar `CRON_SECRET` no `.env.example` com instrução
- [ ] **1.4.2** Gerar um secret seguro e adicionar na Vercel
- [ ] **1.4.3** Configurar Vercel Cron Job para chamar `/api/cron/expire-trials` diariamente
- [ ] **1.4.4** Testar expiração com um usuário de teste

### 1.5 Stripe — Fallback Localhost
- [ ] **1.5.1** Em `lib/stripe.ts`, remover fallback `http://localhost:3000` e lançar erro se `NEXT_PUBLIC_APP_URL` não estiver definido
- [ ] **1.5.2** Verificar que `NEXT_PUBLIC_APP_URL` está configurado na Vercel com a URL de produção
- [ ] **1.5.3** Configurar `STRIPE_WEBHOOK_SECRET` na Vercel
- [ ] **1.5.4** Configurar `STRIPE_PRICE_ID_PRO` na Vercel com o price ID do plano Pro
- [ ] **1.5.5** Testar fluxo completo de checkout em produção

---

## FASE 2 — ERROS SILENCIOSOS E ESTABILIDADE

### 2.1 Notificações — Feedback de Erro
- [ ] **2.1.1** Em `notification-bell.tsx`: substituir `// Silently fail` por estado de erro visível (ícone de alerta ou badge de erro)
- [ ] **2.1.2** Em `notifications-list.tsx`: mostrar mensagem "Erro ao carregar notificações" com botão "Tentar novamente"

### 2.2 Financeiro — Feedback de Erro
- [ ] **2.2.1** Em `financial-dashboard.tsx`: mostrar mensagem de erro ao usuário em vez de só logar no console
- [ ] **2.2.2** Em `licenciado-financial.tsx`: mesma correção
- [ ] **2.2.3** Adicionar botão "Tentar novamente" em ambos

### 2.3 Pedidos — Erros e Duplicação
- [ ] **2.3.1** Em `order-detail.tsx`: substituir `/* silent */` por toast/alerta de erro
- [ ] **2.3.2** Em `orders-list.tsx`: mesma correção no catch silencioso
- [ ] **2.3.3** Extrair `STATUS_CONFIG` de `status-badge.tsx` para arquivo compartilhado (ex: `lib/order-status.ts`)
- [ ] **2.3.4** Importar `STATUS_CONFIG` em `order-detail.tsx` e `orders-list.tsx` (remover duplicação)

### 2.4 Admin Dashboard — Proteção contra Crash
- [ ] **2.4.1** Envolver as queries do admin dashboard em try-catch
- [ ] **2.4.2** Mostrar estado de erro parcial (se uma query falhar, mostrar as outras)

---

## FASE 3 — DADOS E CONTEÚDO INCOMPLETOS

### 3.1 Footer da Landing Page
- [ ] **3.1.1** Substituir `CNPJ: XX.XXX.XXX/0001-XX` pelo CNPJ real do OfficeBiz
- [ ] **3.1.2** Substituir `https://instagram.com` pela URL real do perfil no Instagram
- [ ] **3.1.3** Substituir `https://linkedin.com` pela URL real do perfil no LinkedIn

### 3.2 Página de Suporte
- [ ] **3.2.1** Substituir `https://wa.me/5500000000000` pelo número real de WhatsApp
- [ ] **3.2.2** Confirmar se `suporte@officebiz.com.br` é o email correto

### 3.3 Financeiro do Licenciado — Cálculos Incompletos
- [ ] **3.3.1** Em `app/api/financial/licenciado/route.ts`: incluir pedidos com status `PAGO` além de `CONCLUIDO` nos cálculos de receita
- [ ] **3.3.2** Adicionar visão de pipeline (pedidos em andamento com valor estimado)

---

## FASE 4 — INFRAESTRUTURA E CONFIGURAÇÃO

### 4.1 WhatsApp (Evolution API)
- [ ] **4.1.1** Decidir: contratar/hospedar instância Evolution API ou usar WhatsApp Cloud API
- [ ] **4.1.2** Configurar a instância escolhida
- [ ] **4.1.3** Preencher `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_API_INSTANCE` na Vercel
- [ ] **4.1.4** Preencher `WHATSAPP_ADMIN_PHONE` na Vercel
- [ ] **4.1.5** Testar envio de mensagem pelo painel admin
- [ ] **4.1.6** Testar QR Code e status de conexão

### 4.2 Variáveis de Ambiente — Documentação
- [ ] **4.2.1** Adicionar `CRON_SECRET` ao `.env.example`
- [ ] **4.2.2** Adicionar `INPI_RELAY_URL` ao `.env.example`
- [ ] **4.2.3** Adicionar `INPI_RELAY_SECRET` ao `.env.example`
- [ ] **4.2.4** Revisar que todas as variáveis usadas no código estão documentadas no `.env.example`

### 4.3 Onboarding — Redirect por Role
- [ ] **4.3.1** Após completar onboarding, redirecionar para dashboard específico da role (não genérico `/dashboard`)

---

## FASE 5 — MELHORIAS FUTURAS (Pós-correções)

### 5.1 Relatórios em PDF
- [ ] **5.1.1** Relatório de pedidos (lista e detalhes)
- [ ] **5.1.2** Relatório financeiro mensal

### 5.2 Notificações por Email Automáticas
- [ ] **5.2.1** Email quando pedido muda de status
- [ ] **5.2.2** Email quando prestador é atribuído
- [ ] **5.2.3** Email de lembrete de trial expirando

### 5.3 Agenda/Calendário de Prazos
- [ ] **5.3.1** Visualização de prazos dos pedidos em calendário

### 5.4 Chat em Tempo Real
- [ ] **5.4.1** WebSocket para mensagens nos pedidos

### 5.5 PWA (App Mobile)
- [ ] **5.5.1** Configurar manifest.json e service worker
- [ ] **5.5.2** Modo offline básico

### 5.6 Página de Roadmap Pública
- [ ] **5.6.1** Criar página visual `/roadmap` mostrando o que está pronto, em andamento e planejado

---

## INFORMAÇÕES NECESSÁRIAS DO NELSON

Para avançar, preciso dessas informações:

| Item | Para quê |
|------|----------|
| CNPJ real | Footer da landing page |
| URL do Instagram | Footer da landing page |
| URL do LinkedIn | Footer da landing page |
| Número WhatsApp real | Página de suporte + footer |
| Email de suporte correto | Página de suporte |
| Decisão sobre Evolution API vs Cloud API | Configurar WhatsApp |
| Decisão sobre INPI: configurar tunnel agora ou "em breve"? | Consulta INPI |
| `NEXT_PUBLIC_APP_URL` está configurado na Vercel? | Stripe redirects |
| Stripe está configurado? (price ID, webhook) | Pagamentos |
