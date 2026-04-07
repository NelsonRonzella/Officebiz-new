# Spec — Fix do bot de vendas: tratamento de `@lid` do WhatsApp

**Data:** 2026-04-07
**Autor:** Nelson + Claude (sessão de debugging sistemático)
**Status:** Aprovado em design, aguardando upgrade da Evolution API antes da implementação no app

---

## ⚠️ LEIA ANTES DE TOCAR EM QUALQUER COISA DESTE SPEC

Antes de propor mudança, fix ou implementação relacionada a este documento, **você (Claude) é OBRIGADO** a ler estes arquivos da memória persistente do projeto:

1. **`~/.claude/projects/C--TRABALHOS-PESSOAL-Projetos-Officebiz/memory/MEMORY.md`** — índice
2. **`~/.claude/projects/C--TRABALHOS-PESSOAL-Projetos-Officebiz/memory/infrastructure.md`** — onde a Evolution API roda (Docker local + Cloudflare Tunnel), onde está o app (Vercel), versão atual da Evolution, dependências críticas
3. **`~/.claude/projects/C--TRABALHOS-PESSOAL-Projetos-Officebiz/memory/deploy-and-git.md`** — branch é `master` (NÃO `main`), deploy via `git push origin master` (Vercel autodeploy, sem CLI)

Também leia, dentro do repositório:

4. **`docs/superpowers/specs/2026-04-06-whatsapp-ai-sales-design.md`** — spec original do bot de vendas (assume que `sendText` funciona; **este spec aqui corrige essa premissa**)
5. **`app/api/webhooks/evolution/route.ts`** — webhook receptor (já tem log temporário de `@lid`)
6. **`lib/sales-phone.ts`** — `resolveLidToPhone()` (estratégia antiga, será substituída)
7. **`lib/whatsapp.ts`** — `sendText()` (precisa aceitar destino `@lid`)
8. **`lib/sales-ai.ts`** — `handleAiReply()` (orquestrador da IA)

**Não comece a implementar nada sem confirmar que leu os 3 arquivos de memória + os 5 arquivos do código.** A causa raiz deste bug levou 5 fixes anteriores erráticos justamente por falta de contexto da infra.

---

## 1. Problema

O bot de vendas não consegue conversar com leads novos. Quando alguém que **nunca** conversou antes com a instância da Evolution manda DM, o webhook recebe `remoteJid: "<id>@lid"` (formato novo de privacidade do WhatsApp) e:

- A conversa é criada no banco com `phone = "lid:<id>"` (chave podre, não é telefone)
- A IA é desativada imediatamente (`aiEnabled = false`)
- Tentativas de resposta — IA **e admin** — falham com `400 Bad Request` da Evolution: `{"exists":false,"jid":"...@lid","name":"<nome real>","number":"...@lid"}`
- A página `/admin/erros` enche de erros `WHATSAPP_SEND` e `ADMIN_SEND` com a mesma mensagem

Sintoma confirmado em 2026-04-06 ~23:14 com a lead "Ana Clara Gabriel" (LID `137967402233954@lid`).

## 2. Causa raiz

Tem **duas camadas**, e a mais importante **não é no código do app**:

### Camada 1 (raiz real) — Evolution API desatualizada

A Evolution API rodando em `whatsapp.officebiz.com.br` está na versão **`2.2.3`**, lançada antes do WhatsApp introduzir o sistema de privacidade `@lid` (em conformidade com leis europeias). Essa versão:

- Não preenche `remoteJidAlt` no payload do webhook
- Não aceita `@lid` como destino válido em `/message/sendText` (rejeita com `exists:false`)
- Não tem mapeamento `LID ↔ phoneNumber` em `findContacts`

Confirmado empiricamente em 2026-04-07 via `curl` direto: testes com `@lid` no campo `number`, com flags `checkJid:false` e `forceSend:true`, todos retornaram 400.

A primeira versão da Evolution com suporte explícito a `@lid` foi a **2.3.5** (out/2025), e a primeira estável-pra-uso foi a **2.3.7** (dez/2025), que adicionou `remoteJidAlt`, "Maintains complete JID for @lid", e fix do Typebot pra responder a `@lid`.

### Camada 2 (consequência no app) — `resolveLidToPhone()` arquiteturalmente errada

Mesmo se a Evolution fosse mais nova, o `lib/sales-phone.ts:37-89` tenta resolver LID buscando contatos com **mesma foto/mesmo pushName** entre `@s.whatsapp.net` pré-existentes. Isso só funciona se o contato JÁ era conhecido da instância **antes** do `@lid` aparecer — exatamente o oposto do caso de uso do bot, que existe pra atender desconhecidos.

### Por que os 5 fixes anteriores não funcionaram

Commits do dia 2026-04-06: `ee66adf`, `ff4c12c`, `79c547c`, `8f14c74`, `cd37bf2`. Todos mexeram em OpenRouter, Stripe, timeout, fallback. **Nenhum** tocou a extração do telefone — porque ninguém sabia que o problema estava uma camada abaixo.

## 3. Solução

Em 2 fases. **A Fase A é pré-requisito de tudo** e é trabalho de infraestrutura, não de código.

### Fase A — Upgrade da Evolution API (Nelson faz)

**Goal:** Subir Evolution local de `2.2.3` → `2.3.7` (ou versão estável mais recente).

**Pré-requisitos:**
- Backup do banco Postgres da Evolution (se houver)
- Backup do volume Docker que armazena a sessão do WhatsApp (caminho típico: `/evolution/instances` ou volume `evolution_data`) — sem isso, será necessário reescanear o QR Code

**Passos (a serem detalhados quando começar):**
1. `docker ps` pra identificar container atual
2. Parar container: `docker stop <name>`
3. Backup: `docker run --rm -v <volume>:/data -v $(pwd):/backup alpine tar czf /backup/evolution-backup-$(date +%F).tgz /data`
4. `docker pull atendai/evolution-api:v2.3.7` (ou tag mais recente)
5. Atualizar `docker-compose.yml` (ou comando `docker run`) com a nova imagem
6. `docker compose up -d` (ou `docker run` equivalente)
7. **Validar:**
   - `curl https://whatsapp.officebiz.com.br/ -H "apikey: $KEY" | jq .version` → deve retornar `"2.3.7"`
   - `curl .../instance/fetchInstances -H "apikey: $KEY"` → `connectionStatus` deve ser `"open"` (se não, reescanear QR)
   - **Teste de fogo:** mandar DM de um número novo (que nunca conversou) e checar `/admin/erros` por novo log do webhook — verificar se `data.key` agora contém `remoteJidAlt` ou similar

**Critério de sucesso da Fase A:** payload do webhook contém o telefone real em algum campo verificável, e `curl POST /message/sendText` com `{"number": "<lid>@lid"}` retorna 200 (não 400).

### Fase B — Ajustes no código do app (Claude faz, depois da Fase A)

Só começa quando Fase A estiver validada. Tem 3 etapas pequenas, **uma de cada vez**, com verificação no meio.

#### B.1 — Extrator de telefone correto (5–10 linhas)
- Em `app/api/webhooks/evolution/route.ts`, adicionar leitura de `data.key.remoteJidAlt` (ou nome do campo confirmado na Fase A) antes de `data.key.remoteJid`
- Se `remoteJidAlt` presente e for `@s.whatsapp.net` → usar como `phone`
- Se ausente → cair pro `remoteJid`, que com a Evolution nova já será aceito pela API
- **Deletar** a chamada a `resolveLidToPhone()` — não é mais necessária
- **Deletar** `lib/sales-phone.ts:resolveLidToPhone()` inteira (a função `normalizePhone` e `isLidJid` ficam)

#### B.2 — `sendText` aceitando `@lid` quando necessário
- Em `lib/whatsapp.ts:sendText()`, garantir que se `phone` já vier no formato `<id>@lid` ou `<num>@s.whatsapp.net`, é passado como está pro campo `number` da Evolution (que na 2.3.7 aceita)
- Não fazer normalização agressiva nesses casos
- Atualizar JSDoc

#### B.3 — Migração e limpeza
- Script único (`scripts/migrate-lid-conversations.ts` ou inline numa rota admin) que:
  - Lê todas as `SalesConversation` com `phone LIKE 'lid:%'`
  - Tenta resolver via novo extrator (se a Evolution nova devolver mapping em `findContacts`)
  - Se resolver: atualiza `phone` e reativa `aiEnabled`
  - Se não: marca conversa como `aiEnabled = false` permanentemente, com `note = "LID legado pré-upgrade"`
- Remover log temporário `[DEBUG @lid]` do `route.ts:65-95`
- Remover log temporário do commit `cd37bf2`

**Critério de sucesso da Fase B:** lead novo manda DM → conversa criada com `phone` correto → IA responde dentro de 30s → resposta chega no WhatsApp do lead → admin vê a conversa funcionando em `/admin/vendas`.

## 4. Decisões de escopo (YAGNI)

**Fora deste spec:**
- Não vou adicionar failover do tunnel local (problema separado, não bloqueia este fix)
- Não vou refatorar `handleAiReply` (funciona, escopo desnecessário)
- Não vou mexer em OpenRouter/Stripe (já foram alvos dos fixes erráticos anteriores; se ainda houver bug é só depois deste fix)
- Não vou criar testes automatizados aqui (existe débito técnico de teste em todo o fluxo de vendas — vira spec próprio)

**Dentro deste spec:**
- Apenas o caminho `webhook → identificação correta do remetente → resposta funcionando`

## 5. Riscos e mitigação

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Upgrade da Evolution quebra a sessão (precisa reescanear QR) | Alta | Backup do volume antes; se quebrar, reescanear é 2 minutos |
| Evolution 2.3.7 ainda tem bugs com `@lid` (a comunidade reporta) | Média | Testar imediato após upgrade; se grave, downgrade pra 2.3.4 (também tem suporte parcial); como último recurso: voltar pra 2.2.3 do backup |
| `remoteJidAlt` não vir preenchido em todos os payloads | Média | Logar todos os casos; tratar `@lid` puro com `aiEnabled = false` + alerta admin (não fingir que funciona) |
| Conversas legadas com `phone="lid:..."` impossíveis de migrar | Baixa | Marcar como "legado", não bloquear o fluxo novo |

## 6. Definition of Done

- [ ] Evolution API rodando em ≥ 2.3.7 (ou versão escolhida)
- [ ] Lead novo (número que nunca conversou) consegue trocar mensagens completas com a IA
- [ ] Página `/admin/erros` zerada de erros `WHATSAPP_SEND`/`ADMIN_SEND` por 24h
- [ ] Admin consegue mandar mensagem manual numa conversa que veio originalmente como `@lid`
- [ ] Logs temporários removidos
- [ ] `lib/sales-phone.ts:resolveLidToPhone()` deletada
- [ ] Conversas legadas migradas ou marcadas
- [ ] Este spec marcado como `Status: Concluído` no topo
