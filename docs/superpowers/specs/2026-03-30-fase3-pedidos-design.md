# Fase 3 — Pedidos (Workflow Completo) — Design Spec

> **Data:** 2026-03-30 | **Status:** Draft

---

## 1. Objetivo

Implementar o sistema de pedidos completo: criação, workflow de status, steps/categorias, mensagens, anexos, atribuição de prestador. Réplica fiel do sistema antigo.

---

## 2. Schema

```prisma
enum OrderStatus {
  AGUARDANDO_PAGAMENTO   // 0 - yellow
  EM_ANDAMENTO           // 1 - blue
  CANCELADO              // 2 - red
  RETORNO                // 3 - cyan
  PAGO                   // 4 - green
  CONCLUIDO              // 5 - emerald
}

model Order {
  id              String        @id @default(cuid())
  userId          String        // cliente
  productId       String
  status          OrderStatus   @default(AGUARDANDO_PAGAMENTO)
  criadoPor       String        // licenciado/admin que criou
  prestadorId     String?       // prestador atribuído
  progresso       Int           @default(0)
  currentStepId   String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user            User          @relation("OrderClient", fields: [userId], references: [id])
  criador         User          @relation("OrderCreator", fields: [criadoPor], references: [id])
  prestador       User?         @relation("OrderPrestador", fields: [prestadorId], references: [id])
  product         Product       @relation(fields: [productId], references: [id])
  currentStep     OrderStep?    @relation("CurrentStep", fields: [currentStepId], references: [id])
  steps           OrderStep[]   @relation("OrderSteps")
  documentCategories OrderDocumentCategory[]
  attachments     OrderAttachment[]
  messages        OrderMessage[]
  prestadorLogs   OrderPrestadorLog[]
}

model OrderStep {
  id           String    @id @default(cuid())
  orderId      String
  title        String
  description  String    @db.Text
  order        Int
  durationDays Int
  startedAt    DateTime?
  finishedAt   DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  orderSteps   Order     @relation("OrderSteps", fields: [orderId], references: [id], onDelete: Cascade)
  currentOf    Order[]   @relation("CurrentStep")
}

model OrderDocumentCategory {
  id          String            @id @default(cuid())
  orderId     String
  title       String
  description String            @db.Text
  order       Int
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  orderRel    Order             @relation(fields: [orderId], references: [id], onDelete: Cascade)
  attachments OrderAttachment[]
}

model OrderAttachment {
  id                      String                 @id @default(cuid())
  orderId                 String
  orderDocumentCategoryId String?
  userId                  String
  file                    String
  fileName                String
  createdAt               DateTime               @default(now())
  order                   Order                  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  documentCategory        OrderDocumentCategory? @relation(fields: [orderDocumentCategoryId], references: [id])
  user                    User                   @relation(fields: [userId], references: [id])
}

model OrderMessage {
  id        String   @id @default(cuid())
  orderId   String
  userId    String
  message   String   @db.Text
  file      String?
  fileName  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
}

model OrderPrestadorLog {
  id              String   @id @default(cuid())
  orderId         String
  changedById     String
  oldPrestadorId  String?
  newPrestadorId  String?
  createdAt       DateTime @default(now())
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  changedBy       User     @relation("PrestadorLogChanger", fields: [changedById], references: [id])
  oldPrestador    User?    @relation("PrestadorLogOld", fields: [oldPrestadorId], references: [id])
  newPrestador    User?    @relation("PrestadorLogNew", fields: [newPrestadorId], references: [id])
}
```

User model additions:
```prisma
model User {
  // existing...
  orders            Order[]             @relation("OrderClient")
  createdOrders     Order[]             @relation("OrderCreator")
  prestadorOrders   Order[]             @relation("OrderPrestador")
  orderMessages     OrderMessage[]
  orderAttachments  OrderAttachment[]
  prestadorLogsChanged OrderPrestadorLog[] @relation("PrestadorLogChanger")
  prestadorLogsOld     OrderPrestadorLog[] @relation("PrestadorLogOld")
  prestadorLogsNew     OrderPrestadorLog[] @relation("PrestadorLogNew")
}

model Product {
  // existing...
  orders Order[]
}
```

---

## 3. Status Flow

```
AGUARDANDO_PAGAMENTO → (admin marca pago) → PAGO
PAGO → (prestador aceita) → EM_ANDAMENTO
EM_ANDAMENTO → (completa todas as etapas ou admin) → CONCLUIDO
EM_ANDAMENTO → (admin) → RETORNO
Qualquer → (admin) → CANCELADO (exceto já CANCELADO/CONCLUIDO)
```

---

## 4. Visibilidade

| Role | Vê pedidos |
|---|---|
| Admin | Todos |
| Licenciado | Só os que criou (criadoPor) |
| Prestador | Atribuídos a ele OU (sem prestador E status=PAGO) |
| Cliente | Só os dele (userId) |

---

## 5. Rotas

```
# Pedidos (todos os roles)
/app/pedidos                    → Lista pedidos (filtrado por role)
/app/pedidos/novo               → Criar pedido (admin/licenciado)
/app/pedidos/[id]               → Detalhes do pedido

# Admin actions (dentro do detalhe)
# - Mudar status, atribuir prestador, avançar etapa
```

---

## 6. API Routes

```
GET    /api/orders                  → Lista (filtros: status, cliente, produto, data)
POST   /api/orders                  → Criar pedido (admin/licenciado)
GET    /api/orders/[id]             → Detalhes completos
PUT    /api/orders/[id]             → Atualizar status (admin)
PATCH  /api/orders/[id]/pago        → Marcar como pago (admin)
PATCH  /api/orders/[id]/aceitar     → Prestador aceita
PATCH  /api/orders/[id]/avancar     → Avançar etapa (admin/licenciado/prestador)
PATCH  /api/orders/[id]/concluir    → Concluir pedido (admin)
PATCH  /api/orders/[id]/cancelar    → Cancelar pedido (admin)
PATCH  /api/orders/[id]/retorno     → Marcar retorno (admin)
PATCH  /api/orders/[id]/prestador   → Atribuir/trocar prestador (admin)
POST   /api/orders/[id]/mensagem    → Adicionar mensagem
POST   /api/orders/[id]/anexo       → Upload de arquivo
```

---

## 7. Páginas

### Lista de Pedidos (`/app/pedidos`)
- Tabela: #ID, Cliente, Produto, Status (badge colorido), Prestador, Progresso (barra), Criado em
- Filtros: busca, status, tipo produto, data início/fim
- Admin vê filtros extras: licenciado, prestador
- Botão "Novo pedido" (admin/licenciado)

### Criar Pedido (`/app/pedidos/novo`)
- Select cliente (busca por nome/email)
- Select produto ativo
- Mensagem inicial (opcional)
- Arquivo anexo (opcional)
- Ao salvar: cria Order + copia ProductSteps → OrderSteps OU ProductDocumentCategories → OrderDocumentCategories

### Detalhes do Pedido (`/app/pedidos/[id]`)
Layout com tabs ou seções:

**Cabeçalho:**
- #ID, Status (badge), Produto, Cliente, Licenciado, Prestador
- Barra de progresso (pontual)
- Botões de ação (por role/status)

**Seção Info:**
- Dados do cliente, produto, datas

**Seção Etapas (pontual):**
- Timeline vertical com steps
- Step atual destacado
- Steps concluídos com check
- Botão "Avançar etapa" (admin/licenciado/prestador, quando EM_ANDAMENTO)

**Seção Documentos (recorrente):**
- Tabs por categoria de documento
- Upload de arquivos por categoria
- Lista de arquivos com download

**Seção Mensagens:**
- Timeline de mensagens (chat)
- Cada: avatar, nome, data, texto, arquivo
- Form: textarea + upload arquivo + botão enviar
- Filtro por data

**Painel Admin (só admin):**
- Dropdown mudar status
- Select atribuir prestador
- Botão "Marcar como pago"
- Botão "Cancelar"
- Botão "Retorno"
- Log de trocas de prestador

---

## 8. Services

```typescript
// lib/order-service.ts
createOrderSteps(orderId, productId)     // Copia ProductStep → OrderStep
createOrderCategories(orderId, productId) // Copia ProductDocumentCategory → OrderDocumentCategory
startFirstStep(orderId)                   // Seta started_at da primeira etapa
advanceStep(orderId)                      // Conclui atual, inicia próxima, recalcula progresso
recalculateProgress(orderId)             // (finished / total) * 100
```

---

## 9. Sidebar Update

- **Admin:** Adicionar "Pedidos" (ClipboardList) → /app/pedidos
- **Licenciado:** Adicionar "Pedidos" (ClipboardList) → /app/pedidos
- **Prestador:** Adicionar "Pedidos" (ClipboardList) → /app/pedidos
- **Cliente:** Adicionar "Meus Pedidos" (ClipboardList) → /app/pedidos

---

## 10. Verificação

1. Admin/licenciado cria pedido pontual → OrderSteps criados → status AGUARDANDO_PAGAMENTO
2. Admin marca como pago → status PAGO
3. Prestador vê pedido disponível → aceita → status EM_ANDAMENTO, first step started
4. Prestador avança etapas → progresso atualiza
5. Última etapa concluída → status CONCLUIDO
6. Mensagens: todos podem enviar, aparecem no chat
7. Recorrente: upload de arquivos por categoria
8. Admin atribui/troca prestador → log registrado
9. Admin cancela pedido → status CANCELADO
10. Licenciado só vê pedidos que criou
11. Cliente só vê seus pedidos
