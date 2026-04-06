#!/bin/bash
# Script para tentar criar instância Oracle Cloud A1 automaticamente
# Fica tentando até conseguir capacidade disponível
#
# PRÉ-REQUISITOS:
# 1. Instalar OCI CLI: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm
# 2. Configurar: oci setup config
# 3. Preencher as variáveis abaixo com seus dados do Oracle Cloud

# ============================================
# CONFIGURAÇÃO - PREENCHA COM SEUS DADOS
# ============================================

# Encontre em: OCI Console > Profile > Tenancy
COMPARTMENT_ID="ocid1.tenancy.oc1..SEU_COMPARTMENT_ID"

# Encontre em: OCI Console > Compute > Instances > Create > copie o AD name
# Tente todos os ADs disponíveis na sua região
AVAILABILITY_DOMAIN="AD-1"

# Encontre em: OCI Console > Compute > Images > Oracle Linux 9 (aarch64)
IMAGE_ID="ocid1.image.oc1..SEU_IMAGE_ID"

# Encontre em: OCI Console > Networking > VCN > Subnet
SUBNET_ID="ocid1.subnet.oc1..SEU_SUBNET_ID"

# SSH - caminho da sua chave pública
SSH_KEY_FILE="$HOME/.ssh/id_rsa.pub"

# Recursos (máximo free tier: 4 OCPU + 24GB RAM total)
OCPUS=2
MEMORY_GB=12

# Nome da instância
INSTANCE_NAME="evolution-api-server"

# Intervalo entre tentativas (em segundos)
INTERVALO=60

# ============================================
# NÃO EDITAR ABAIXO
# ============================================

TENTATIVA=0
SHAPE="VM.Standard.A1.Flex"

echo "============================================"
echo " Oracle Cloud A1 - Auto Create Instance"
echo "============================================"
echo "Shape: $SHAPE"
echo "OCPUs: $OCPUS | RAM: ${MEMORY_GB}GB"
echo "Intervalo: ${INTERVALO}s entre tentativas"
echo "Pressione Ctrl+C para parar"
echo "============================================"
echo ""

while true; do
    TENTATIVA=$((TENTATIVA + 1))
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$TIMESTAMP] Tentativa #$TENTATIVA..."

    RESULT=$(oci compute instance launch \
        --compartment-id "$COMPARTMENT_ID" \
        --availability-domain "$AVAILABILITY_DOMAIN" \
        --shape "$SHAPE" \
        --shape-config "{\"ocpus\": $OCPUS, \"memoryInGBs\": $MEMORY_GB}" \
        --image-id "$IMAGE_ID" \
        --subnet-id "$SUBNET_ID" \
        --display-name "$INSTANCE_NAME" \
        --assign-public-ip true \
        --ssh-authorized-keys-file "$SSH_KEY_FILE" \
        --wait-for-state RUNNING \
        --max-wait-seconds 300 \
        2>&1)

    if echo "$RESULT" | grep -q '"lifecycle-state": "RUNNING"'; then
        echo ""
        echo "============================================"
        echo " INSTÂNCIA CRIADA COM SUCESSO!"
        echo "============================================"
        echo "$RESULT" | grep -E '"id"|"display-name"|"lifecycle-state"|"public-ip"'
        echo ""

        # Notificação sonora (Linux/Mac)
        echo -e "\a\a\a"

        exit 0
    fi

    if echo "$RESULT" | grep -qi "out of capacity"; then
        echo "[$TIMESTAMP] Sem capacidade. Próxima tentativa em ${INTERVALO}s..."
    elif echo "$RESULT" | grep -qi "limit exceeded"; then
        echo "[$TIMESTAMP] ERRO: Limite de instâncias atingido. Verifique se já existe uma instância A1."
        exit 1
    elif echo "$RESULT" | grep -qi "authorization\|authenticate"; then
        echo "[$TIMESTAMP] ERRO: Problema de autenticação. Execute 'oci setup config'."
        exit 1
    else
        echo "[$TIMESTAMP] Erro: $(echo "$RESULT" | tail -3)"
        echo "Tentando novamente em ${INTERVALO}s..."
    fi

    sleep $INTERVALO
done
