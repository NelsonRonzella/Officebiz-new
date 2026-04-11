#!/usr/bin/env bash
# ============================================================================
# OfficeBiz — Setup da VPS Contabo (Ubuntu 24.04)
# Roda como root via: bash vps-setup.sh
#
# O que faz:
#   1. Hardening basico (UFW, Fail2ban, usuario non-root)
#   2. Instala Docker + Docker Compose
#   3. Instala Nginx + Certbot (reverse proxy + SSL)
#   4. Deploy Evolution API (whatsapp.officebiz.com.br)
#   5. Deploy n8n (n8n.officebiz.com.br)
#
# Prerequisito: DNS A records apontando pro IP da VPS:
#   - whatsapp.officebiz.com.br -> IP
#   - n8n.officebiz.com.br -> IP
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DOMAIN_EVOLUTION="whatsapp.officebiz.com.br"
DOMAIN_N8N="n8n.officebiz.com.br"
APP_USER="officebiz"
EVOLUTION_DIR="/home/${APP_USER}/evolution"
N8N_DIR="/home/${APP_USER}/n8n"

# ---------------------------------------------------------------------------
# Cores pra output
# ---------------------------------------------------------------------------
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }

# ---------------------------------------------------------------------------
# Verificacoes
# ---------------------------------------------------------------------------
if [[ $EUID -ne 0 ]]; then
  err "Rode como root: sudo bash vps-setup.sh"
fi

echo ""
echo "============================================"
echo "  OfficeBiz VPS Setup — Contabo Ubuntu 24.04"
echo "  Evolution API + n8n"
echo "============================================"
echo ""

# ---------------------------------------------------------------------------
# 1. Atualizar sistema
# ---------------------------------------------------------------------------
log "Atualizando pacotes..."
apt update -y && apt upgrade -y
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# ---------------------------------------------------------------------------
# 2. Criar usuario non-root
# ---------------------------------------------------------------------------
if id "${APP_USER}" &>/dev/null; then
  warn "Usuario ${APP_USER} ja existe, pulando..."
else
  log "Criando usuario ${APP_USER}..."
  adduser --disabled-password --gecos "" "${APP_USER}"
  usermod -aG sudo "${APP_USER}"
  echo "${APP_USER} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${APP_USER}
fi

# ---------------------------------------------------------------------------
# 3. Firewall (UFW)
# ---------------------------------------------------------------------------
log "Configurando UFW..."
apt install -y ufw
# IMPORTANTE: libera SSH ANTES de ativar o firewall pra nao perder acesso
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (Certbot challenge)
ufw allow 443/tcp   # HTTPS (Nginx)
ufw default deny incoming
ufw default allow outgoing
# Recarrega as regras antes de ativar (garante que SSH ta liberado)
ufw reload 2>/dev/null || true
ufw --force enable
log "Firewall ativo: 22, 80, 443"
# Confirma que SSH ta aberto (seguranca extra)
ufw status | grep "22/tcp" || { ufw allow 22/tcp && ufw reload; }

# ---------------------------------------------------------------------------
# 4. Fail2ban
# ---------------------------------------------------------------------------
log "Instalando Fail2ban..."
apt install -y fail2ban
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 5
bantime  = 3600
findtime = 600
EOF
systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2ban ativo (SSH: 5 tentativas = ban 1h)"

# ---------------------------------------------------------------------------
# 5. Docker + Docker Compose
# ---------------------------------------------------------------------------
if command -v docker &>/dev/null; then
  warn "Docker ja instalado, pulando..."
else
  log "Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "${APP_USER}"
  systemctl enable docker
  log "Docker instalado"
fi

# ---------------------------------------------------------------------------
# 6. Nginx + Certbot
# ---------------------------------------------------------------------------
log "Instalando Nginx + Certbot..."
apt install -y nginx certbot python3-certbot-nginx

# --- Nginx: Evolution API ---
cat > /etc/nginx/sites-available/evolution <<EOF
server {
    listen 80;
    server_name ${DOMAIN_EVOLUTION};

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        client_max_body_size 50M;
    }
}
EOF

# --- Nginx: n8n ---
cat > /etc/nginx/sites-available/n8n <<EOF
server {
    listen 80;
    server_name ${DOMAIN_N8N};

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        client_max_body_size 50M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/evolution /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
log "Nginx configurado para ${DOMAIN_EVOLUTION} e ${DOMAIN_N8N}"

# ---------------------------------------------------------------------------
# 7. SSL via Let's Encrypt
# ---------------------------------------------------------------------------
warn "Tentando obter certificados SSL..."
warn "IMPORTANTE: Os DNS A records precisam apontar pro IP desta VPS!"
echo "  - ${DOMAIN_EVOLUTION} -> IP"
echo "  - ${DOMAIN_N8N} -> IP"
echo ""
read -p "Os DNS ja estao apontando pra ca? (s/n): " dns_ready
if [[ "$dns_ready" == "s" || "$dns_ready" == "S" ]]; then
  certbot --nginx -d "${DOMAIN_EVOLUTION}" -d "${DOMAIN_N8N}" \
    --non-interactive --agree-tos --email admin@officebiz.com.br --redirect
  log "SSL ativo para ambos os dominios"
else
  warn "SSL pulado. Rode depois:"
  warn "  certbot --nginx -d ${DOMAIN_EVOLUTION} -d ${DOMAIN_N8N} --redirect"
fi

# ---------------------------------------------------------------------------
# 8. Deploy Evolution API
# ---------------------------------------------------------------------------
log "Preparando Evolution API..."
mkdir -p "${EVOLUTION_DIR}"

cat > "${EVOLUTION_DIR}/docker-compose.yml" <<'COMPOSE'
services:
  postgres:
    image: postgres:16-alpine
    container_name: evolution-v2-pg
    restart: unless-stopped
    environment:
      POSTGRES_USER: evolution
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: evolution
    volumes:
      - evolution_v2_pg:/var/lib/postgresql/data
    networks:
      - evolution-v2

  evolution:
    image: evoapicloud/evolution-api:v2.3.7
    container_name: evolution-v2
    restart: unless-stopped
    depends_on:
      - postgres
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      SERVER_URL: ${SERVER_URL}
      AUTHENTICATION_API_KEY: ${AUTHENTICATION_API_KEY}
      LANGUAGE: pt-BR
      LOG_LEVEL: ERROR,WARN,INFO,LOG,WEBHOOKS
      LOG_COLOR: "false"
      LOG_BAILEYS: error

      DATABASE_ENABLED: "true"
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: postgresql://evolution:${POSTGRES_PASSWORD}@postgres:5432/evolution?schema=public
      DATABASE_CONNECTION_CLIENT_NAME: evolution_v2
      DATABASE_SAVE_DATA_INSTANCE: "true"
      DATABASE_SAVE_DATA_NEW_MESSAGE: "true"
      DATABASE_SAVE_MESSAGE_UPDATE: "true"
      DATABASE_SAVE_DATA_CONTACTS: "true"
      DATABASE_SAVE_DATA_CHATS: "true"
      DATABASE_SAVE_DATA_LABELS: "true"
      DATABASE_SAVE_DATA_HISTORIC: "true"

      CACHE_REDIS_ENABLED: "false"
      CACHE_LOCAL_ENABLED: "true"

      CONFIG_SESSION_PHONE_CLIENT: OfficeBiz
      CONFIG_SESSION_PHONE_NAME: Chrome

      DEL_INSTANCE: "false"
      QRCODE_LIMIT: "30"
      WEBHOOK_GLOBAL_ENABLED: "false"
      AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES: "true"
    networks:
      - evolution-v2

volumes:
  evolution_v2_pg:

networks:
  evolution-v2:
COMPOSE

# Gerar .env com senhas seguras
EVO_PG_PASS=$(openssl rand -hex 16)
EVO_API_KEY=$(openssl rand -hex 24)

cat > "${EVOLUTION_DIR}/.env" <<EOF
POSTGRES_PASSWORD=${EVO_PG_PASS}
SERVER_URL=https://${DOMAIN_EVOLUTION}
AUTHENTICATION_API_KEY=${EVO_API_KEY}
EOF

chown -R "${APP_USER}:${APP_USER}" "${EVOLUTION_DIR}"

log "Subindo Evolution API..."
cd "${EVOLUTION_DIR}"
sudo -u "${APP_USER}" docker compose up -d

# ---------------------------------------------------------------------------
# 9. Deploy n8n
# ---------------------------------------------------------------------------
log "Preparando n8n..."
mkdir -p "${N8N_DIR}"

N8N_PG_PASS=$(openssl rand -hex 16)
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)

cat > "${N8N_DIR}/docker-compose.yml" <<'COMPOSE'
services:
  n8n-postgres:
    image: postgres:16-alpine
    container_name: n8n-pg
    restart: unless-stopped
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${N8N_DB_PASSWORD}
      POSTGRES_DB: n8n
    volumes:
      - n8n_pg:/var/lib/postgresql/data
    networks:
      - n8n

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    depends_on:
      - n8n-postgres
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      # Banco
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: n8n-postgres
      DB_POSTGRESDB_PORT: "5432"
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: ${N8N_DB_PASSWORD}

      # URL publica
      N8N_HOST: ${N8N_HOST}
      N8N_PORT: "5678"
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://${N8N_HOST}/

      # Seguranca
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}

      # Timezone
      GENERIC_TIMEZONE: America/Sao_Paulo
      TZ: America/Sao_Paulo

      # Execucao
      EXECUTIONS_DATA_PRUNE: "true"
      EXECUTIONS_DATA_MAX_AGE: "168"
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n

volumes:
  n8n_pg:
  n8n_data:

networks:
  n8n:
COMPOSE

cat > "${N8N_DIR}/.env" <<EOF
N8N_DB_PASSWORD=${N8N_PG_PASS}
N8N_HOST=${DOMAIN_N8N}
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
EOF

chown -R "${APP_USER}:${APP_USER}" "${N8N_DIR}"

log "Subindo n8n..."
cd "${N8N_DIR}"
sudo -u "${APP_USER}" docker compose up -d

# ---------------------------------------------------------------------------
# Espera os serviços iniciarem
# ---------------------------------------------------------------------------
log "Aguardando servicos iniciarem (15s)..."
sleep 15

# Testa Evolution
if curl -sf http://127.0.0.1:8080/ -H "apikey: ${EVO_API_KEY}" > /dev/null 2>&1; then
  log "Evolution API rodando!"
else
  warn "Evolution ainda nao respondeu. Verifique: docker logs evolution-v2"
fi

# Testa n8n
if curl -sf http://127.0.0.1:5678/healthz > /dev/null 2>&1; then
  log "n8n rodando!"
else
  warn "n8n ainda nao respondeu. Verifique: docker logs n8n"
fi

# ---------------------------------------------------------------------------
# Resumo final
# ---------------------------------------------------------------------------
VPS_IP=$(curl -s ifconfig.me)
echo ""
echo "============================================"
echo "  SETUP COMPLETO!"
echo "============================================"
echo ""
echo "  IP da VPS: ${VPS_IP}"
echo ""
echo "  ── Evolution API ──"
echo "  Dominio:   https://${DOMAIN_EVOLUTION}"
echo "  API Key:   ${EVO_API_KEY}"
echo "  PG Pass:   ${EVO_PG_PASS}"
echo "  Diretorio: ${EVOLUTION_DIR}"
echo "  .env:      ${EVOLUTION_DIR}/.env"
echo ""
echo "  ── n8n ──"
echo "  Dominio:   https://${DOMAIN_N8N}"
echo "  PG Pass:   ${N8N_PG_PASS}"
echo "  Enc Key:   ${N8N_ENCRYPTION_KEY}"
echo "  Diretorio: ${N8N_DIR}"
echo "  .env:      ${N8N_DIR}/.env"
echo ""
echo "  ── PROXIMOS PASSOS ──"
echo "  1. Aponte DNS (A records):"
echo "     ${DOMAIN_EVOLUTION} -> ${VPS_IP}"
echo "     ${DOMAIN_N8N} -> ${VPS_IP}"
echo ""
echo "  2. Se nao fez SSL, rode:"
echo "     certbot --nginx -d ${DOMAIN_EVOLUTION} -d ${DOMAIN_N8N} --redirect"
echo ""
echo "  3. Atualize na Vercel:"
echo "     EVOLUTION_API_URL=https://${DOMAIN_EVOLUTION}"
echo "     EVOLUTION_API_KEY=${EVO_API_KEY}"
echo ""
echo "  4. Acesse https://${DOMAIN_N8N} e crie sua conta admin"
echo ""
echo "  5. Acesse /admin/whatsapp no OfficeBiz e escaneie o QR code"
echo ""
echo "  IMPORTANTE: Salve todas as senhas acima!"
echo ""
