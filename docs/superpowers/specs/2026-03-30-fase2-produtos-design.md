# Fase 2 — Produtos (Pontual/Recorrente) + Tutoriais — Design Spec

> **Data:** 2026-03-30 | **Status:** Draft
> **Contexto:** Com roles e usuários implementados (Fase 1), esta fase adiciona o catálogo de produtos/serviços que serão vendidos pelos licenciados. Réplica fiel do sistema antigo Laravel, adaptado para Next.js.

---

## 1. Objetivo

Implementar o sistema de produtos com dois tipos (pontual e recorrente), cada um com estrutura diferente de workflow. Pontual usa steps sequenciais, recorrente usa categorias de documentos. Tutoriais em vídeo vinculados a produtos complementam o catálogo.

---

## 2. Schema

### Novos Models

```prisma
enum ProductType {
  PONTUAL
  RECORRENTE
}

model Product {
  id          String        @id @default(cuid())
  name        String
  description String        @db.Text
  price       Decimal       @db.Decimal(10, 2)
  type        ProductType
  active      Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  steps       ProductStep[]
  documentCategories ProductDocumentCategory[]
  tutorials   TutorialProduct[]
}

model ProductStep {
  id           String   @id @default(cuid())
  productId    String
  title        String
  description  String   @db.Text
  order        Int
  durationDays Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model ProductDocumentCategory {
  id          String   @id @default(cuid())
  productId   String
  title       String
  description String   @db.Text
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Tutorial {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  link        String   // YouTube URL
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  products    TutorialProduct[]
}

model TutorialProduct {
  id         String   @id @default(cuid())
  tutorialId String
  productId  String
  tutorial   Tutorial @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([tutorialId, productId])
}
```

---

## 3. Visibilidade e Permissões

| Ação | Admin | Licenciado | Prestador | Cliente |
|---|:---:|:---:|:---:|:---:|
| Listar produtos | Sim | Sim (ativos) | Sim (ativos) | Não |
| Ver detalhes | Sim | Sim (ativos) | Sim (ativos) | Não |
| Ver preço (custo base) | Sim | Sim | Não | Não |
| Criar/editar produto | Sim | Não | Não | Não |
| Toggle ativo | Sim | Não | Não | Não |
| CRUD tutoriais | Sim | Não | Não | Não |
| Ver tutoriais | Sim | Sim | Sim | Não |

---

## 4. Rotas

```
# Admin — Produtos
/admin/produtos                     → Lista produtos (tabs, filtros, toggle)
/admin/produtos/pontual/novo        → Criar produto pontual (form + steps)
/admin/produtos/recorrente/novo     → Criar produto recorrente (form + categorias)
/admin/produtos/[id]                → Editar produto (detecta tipo, carrega steps ou categorias)
/admin/produtos/[id]/view           → Visualizar produto (read-only, com tutoriais)

# Admin — Tutoriais
/admin/tutoriais                    → Lista tutoriais
/admin/tutoriais/novo               → Criar tutorial
/admin/tutoriais/[id]               → Editar tutorial

# Licenciado/Prestador — Produtos (read-only)
/app/produtos                       → Lista produtos ativos
/app/produtos/[id]                   → Ver detalhes produto (steps/categorias, tutoriais)
```

---

## 5. API Routes

```
GET    /api/products              → Lista produtos (admin: todos, outros: só ativos)
POST   /api/products              → Criar produto (admin only)
GET    /api/products/[id]         → Detalhes com steps/categorias/tutoriais
PUT    /api/products/[id]         → Atualizar produto (admin only)
PATCH  /api/products/[id]/toggle  → Toggle ativo/inativo (admin only)

GET    /api/tutorials             → Lista tutoriais
POST   /api/tutorials             → Criar tutorial (admin only)
PUT    /api/tutorials/[id]        → Atualizar tutorial (admin only)
DELETE /api/tutorials/[id]        → Deletar tutorial (admin only)
```

---

## 6. Páginas e Componentes

### 6a. Admin — Lista de Produtos (`/admin/produtos`)

- Tabs: Todos | Pontual | Recorrente
- Tabela: Nome, Tipo (badge), Preço (R$), Ativo (toggle), Criado em
- Busca por nome
- Filtro ativo/inativo
- Botões: "Novo Pontual" e "Novo Recorrente"
- Click na linha → editar

### 6b. Admin — Criar Produto Pontual (`/admin/produtos/pontual/novo`)

Form com:
- Nome, Descrição (textarea), Preço (R$, input numérico)
- **Seção "Etapas do serviço":**
  - Lista de steps com: Título, Descrição, Prazo (dias), Ordem
  - Botão "Adicionar etapa"
  - Drag-and-drop para reordenar (ou setas up/down)
  - Botão remover em cada step
  - Mínimo 1 step obrigatório
- **Seção "Tutoriais vinculados":**
  - Multi-select de tutoriais existentes
- Botão "Salvar produto"

### 6c. Admin — Criar Produto Recorrente (`/admin/produtos/recorrente/novo`)

Form com:
- Nome, Descrição (textarea), Preço (R$)
- **Seção "Categorias de documentos":**
  - Lista de categorias com: Título, Descrição, Ordem
  - Botão "Adicionar categoria"
  - Setas up/down para reordenar
  - Botão remover em cada categoria
  - Mínimo 1 categoria obrigatória
- **Seção "Tutoriais vinculados":**
  - Multi-select de tutoriais existentes
- Botão "Salvar produto"

### 6d. Admin — Editar Produto (`/admin/produtos/[id]`)

- Carrega produto com steps ou categorias (baseado no tipo)
- Mesmo form de criação, preenchido
- Tipo não pode ser alterado após criação
- Pode adicionar/remover/reordenar steps ou categorias

### 6e. Visualizar Produto (`/admin/produtos/[id]/view` ou `/app/produtos/[id]`)

- Card com nome, descrição, preço (se permitido), tipo (badge)
- Se pontual: lista de steps com ordem, título, descrição, prazo
- Se recorrente: lista de categorias com título, descrição
- Seção tutoriais: cards com thumbnail YouTube, título, descrição

### 6f. Admin — Tutoriais

**Lista (`/admin/tutoriais`):**
- Tabela: Título, Link, Produtos vinculados, Criado em
- Botão "Novo tutorial"
- Click → editar

**Form (`/admin/tutoriais/novo` e `/admin/tutoriais/[id]`):**
- Título, Descrição, Link YouTube
- Preview do vídeo (thumbnail extraída da URL)
- Multi-select de produtos para vincular

### 6g. Sidebar Updates

- **Admin:** Adicionar "Produtos" (Package icon) e "Tutoriais" (Video icon)
- **Licenciado:** Adicionar "Produtos" (Package icon) → /app/produtos
- **Prestador:** Adicionar "Produtos" (Package icon) → /app/produtos

---

## 7. Validações (Zod)

```typescript
const productBaseSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
})

const pontualSchema = productBaseSchema.extend({
  type: z.literal("PONTUAL"),
  steps: z.array(z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    durationDays: z.number().int().positive(),
    order: z.number().int().min(0),
  })).min(1, "Mínimo 1 etapa"),
  tutorialIds: z.array(z.string()).optional(),
})

const recorrenteSchema = productBaseSchema.extend({
  type: z.literal("RECORRENTE"),
  categories: z.array(z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    order: z.number().int().min(0),
  })).min(1, "Mínimo 1 categoria"),
  tutorialIds: z.array(z.string()).optional(),
})
```

---

## 8. Helpers

```typescript
// lib/youtube.ts
export function getYoutubeThumbnail(url: string): string | null
export function getYoutubeVideoId(url: string): string | null
```

---

## 9. Estrutura de Pastas (novos arquivos)

```
app/
├── (admin)/admin/
│   ├── produtos/
│   │   ├── page.tsx                 # Lista produtos
│   │   ├── pontual/novo/page.tsx    # Criar pontual
│   │   ├── recorrente/novo/page.tsx # Criar recorrente
│   │   ├── [id]/page.tsx            # Editar produto
│   │   └── [id]/view/page.tsx       # Visualizar produto
│   └── tutoriais/
│       ├── page.tsx                 # Lista tutoriais
│       ├── novo/page.tsx            # Criar tutorial
│       └── [id]/page.tsx            # Editar tutorial
├── (auth)/app/
│   └── produtos/
│       ├── page.tsx                 # Lista produtos (read-only)
│       └── [id]/page.tsx            # Ver produto
├── api/
│   ├── products/
│   │   ├── route.ts                 # GET + POST
│   │   └── [id]/
│   │       ├── route.ts             # GET + PUT
│   │       └── toggle/route.ts      # PATCH
│   └── tutorials/
│       ├── route.ts                 # GET + POST
│       └── [id]/route.ts            # GET + PUT + DELETE

components/
├── admin/
│   ├── products-table.tsx           # Tabela de produtos
│   ├── product-form-pontual.tsx     # Form pontual com steps
│   ├── product-form-recorrente.tsx  # Form recorrente com categorias
│   └── tutorials-table.tsx          # Tabela de tutoriais
│   └── tutorial-form.tsx            # Form tutorial
├── products/
│   ├── product-view.tsx             # Visualização de produto
│   └── product-type-badge.tsx       # Badge pontual/recorrente

lib/
└── youtube.ts                       # Helpers YouTube
```

---

## 10. Verificação

1. Admin cria produto pontual com 3 steps → salva → aparece na lista
2. Admin cria produto recorrente com 2 categorias → salva → aparece na lista
3. Admin toggle ativo/inativo → produto desaparece/aparece para licenciado
4. Admin cria tutorial com link YouTube → thumbnail aparece
5. Admin vincula tutorial a produto → aparece no detalhe do produto
6. Licenciado vê lista de produtos ativos com preço
7. Prestador vê lista de produtos ativos sem preço
8. Cliente não acessa /app/produtos (redirect)
9. Editar produto: adicionar/remover steps funciona
10. Validação: produto sem steps/categorias não salva
