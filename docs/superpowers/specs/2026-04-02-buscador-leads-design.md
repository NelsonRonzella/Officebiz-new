# Buscador de Leads — Design Spec
**Data:** 2026-04-02
**Status:** Aprovado
**Acesso:** ADMIN, LICENCIADO

---

## Visão geral

Feature de busca de leads empresariais por cidade e segmento de atuação. O usuário seleciona uma cidade, define um raio visual no mapa e informa o segmento (ex: "clínicas odontológicas"). O sistema consulta o Google Places API, enriquece os dados com Brasil API (CNPJ/sócios) e OpenRouter AI (email/Instagram), salva os resultados no banco e nunca repete o mesmo estabelecimento em buscas futuras.

---

## Acesso e permissões

- **Roles com acesso:** ADMIN, LICENCIADO
- **Rota:** `/app/leads`
- **Menu sidebar:** "Buscador de Leads" (ícone de lupa/usuário)
- **Nova função em `lib/permissions.ts`:** `canAccessBuscadorLeads(role)` → `ADMIN || LICENCIADO`
- Cada usuário vê apenas os leads encontrados por ele próprio (`userId` no registro)

---

## Layout — Opção C (aprovada)

Sidebar fixa à esquerda + cards de resultados scrolláveis à direita.

### Sidebar esquerda
- Campo de texto: **Cidade** (com autocomplete de municípios brasileiros via Google Places Autocomplete)
- Campo de texto: **Segmento** (ex: "clínicas odontológicas", "academias", "restaurantes")
- **Slider de raio:** 5 km / 10 km / 25 km / 50 km / 100 km
- **Mini-mapa** (Leaflet + OpenStreetMap): mostra a cidade centralizada com um círculo representando o raio — apenas visual, não afeta a busca real
- **Campo quantidade:** 10 / 20 / 30 resultados (máximo 30)
- **Botão "Buscar Leads com IA"**

### Área de resultados (direita)
- Contador: "X leads encontrados · Y novos"
- Cards individuais (ver seção Cards)
- Leads novos: borda esquerda verde
- Leads já encontrados anteriormente: opacidade reduzida, borda cinza, texto "Já encontrado em DD/MM/AAAA"

### Card de lead (compacto)
- Nome do estabelecimento
- Endereço resumido (logradouro · cidade, UF)
- Badges: telefone, email (quando encontrado), Instagram (quando encontrado)
- Botão "Ver detalhes →"

### Painel de detalhes (ao clicar no card)
- Nome + avaliação Google (estrelas + nº de avaliações)
- Endereço completo + CEP
- Telefone + botão "Abrir no WhatsApp"
- E-mail (quando disponível)
- Instagram (quando disponível)
- Site (quando disponível)
- Dados Receita Federal (quando disponível via Brasil API): CNPJ, Razão Social, Sócios, CNAE, Situação cadastral
- Botão **"Salvar Lead"** → marca `salvo: true`
- Botão **"Ignorar"** → marca `ignorado: true`, remove da lista

---

## Modelo de dados

```prisma
model LeadBuscado {
  id            String   @id @default(cuid())
  placeId       String   @unique        // Google Place ID — chave de deduplicação
  nome          String
  nomeFantasia  String?
  endereco      String
  cidade        String
  estado        String
  telefone      String?
  site          String?
  avaliacao     Float?
  avaliacoes    Int?
  // Enriquecido pela IA
  email         String?
  instagram     String?
  whatsapp      String?
  // Receita Federal (Brasil API)
  cnpj          String?
  razaoSocial   String?
  socios        String[]
  cnae          String?
  situacao      String?
  // Controle
  segmento      String
  raioKm        Int
  ignorado      Boolean  @default(false)
  salvo         Boolean  @default(false)
  buscadoEm     DateTime @default(now())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
}
```

**Deduplicação:** o campo `placeId` (Google Place ID) é único e permanente por estabelecimento. Em cada busca, o sistema checa se o `placeId` já existe no banco para aquele `userId`. Se sim → retorna como "já encontrado" (não reprocessa). Se não → processa e salva.

---

## Rotas de API

### `POST /api/leads/buscar`
**Body:**
```json
{
  "cidade": "São Paulo",
  "estado": "SP",
  "segmento": "clínicas odontológicas",
  "raioKm": 25,
  "limite": 30
}
```

**Fluxo interno:**
1. Google Geocoding API → converte cidade em lat/lng
2. Google Places Text Search API → busca `"{segmento} em {cidade}"`, retorna até `limite` resultados
3. Para cada resultado:
   - a. Verifica `placeId` no banco → se existe, marca como `jaEncontrado: true` e pula etapas b/c/d
   - b. Brasil API → tenta encontrar CNPJ pelo nome do estabelecimento
   - c. OpenRouter AI (`openai/gpt-4o-mini`) → tenta encontrar email e Instagram públicos
   - d. Salva no banco (`LeadBuscado`)
4. Retorna lista: novos primeiro, já encontrados por último

**Response:**
```json
{
  "total": 30,
  "novos": 18,
  "jaEncontrados": 12,
  "leads": [LeadBuscado]
}
```

### `PATCH /api/leads/buscar/[id]/salvar`
Marca `salvo: true` no registro.

### `PATCH /api/leads/buscar/[id]/ignorar`
Marca `ignorado: true` no registro.

### `GET /api/leads/buscar/historico`
Retorna buscas anteriores agrupadas por data/segmento/cidade.

---

## Integrações externas

### Google Places API
- **Endpoints usados:** Text Search, Geocoding
- **Chave:** `GOOGLE_PLACES_API_KEY` (variável de ambiente)
- **Cota gratuita:** $200/mês de crédito (~3.000 text searches)
- **Client:** `lib/google-places.ts`

### OpenRouter AI
- **Modelo:** `openai/gpt-4o-mini` (gratuito no OpenRouter)
- **Chave:** `OPENROUTER_API_KEY` (já fornecida)
- **Uso:** Para cada lead novo, envia prompt pedindo email + Instagram em JSON
- **Prompt:**
  ```
  Você é um pesquisador de contatos empresariais.
  Empresa: "{nome}", cidade: "{cidade}/{estado}", site: "{site}".
  Encontre o Instagram e email público desta empresa.
  Responda APENAS em JSON válido, sem explicações:
  {"instagram": "@handle_ou_null", "email": "email_ou_null"}
  Se não encontrar, retorne null para o campo. Nunca invente dados.
  ```
- **Client:** `lib/openrouter.ts`

### Brasil API
- **Endpoint:** `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`
- **Uso:** Já integrada no projeto (relay server). Para leads, tentativa de match por nome (best-effort, ~50% de sucesso)
- **Client:** já existe em `lib/consultas.ts`

---

## Mapa (Leaflet)

- Biblioteca: `react-leaflet` + `leaflet`
- Tiles: OpenStreetMap (gratuito, sem chave)
- Comportamento:
  - Usuário digita cidade → mapa centraliza na cidade via geocoding
  - Slider de raio → círculo visual cresce/diminui no mapa
  - O círculo é **apenas visual** — a busca real é por cidade (não por coordenadas)
  - Zoom automático para enquadrar o círculo
- Componente: `components/leads/leads-mapa.tsx`

---

## Estrutura de arquivos

```
app/(auth)/app/leads/
└── page.tsx

components/leads/
├── buscador-leads.tsx         ← componente principal (layout C)
├── buscador-sidebar.tsx       ← formulário + mini-mapa
├── buscador-resultados.tsx    ← lista de cards
├── lead-card.tsx              ← card compacto + painel de detalhes
└── leads-mapa.tsx             ← mapa Leaflet

app/api/leads/
├── route.ts                   ← já existe
└── buscar/
    ├── route.ts               ← POST buscar + GET histórico
    └── [id]/
        ├── salvar/route.ts
        └── ignorar/route.ts

lib/
├── google-places.ts           ← client Google Places + Geocoding
├── openrouter.ts              ← client OpenRouter AI
└── leads-buscar.ts            ← orquestração completa

prisma/schema.prisma           ← + model LeadBuscado
```

---

## Dependências novas

```bash
npm install react-leaflet leaflet @types/leaflet
```

---

## Variáveis de ambiente

```bash
# .env
GOOGLE_PLACES_API_KEY=        # Google Cloud Console — Places API + Geocoding API habilitadas
OPENROUTER_API_KEY=or-v1-1b1f58ae01c473044749c2d4f665677153b7e67bc8d0f949c2a2081f576278c9
```

---

## Regras de negócio

1. **Deduplicação por usuário:** um lead com o mesmo `placeId` nunca é processado duas vezes para o mesmo usuário. Aparece como "já encontrado" em buscas posteriores.
2. **Máximo 30 resultados** por busca (limitação da Google Places Text Search por request).
3. **Email e Instagram são best-effort:** a IA tenta encontrar, mas retorna `null` se não achar. Nunca inventa dados.
4. **Raio no mapa é visual:** a busca efetiva é por cidade + segmento no Google Places. O raio serve como referência geográfica para o usuário.
5. **Leads ignorados** não aparecem em buscas futuras para aquele usuário.
6. **Leads salvos** ficam marcados e podem ser gerenciados futuramente (fora do escopo desta spec).

---

## Fora do escopo (futuro)

- Exportar leads para CSV/Excel
- Integração com CRM
- Campanha de email/WhatsApp em massa
- Lead scoring / ranking
- Histórico de contatos com o lead
