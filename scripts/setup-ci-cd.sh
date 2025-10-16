#!/bin/bash

# Script para configurar CI/CD automaticamente
# Cria Service Account e gera chave para GitHub Actions

set -e

PROJECT_ID="tccutfpets"
SA_NAME="github-actions-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="github-actions-key.json"

echo "========================================="
echo "Configurando CI/CD para UTFPets API"
echo "========================================="
echo ""

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Erro: gcloud CLI não está instalado"
    echo "Instale em: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar autenticação
echo "Verificando autenticação..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Erro: Você não está autenticado no gcloud"
    echo "Execute: gcloud auth login"
    exit 1
fi

echo "✓ Autenticado no gcloud"
echo ""

# Criar Service Account
echo "1/5 Criando Service Account..."
if gcloud iam service-accounts describe ${SA_EMAIL} --project=${PROJECT_ID} &> /dev/null; then
    echo "   ⚠️  Service Account já existe, pulando..."
else
    gcloud iam service-accounts create ${SA_NAME} \
        --project=${PROJECT_ID} \
        --display-name="GitHub Actions Deployer" \
        --description="Service account para deploy automático via GitHub Actions"
    echo "   ✓ Service Account criada"
fi
echo ""

# Adicionar permissão: Compute Instance Admin
echo "2/5 Concedendo permissões..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/compute.instanceAdmin.v1" \
    --quiet
echo "   ✓ roles/compute.instanceAdmin.v1"

# Adicionar permissão: Service Account User
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser" \
    --quiet
echo "   ✓ roles/iam.serviceAccountUser"

# Adicionar permissão: OS Login (para SSH)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/compute.osLogin" \
    --quiet
echo "   ✓ roles/compute.osLogin"
echo ""

# Remover chave antiga se existir
if [ -f "${KEY_FILE}" ]; then
    echo "3/5 Removendo chave antiga..."
    rm -f ${KEY_FILE}
fi

# Criar nova chave JSON
echo "3/5 Gerando chave JSON..."
gcloud iam service-accounts keys create ${KEY_FILE} \
    --iam-account=${SA_EMAIL} \
    --project=${PROJECT_ID}
echo "   ✓ Chave gerada: ${KEY_FILE}"
echo ""

# Verificar se o arquivo foi criado
if [ ! -f "${KEY_FILE}" ]; then
    echo "❌ Erro: Arquivo ${KEY_FILE} não foi criado"
    exit 1
fi

echo "4/5 Verificando configuração..."
if gcloud compute instances describe tccutfpets \
    --zone=southamerica-east1-b \
    --project=${PROJECT_ID} &> /dev/null; then
    echo "   ✓ VM tccutfpets encontrada"
else
    echo "   ⚠️  VM tccutfpets não encontrada (você precisará criar ela primeiro)"
fi
echo ""

# Instruções finais
echo "========================================="
echo "✓ Configuração CI/CD Concluída!"
echo "========================================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Adicionar Secret no GitHub:"
echo "   a) Acesse: https://github.com/SEU-USUARIO/SEU-REPO/settings/secrets/actions"
echo "   b) Clique em 'New repository secret'"
echo "   c) Nome: GCP_SA_KEY"
echo "   d) Valor: Cole TODO o conteúdo do arquivo '${KEY_FILE}'"
echo ""
echo "2. Copiar conteúdo da chave:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    cat ${KEY_FILE} | pbcopy
    echo "   ✓ Conteúdo copiado para área de transferência (macOS)"
elif command -v xclip &> /dev/null; then
    # Linux com xclip
    cat ${KEY_FILE} | xclip -selection clipboard
    echo "   ✓ Conteúdo copiado para área de transferência (Linux)"
else
    # Fallback: mostrar comando
    echo "   Execute: cat ${KEY_FILE}"
fi
echo ""
echo "3. Após adicionar o secret no GitHub:"
echo "   Execute: rm ${KEY_FILE}"
echo "   (Delete a chave local por segurança)"
echo ""
echo "4. Fazer push para master para testar:"
echo "   git add ."
echo "   git commit -m \"chore: configure CI/CD\""
echo "   git push origin master"
echo ""
echo "========================================="
echo ""
echo "⚠️  IMPORTANTE: NÃO COMMITE O ARQUIVO '${KEY_FILE}' NO GIT!"
echo ""
