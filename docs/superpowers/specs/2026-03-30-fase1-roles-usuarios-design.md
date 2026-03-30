# Fase 1 — Roles + Gestão de Usuários — Design Spec

> **Data:** 2026-03-30 | **Status:** Draft
> **Contexto:** O sistema OfficeBiz tem landing page + dashboard do licenciado. Esta fase adiciona o sistema multi-role completo (como no projeto antigo Laravel) para que admin, licenciado, prestador e cliente possam operar na plataforma.

---

## 1. Objetivo

Transformar o dashboard atual (single-role licenciado) em um sistema multi-role com 4 tipos de usuário, cada um com seu dashboard, permissões e funcionalidades específicas. Base para todas as fases futuras (pedidos, produtos, financeiro).

---

## 2. Schema Changes

### 2a. Adicionar ao User

```prisma
enum Role {
  ADMIN
  LICENCIADO
  PRESTADOR
  CLIENTE
}

model User {
  // Campos existentes mantidos...
  role                   Role      @default(LICENCIADO)
  active                 Boolean   @default(true)
  cpf                    String?
  cnpj                   String?
  telefone               String?   // substituir 'phone' por 'telefone' para consistência
  cep                    String?
  endereco               String?
  numero                 String?
  bairro                 String?
  cidade                 String?
  estado                 String?
  createdBy              String?   // ID do user que criou (admin/licenciado)
  creator                User?     @relation("CreatedUsers", fields: [createdBy], references: [id])
  createdUsers           User[]    @relation("CreatedUsers")
}
```

**Nota:** O campo `plan` (FREE/TRIAL/PRO) só se aplica a LICENCIADO. Outros roles não precisam de plano.

### 2b. Migration

- Adicionar coluna `role` com default LICENCIADO (não quebra usuários existentes)
- Adicionar colunas de perfil (cpf, cnpj, etc.)
- Adicionar coluna `active`
- Adicionar coluna `createdBy` (FK self-referencing)

---

## 3. Roles e Permissões

### Admin
- Acesso total ao sistema
- Gerencia todos os usuários (CRUD de admin, licenciado, prestador, cliente)
- Vê todos os dados globalmente
- Dashboard com estatísticas e charts
- Acessa logs de atividade, financeiro, contratos
- Pode toggle ativo/inativo de qualquer usuário

### Licenciado
- Cria e gerencia seus clientes
- Cria pedidos para seus clientes
- Vê apenas pedidos que ele criou
- Dashboard com lista de pedidos
- Precisa de plano ativo (TRIAL ou PRO) para operar
- PaywallGate bloqueia se sem acesso

### Prestador
- Vê pedidos disponíveis para aceitar (pagos, sem prestador)
- Vê pedidos atribuídos a ele
- Pode avançar etapas e adicionar mensagens
- Não pode criar pedidos
- Dashboard com pedidos atribuídos

### Cliente
- Vê apenas seus próprios pedidos
- Pode adicionar mensagens
- Não pode modificar status ou etapas
- Dashboard simples com "meus pedidos"
- Acesso somente leitura na maioria das funcionalidades

---

## 4. Rotas e Navegação

### Estrutura de Rotas

```
/admin/                         → Dashboard admin (stats, charts)
/admin/users                    → Lista todos os usuários (tabs por role)
/admin/users/new                → Criar usuário (qualquer role)
/admin/users/[id]               → Editar usuário
/admin/logs                     → Activity log (fase futura)
/admin/financeiro               → Financeiro (fase futura)

/dashboard                      → Dashboard do role atual (redirect por role)
/dashboard/licenciado           → Dashboard licenciado
/dashboard/prestador            → Dashboard prestador
/dashboard/cliente              → Dashboard cliente

/settings/billing               → Assinatura (só licenciado)
/settings/profile               → Perfil (todos)

/app/clientes                   → Lista clientes (admin + licenciado)
/app/clientes/novo              → Criar cliente
/app/clientes/[id]              → Editar cliente
```

### Redirect por Role no /dashboard

```typescript
if (user.role === "ADMIN") redirect("/admin")
if (user.role === "LICENCIADO") redirect("/dashboard/licenciado")
if (user.role === "PRESTADOR") redirect("/dashboard/prestador")
if (user.role === "CLIENTE") redirect("/dashboard/cliente")
```

---

## 5. Sidebar por Role

### Admin Sidebar
- Dashboard (LayoutDashboard)
- Usuários (Users)
- Separador
- Perfil (User)
- Sair (LogOut)

### Licenciado Sidebar
- Dashboard (LayoutDashboard)
- Clientes (Users)
- Separador
- Assinatura (CreditCard)
- Perfil (User)
- Suporte (Headphones)
- Sair (LogOut)

### Prestador Sidebar
- Dashboard (LayoutDashboard)
- Separador
- Perfil (User)
- Suporte (Headphones)
- Sair (LogOut)

### Cliente Sidebar
- Dashboard (LayoutDashboard)
- Separador
- Perfil (User)
- Suporte (Headphones)
- Sair (LogOut)

---

## 6. Dashboards

### Admin Dashboard (`/admin`)
- 4 stat cards (placeholder — totais por status de pedidos, será implementado na fase de pedidos)
- Card "Total Licenciados" com count
- Card "Total Clientes" com count
- Card "Total Prestadores" com count
- Tabela "Últimos usuários cadastrados" (10 mais recentes)

### Licenciado Dashboard (`/dashboard/licenciado`)
- Trial banner (se TRIAL)
- Card de plano
- Card "Seus Clientes" com count + link
- Card "Próximos passos" (checklist)
- Futuramente: lista de pedidos

### Prestador Dashboard (`/dashboard/prestador`)
- Card de boas-vindas
- Futuramente: pedidos disponíveis para aceitar

### Cliente Dashboard (`/dashboard/cliente`)
- Card de boas-vindas
- Futuramente: meus pedidos

---

## 7. CRUD de Usuários

### Admin → Gerenciar Todos

**Página `/admin/users`:**
- Tabs: Todos | Admins | Licenciados | Prestadores | Clientes
- Tabela com: Nome, Email, Role (badge), Ativo (toggle), Criado em
- Filtros: busca por nome/email, role, ativo/inativo
- Botão "Novo usuário"
- Paginação server-side

**Página `/admin/users/new`:**
- Formulário: Nome, Email, Role (select), CPF, CNPJ, Telefone, CEP, Endereço, Número, Bairro, Cidade, Estado
- CEP com auto-preenchimento (ViaCEP API)
- CPF/CNPJ com formatação e validação
- Ao salvar: cria User com emailVerified=null, envia email de convite
- Validação Zod

**Página `/admin/users/[id]`:**
- Mesmo formulário, preenchido com dados atuais
- Botão toggle ativo/inativo
- Não permite editar o role de si mesmo

### Licenciado → Gerenciar Clientes

**Página `/app/clientes`:**
- Tabela: Nome, Email, Telefone, Criado em
- Só mostra clientes que ele criou (createdBy = user.id)
- Botão "Novo cliente"
- Filtro por nome/email

**Página `/app/clientes/novo`:**
- Formulário simplificado: Nome, Email, Telefone, CPF/CNPJ
- Cria User com role=CLIENTE, createdBy=licenciado.id
- Envia email de convite

**Página `/app/clientes/[id]`:**
- Editar dados do cliente
- Só permite editar clientes que criou

---

## 8. Convite por Email

Quando admin/licenciado cria um usuário:
1. User criado no banco (emailVerified = null)
2. Email enviado via Resend com:
   - "Você foi convidado para a plataforma OfficeBiz"
   - Link direto para /login
   - Ao fazer login via OTP, emailVerified é setado automaticamente

Template do email de convite (via Resend):
- Logo OfficeBiz
- "Olá [nome], você foi convidado para a OfficeBiz"
- "Acesse a plataforma clicando no botão abaixo"
- Botão "Acessar OfficeBiz" → link para /login
- "Use seu email [email] para entrar"

---

## 9. Middleware Atualizado

```typescript
// middleware.ts (edge-safe)
// Checa cookie de sessão para rotas protegidas
// NÃO checa role no middleware (edge function não tem acesso ao DB)
// Role check feito no layout/page do server component

// Rotas protegidas:
// /dashboard/* → precisa estar logado
// /admin/* → precisa estar logado (role check no layout)
// /app/* → precisa estar logado (role check no layout)
// /settings/* → precisa estar logado
```

### Role Check nos Layouts

```typescript
// app/(admin)/layout.tsx
const user = await getUser()
if (user.role !== "ADMIN") redirect("/dashboard")

// app/(auth)/layout.tsx
const user = await getUser()
if (!user.active) signOut + redirect("/login?inactive=true")
if (user.role === "ADMIN") redirect("/admin")
```

---

## 10. API Routes

```
GET    /api/users              → Lista usuários (admin: todos, licenciado: seus clientes)
POST   /api/users              → Criar usuário (admin: qualquer role, licenciado: só cliente)
GET    /api/users/[id]         → Dados do usuário
PUT    /api/users/[id]         → Atualizar usuário
PATCH  /api/users/[id]/toggle  → Toggle ativo/inativo (admin only)
POST   /api/users/invite       → Reenviar email de convite
```

---

## 11. Validações (Zod)

```typescript
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  role: z.enum(["ADMIN", "LICENCIADO", "PRESTADOR", "CLIENTE"]),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})

const updateUserSchema = createUserSchema.partial().omit({ role: true })
```

---

## 12. Estrutura de Pastas (novos arquivos)

```
app/
├── (admin)/
│   ├── layout.tsx              # Admin layout (role check)
│   ├── admin/page.tsx          # Admin dashboard
│   └── admin/users/
│       ├── page.tsx            # Lista usuários
│       ├── new/page.tsx        # Criar usuário
│       └── [id]/page.tsx       # Editar usuário
├── (auth)/
│   ├── layout.tsx              # Atualizar: redirect admin, check active
│   ├── dashboard/
│   │   ├── page.tsx            # Redirect por role
│   │   ├── licenciado/page.tsx # Dashboard licenciado (atualizar)
│   │   ├── prestador/page.tsx  # Dashboard prestador (novo)
│   │   └── cliente/page.tsx    # Dashboard cliente (novo)
│   └── app/
│       └── clientes/
│           ├── page.tsx        # Lista clientes (licenciado)
│           ├── novo/page.tsx   # Criar cliente
│           └── [id]/page.tsx   # Editar cliente
├── api/
│   └── users/
│       ├── route.ts            # GET (list), POST (create)
│       ├── [id]/route.ts       # GET, PUT
│       ├── [id]/toggle/route.ts # PATCH toggle
│       └── invite/route.ts     # POST reenviar convite

components/
├── admin/
│   ├── users-table.tsx         # Tabela de usuários
│   ├── user-form.tsx           # Formulário criar/editar
│   ├── stat-card.tsx           # Card de estatística
│   └── role-badge.tsx          # Badge com cor por role
├── layout/
│   └── sidebar.tsx             # Atualizar: sidebar por role
└── shared/
    ├── cep-input.tsx           # Input CEP com auto-preenchimento ViaCEP
    ├── cpf-input.tsx           # Input CPF com máscara
    └── cnpj-input.tsx          # Input CNPJ com máscara

lib/
├── permissions.ts              # Helpers de permissão por role
└── viacep.ts                   # Client ViaCEP API
```

---

## 13. Verificação

### Como testar end-to-end

1. Criar user admin manualmente no banco (Prisma Studio ou seed)
2. Login como admin via OTP → redirect para /admin
3. Admin dashboard mostra contadores de usuários
4. Admin cria licenciado → email de convite enviado
5. Login como licenciado → redirect para /dashboard/licenciado
6. Licenciado cria cliente → email de convite enviado
7. Login como cliente → redirect para /dashboard/cliente
8. Admin cria prestador → email de convite enviado
9. Login como prestador → redirect para /dashboard/prestador
10. Admin toggle user inativo → user não consegue logar
11. Licenciado só vê clientes que criou
12. Cliente não acessa rotas de admin

---

## 14. Roadmap de Fases Futuras

- **Fase 2:** Produtos (pontual/recorrente, steps, document categories, tutoriais)
- **Fase 3:** Pedidos (CRUD, workflow, messages, attachments, steps)
- **Fase 4:** Financeiro (Stripe por pedido, dashboard charts, faturamento)
- **Fase 5:** Notificações (in-app, email, push)
- **Fase 6:** Admin Tools (activity log, contratos)
