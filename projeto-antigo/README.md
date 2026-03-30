# OfficeBiz

Sistema de gestão de pedidos e serviços com suporte a múltiplos perfis de usuário: admin, licenciado, prestador e cliente.

---

## Requisitos

- PHP 8.2+
- Composer
- Node.js 18+ e NPM
- MySQL (ou SQLite para desenvolvimento local)

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

### 2. Instale as dependências

```bash
composer install
npm install
```

### 3. Configure o ambiente

```bash
cp .env.example .env
php artisan key:generate
```

Edite o `.env` com suas configurações de banco de dados e e-mail.

### 4. Execute as migrations

```bash
php artisan migrate
```

### 5. Compile os assets

```bash
npm run build
```

### 6. Inicie o servidor

```bash
php artisan serve
```

Acesse em: `http://localhost:8000`

---

### Atalho: script de setup completo

```bash
composer setup
```

Para rodar em modo desenvolvimento (servidor + logs + Vite simultâneos):

```bash
composer dev
```

---

## Configuração do Banco de Dados

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=officebiz
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

Para SQLite (desenvolvimento rápido):

```env
DB_CONNECTION=sqlite
```

---

## Configuração de E-mail

O sistema envia e-mails automaticamente para **licenciados** e **prestadores** vinculados ao pedido. O admin recebe notificações dentro do sistema (banco de dados) e via WhatsApp quando configurado.

### Eventos que geram notificação

| Evento | E-mail | WhatsApp (admin) | Sistema |
|---|---|---|---|
| Pedido criado | Licenciado, Cliente | ✅ | Todos |
| Status atualizado | Licenciado, Prestador | ✅ | Todos |
| Nova mensagem adicionada | Licenciado, Prestador | ✅ | Todos |
| Novo anexo adicionado | Licenciado, Prestador | ✅ | Todos |
| Pedido concluído | Licenciado, Prestador, Cliente | ✅ | Todos |
| Etapa avançada | Licenciado, Prestador, Cliente | — | Todos |
| Prazo próximo do vencimento | Licenciado, Prestador | — | Todos |
| Prazo vencido | Licenciado, Prestador | — | Todos |

### Configuração SMTP no `.env`

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.seuservidor.com
MAIL_PORT=587
MAIL_USERNAME=seu@email.com
MAIL_PASSWORD=sua_senha
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@seudominio.com
MAIL_FROM_NAME="OfficeBiz"
```

### Gmail

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu@gmail.com
MAIL_PASSWORD=sua_senha_de_app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=seu@gmail.com
MAIL_FROM_NAME="OfficeBiz"
```

> Use uma **senha de app** do Google. Acesse: Conta Google → Segurança → Verificação em duas etapas → Senhas de app.

### Mailtrap (testes)

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=seu_usuario_mailtrap
MAIL_PASSWORD=sua_senha_mailtrap
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@officebiz.com
MAIL_FROM_NAME="OfficeBiz"
```

---

## Verificação automática de prazos

O sistema verifica diariamente às **08:00** se há etapas de pedidos próximas do vencimento ou já vencidas, disparando notificações automaticamente.

Para que isso funcione em produção, adicione o cron no servidor:

```bash
* * * * * cd /caminho/do/projeto && php artisan schedule:run >> /dev/null 2>&1
```

---

## Armazenamento de Arquivos

Arquivos enviados (anexos de pedidos e contratos) são salvos em `public/uploads/`, usando o disco `uploads` do Laravel. Não requer criação de symlink — compatível com hospedagens compartilhadas como Hostinger.

---

## Fluxos do Sistema

### Perfis de Usuário

| Perfil | Acesso |
|---|---|
| **Admin** | Acesso total: dashboard, financeiro, log, usuários, produtos, contratos, pedidos de todos |
| **Licenciado** | Cria pedidos, gerencia seus clientes, acompanha seus pedidos |
| **Prestador** | Visualiza pedidos disponíveis, aceita pedidos e executa etapas |
| **Cliente** | Visualiza seus próprios pedidos e tutoriais |

### Fluxo de Status do Pedido

```
Pedido criado
      │
      ▼
┌─────────────────────┐
│  AGUARDANDO         │
│  PAGAMENTO          │  ◄── amarelo
└─────────────────────┘
      │
      │ (admin/licenciado confirma pagamento)
      ▼
┌─────────────────────┐
│       PAGO          │  ◄── verde
└─────────────────────┘
      │
      │ (prestador aceita o pedido)
      ▼
┌─────────────────────┐        ┌─────────────────┐
│   EM ANDAMENTO      │ ──────►│    RETORNO      │
│                     │  ◄──── │                 │  ◄── ciano
└─────────────────────┘        └─────────────────┘
      │
      │ (admin conclui o pedido — a partir de EM ANDAMENTO ou RETORNO)
      ▼
┌─────────────────────┐
│    CONCLUÍDO        │  ◄── verde
└─────────────────────┘

      (cancelamento possível em qualquer status)
      ▼
┌─────────────────────┐
│    CANCELADO        │  ◄── vermelho
└─────────────────────┘
```

### Fluxo de Etapas

```
Pedido criado
      │ Etapas copiadas do produto
      ▼
Etapas: [1] [2] [3] ... [N]  (nenhuma iniciada)
      │
      │ (pagamento confirmado)
      ▼
Etapa 1 → started_at = agora
      │
      │ (prestador/admin avança etapa)
      ▼
Etapa 1 → finished_at = agora
Etapa 2 → started_at = agora
      │
      │ (repete até última etapa)
      ▼
Etapa N → finished_at = agora
current_step_id = null  →  Pedido concluído
```

### Tipos de Produto

| Tipo | Descrição |
|---|---|
| **Pontual** | Serviço com etapas definidas, prazos por etapa e progresso rastreado |
| **Recorrente** | Serviço contínuo sem etapas fixas |

---

## Testes E2E (Cypress)

Os testes rodam em um banco **SQLite isolado**, sem tocar no banco de desenvolvimento.

### Configuração inicial (apenas uma vez)

```bash
# Criar o arquivo de banco de dados de teste
php -r "touch('database/testing.sqlite');"

# Rodar migrations e popular com dados de teste
php artisan migrate --env=testing --seed --seeder=TestSeeder --force
```

### Rodando os testes

```bash
# Terminal 1 — servidor no ambiente de teste (mantenha aberto)
php artisan serve --port=8001 --env=testing

# Terminal 2 — interface visual (recomendado para desenvolvimento)
npm run cy:open

# OU rodar todos os testes em modo headless
npm run cy:run

#rodar todos no chrome
npx cypress run --browser chrome

#rodar todos no chrome mostrando o navegador
npx cypress run --browser chrome --headed

# Rodar um arquivo específico
npx cypress run --spec "cypress/e2e/auth/login.cy.ts"

# Rodar um teste específico pelo nome
npx cypress run --spec "cypress/e2e/auth/login.cy.ts" --env grep="deve redirecionar admin"
```

### Usuários disponíveis nos testes

| E-mail                    | Senha      | Papel      |
|---------------------------|------------|------------|
| admin@exemplo.com         | testeteste | Admin      |
| licenciado@exemplo.com    | testeteste | Licenciado |
| cliente@exemplo.com       | testeteste | Cliente    |
| prestador@exemplo.com     | testeteste | Prestador  |
| inativo@exemplo.com       | testeteste | Inativo    |

### Repopular o banco de teste após mudanças no schema

```bash
php artisan migrate:fresh --env=testing --seed --seeder=TestSeeder --force
```

### Estrutura dos testes

```
cypress/e2e/
  auth/          → login, logout, esqueci senha
  admin/
    pedidos/     → criar, listar, detalhes, mensagens
    usuarios/    → clientes, admins, licenciados, prestadores
    produtos.cy.ts
    tutoriais.cy.ts
    logs.cy.ts
    financeiro.cy.ts
  licenciado/    → pedidos, clientes, tutoriais
  prestador/     → pedidos
  cliente/       → pedidos
  fluxos/        → fluxos completos de pedido
  ui/            → dark mode, notificações
```

---

## Tecnologias

- **Laravel 12** + **Breeze** — Framework e autenticação
- **Tailwind CSS** + **Alpine.js** — Interface responsiva com dark mode
- **Blade Heroicons** — Ícones
- **Spatie Activity Log** — Registro de atividades

---

## Licença

Uso privado.
