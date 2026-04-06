# Automação INPI — Registro de Marca

> Data: 2026-04-05
> Status: Aprovado

---

## Contexto

OfficeBiz é uma plataforma SaaS para serviços empresariais no Brasil. O admin (OfficeBiz) vende serviços para licenciados, que revendem para clientes finais. O registro de marca no INPI é um dos produtos principais.

### Modelo de negócio

- **Licenciado** paga R$660 pro admin (OfficeBiz) pelo serviço de registro
- **Licenciado** cobra do cliente dele o quanto quiser (ex: R$2.000)
- **Cliente nunca vê** o preço cobrado pelo admin
- No fluxo normal (~90% dos casos), o sistema faz tudo automaticamente — prestador não age
- Prestador recebe R$100 como plantão e só é acionado em exceções (exigência, oposição, recurso)
- Taxas do INPI (GRU) são pagas pelo licenciado ou pelo cliente, conforme escolha do licenciado

---

## Modelo de dados

### Novo modelo: `TrademarkOrder` (1:1 com Order)

```
TrademarkOrder
├── id
├── orderId              (FK → Order, unique)
│
│  // Titular (dono da marca)
├── titularNome
├── titularDocumento     (CPF ou CNPJ)
├── titularEndereco
├── titularCidade
├── titularEstado
├── titularCep
│
│  // Marca
├── marcaNome
├── marcaApresentacao    (NOMINATIVA | MISTA)
├── marcaNatureza        (PRODUTO | SERVICO | COLETIVA | CERTIFICACAO)
├── classeNice           (1-45)
├── especificacao        (descrição dos produtos/serviços)
├── imagemUrl            (URL da logo, se mista — nullable)
│
│  // Responsável pelas taxas
├── responsavelTaxas     (LICENCIADO | CLIENTE)
├── responsavelTaxasTelefone  (WhatsApp de quem paga)
│
│  // Análise de viabilidade (IA)
├── scoreViabilidade     (0-100)
├── analiseViabilidade   (JSON: conflitos, justificativa, recomendação)
│
│  // GRU (depósito)
├── gruUrl               (URL/PDF da GRU)
├── gruCodBarras         (código de barras)
├── gruValor             (centavos)
├── gruPaga              (boolean, default false)
├── gruComprovante       (URL do comprovante de pagamento)
│
│  // GRU (concessão — gerada quando deferido)
├── gruConcessaoUrl
├── gruConcessaoPaga
├── gruConcessaoComprovante
│
│  // Depósito e acompanhamento
├── numeroProcessoInpi   (após depósito)
├── statusInpi           (último status capturado)
├── ultimaConsultaInpi   (datetime)
├── depositadoEm         (datetime)
├── depositoErro         (texto se falhou)
│
├── createdAt
├── updatedAt
```

O modelo `Order` existente continua gerenciando o fluxo geral (status, steps, pagamento via Stripe, mensagens). O `TrademarkOrder` guarda apenas dados específicos de marca.

---

## Fluxo do pedido de marca (OrderSteps automáticos)

### Step 1: DADOS_MARCA

Licenciado preenche formulário:

- Dados do titular: nome, CPF/CNPJ, endereço completo
- Dados da marca: nome, apresentação (nominativa/mista), natureza, classe Nice (1-45), especificação
- Upload de imagem (se mista)
- Responsável pelas taxas: licenciado ou cliente
- Telefone WhatsApp do responsável

**Validação de imagem (automática):**
- Formato: JPEG/JPG
- Dimensões: 945x945px
- Tamanho: máximo 2MB
- Fundo: preferencialmente branco
- Se não atender: mensagem clara do que corrigir
- Quando possível: conversão automática (PNG → JPG, redimensionamento)

**Validação de classe Nice:**
- Licenciado escolhe a classe
- Sistema consulta INPI (relay existente) para verificar se já existe marca com mesmo nome na classe
- Se encontrar: aviso ao licenciado (não bloqueia, apenas informa)

### Step 2: ANALISE_VIABILIDADE

Executa automaticamente após step 1:

**Análise de nome via IA (OpenRouter/LLM):**
1. Busca marcas existentes na mesma classe Nice via relay (`/inpi/marca`)
2. Envia resultados pro LLM com prompt de análise:
   - Semelhança fonética (sons parecidos: "OfficeBiz" vs "OficeBis")
   - Semelhança semântica (significado: "QuickDog" vs "FastDog")
   - Semelhança ortográfica (escrita: "Marca" vs "Marka")
3. LLM retorna análise estruturada

**Resultado:**
- Score 0-100 (chance de aprovação)
- Lista de marcas conflitantes com grau de risco
- Justificativa em texto
- Recomendação: SEGURO (>=70) / ATENCAO (50-69) / RISCO_ALTO (<50)

**Exibição:**
- Score >= 70: badge verde "Boa chance de aprovação"
- Score 50-69: badge amarelo "Atenção — marcas similares encontradas"
- Score < 50: badge vermelho "Risco alto de contestação"
- Licenciado decide se continua (sistema não bloqueia)

**Comparação de imagens/logos: v2** (não entra nesta versão).

### Step 3: GRU_GERADA

Bot (Playwright no relay) acessa `gru.inpi.gov.br`:

1. Preenche dados: serviço (depósito de marca), CPF/CNPJ do titular
2. Gera a GRU
3. Captura PDF + código de barras
4. Salva no `TrademarkOrder` (gruUrl, gruCodBarras, gruValor)
5. Envia PDF via WhatsApp pro responsável pelas taxas
6. Notifica licenciado + cliente que a GRU foi gerada

### Step 4: AGUARDANDO_GRU

Sistema aguarda confirmação de pagamento:

- Botão "GRU paga" disponível no pedido
- Upload do comprovante de pagamento
- Qualquer parte pode confirmar (licenciado ou cliente)
- Ao confirmar: `gruPaga = true`, `gruComprovante` salvo, fluxo avança

### Step 5: DEPOSITO

Bot (Playwright no relay) acessa e-INPI:

1. Login com certificado digital A1
2. Preenche formulário de depósito com dados do TrademarkOrder
3. Upload da imagem (se mista)
4. Submete pedido
5. Captura número do processo
6. Salva: `numeroProcessoInpi`, `depositadoEm`

**Se falhar:**
- Salva erro em `depositoErro`
- Notifica prestador + admin para depósito manual
- Prestador recebe todos os dados pré-preenchidos num checklist

### Step 6: ACOMPANHAMENTO

Cron job diário consulta status via relay existente (`GET /inpi?q=<processo>`):

- Status normal → atualiza `statusInpi` + `ultimaConsultaInpi`
- Exigência → notifica prestador + licenciado + admin (prazo 60 dias)
- Oposição → notifica prestador + licenciado + admin (prazo 30 dias)
- Deferido → gera GRU de concessão (salva em `gruConcessaoUrl`), envia pro responsável, aguarda pagamento (`gruConcessaoPaga`), notifica todos
- Indeferido → notifica todos, prestador avalia recurso
- Concedido → marca registrada, pedido concluído

---

## Arquitetura do Worker INPI

Extensão do relay existente (`relay/inpi-server.mjs`):

```
relay/
├── inpi-server.mjs           (servidor HTTP — já existe, ganha novas rotas)
├── browser/
│   ├── login-a1.mjs          (Playwright: login com certificado A1)
│   ├── gru-generator.mjs     (Playwright: gera GRU em gru.inpi.gov.br)
│   └── deposito-marca.mjs    (Playwright: faz depósito no e-INPI)
├── cert/
│   └── certificado.pfx       (certificado A1 — gitignored)
└── node_modules/
```

**Novos endpoints:**

```
POST /gru/gerar
  Body: { titularDocumento, titularNome, servico }
  Retorna: { pdf: base64, codBarras, valor }

POST /deposito/marca
  Body: { titular{...}, marca{...}, imagemBase64?, classeNice, especificacao }
  Retorna: { numeroProcesso, sucesso: true } ou { erro, sucesso: false }

GET /processo/status?q=<numero>
  (já existe como GET /inpi?q=<numero>)
```

**Segurança:**
- Mesma autenticação via header `X-Relay-Secret`
- Certificado A1 protegido por senha via env `CERT_PASSWORD`
- Endpoints de escrita exigem orderId válido no body

**Variáveis de ambiente do relay:**
```
RELAY_SECRET=<secret>
CERT_PATH=./cert/certificado.pfx
CERT_PASSWORD=<senha-do-certificado>
```

---

## Notificações WhatsApp (genérico para todos os pedidos)

Notificação por WhatsApp em cada mudança de etapa vale para **qualquer pedido** no sistema, não só registro de marca.

### Quem recebe em cada evento

| Evento | Licenciado | Cliente | Prestador | Admin |
|--------|-----------|---------|-----------|-------|
| Pedido criado | sim | sim | - | sim |
| Análise viabilidade pronta | sim | sim | - | - |
| GRU gerada | sim | sim* | - | - |
| GRU paga confirmada | sim | sim | - | - |
| Depósito realizado | sim | sim | - | sim |
| Mudança status INPI | sim | sim | sim | sim |
| Exigência/oposição | sim | sim | sim | sim |
| Deferido (aprovado) | sim | sim | sim | sim |
| GRU concessão gerada | sim | sim* | - | - |
| Depósito falhou | sim | - | sim | sim |

*\*GRU: PDF vai só pro responsável pelo pagamento. O outro recebe texto avisando que a GRU foi gerada.*

### Mensagens exemplo

- "Pedido de registro da marca **XPTO** realizado com sucesso! Aguarde as próximas etapas."
- "Análise de viabilidade concluída: score **87%** — Boa chance de aprovação!"
- "A guia de pagamento (GRU) do INPI foi gerada. Valor: R$355,00"
- "A GRU do INPI foi paga. O depósito será realizado em breve."
- "Marca **XPTO** depositada no INPI! Processo nº 923.456.789. Acompanhe pelo app."
- "Atualização INPI: marca **XPTO** foi deferida! Parabéns!"
- "Atenção: o INPI emitiu uma exigência para a marca **XPTO**. Prazo: 60 dias."

### Fallback

Se WhatsApp falhar (Evolution API fora, número inválido): notificação interna no app (sino) como fallback. Todas as notificações WhatsApp também geram notificação no app.

---

## Variáveis de ambiente novas

```
# Relay (já existem, precisam ser configuradas)
INPI_RELAY_URL=<url-cloudflare-tunnel>
INPI_RELAY_SECRET=<secret>

# Relay local (novas)
CERT_PATH=./cert/certificado.pfx
CERT_PASSWORD=<senha-do-certificado>

# WhatsApp (já existem)
EVOLUTION_API_URL=<url>
EVOLUTION_API_KEY=<key>
EVOLUTION_API_INSTANCE=officebiz
```

---

## Fora de escopo (v2)

- Comparação visual de logos/imagens com IA
- Detecção automática de pagamento da GRU (integração bancária)
- Recurso automático contra indeferimento
- Renovação automática de marca (a cada 10 anos)
- Depósito de marca tridimensional
