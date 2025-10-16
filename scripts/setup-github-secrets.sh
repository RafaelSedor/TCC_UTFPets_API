#!/bin/bash

# Script para criar GitHub Secrets a partir do .env local
# Requer: GitHub CLI (gh) instalado e autenticado

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "Setup GitHub Secrets from .env"
echo "========================================="
echo ""

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) não está instalado${NC}"
    echo ""
    echo "Instale em:"
    echo "  Windows: winget install GitHub.cli"
    echo "  Mac: brew install gh"
    echo "  Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo ""
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Você não está autenticado no GitHub CLI${NC}"
    echo "Executando autenticação..."
    gh auth login
fi

echo -e "${GREEN}✓ GitHub CLI configurado${NC}"
echo ""

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
    echo "Execute este script na raiz do projeto"
    exit 1
fi

echo -e "${GREEN}✓ Arquivo .env encontrado${NC}"
echo ""

# Lista de variáveis OBRIGATÓRIAS
REQUIRED_VARS=(
    "APP_KEY"
    "JWT_SECRET"
    "DB_HOST"
    "DB_DATABASE"
    "DB_USERNAME"
    "DB_PASSWORD"
    "CLOUDINARY_URL"
    "CLOUDINARY_CLOUD_NAME"
    "CLOUDINARY_API_KEY"
    "CLOUDINARY_API_SECRET"
)

# Lista de variáveis OPCIONAIS (todas as outras do .env)
OPTIONAL_VARS=(
    "APP_NAME"
    "APP_ENV"
    "APP_DEBUG"
    "APP_URL"
    "DB_CONNECTION"
    "DB_PORT"
    "LOG_CHANNEL"
    "LOG_LEVEL"
    "BROADCAST_DRIVER"
    "CACHE_DRIVER"
    "FILESYSTEM_DISK"
    "QUEUE_CONNECTION"
    "SESSION_DRIVER"
    "SESSION_LIFETIME"
    "REDIS_HOST"
    "REDIS_PASSWORD"
    "REDIS_PORT"
    "MAIL_MAILER"
    "MAIL_HOST"
    "MAIL_PORT"
    "MAIL_USERNAME"
    "MAIL_PASSWORD"
    "MAIL_ENCRYPTION"
    "MAIL_FROM_ADDRESS"
    "MAIL_FROM_NAME"
    "JWT_TTL"
    "GOOGLE_CLOUD_PROJECT"
)

# Função para ler valor do .env
get_env_value() {
    local key=$1
    grep "^${key}=" .env | cut -d '=' -f2- | sed 's/^"//' | sed 's/"$//'
}

# Verificar variáveis obrigatórias
echo -e "${YELLOW}Verificando variáveis obrigatórias...${NC}"
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    value=$(get_env_value "$var")
    if [ -z "$value" ]; then
        MISSING_VARS+=("$var")
        echo -e "${RED}  ✗ $var - não encontrado${NC}"
    else
        echo -e "${GREEN}  ✓ $var - encontrado${NC}"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Variáveis obrigatórias faltando no .env:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Configure essas variáveis no .env antes de continuar"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Todas as variáveis obrigatórias encontradas${NC}"
echo ""

# Confirmar antes de criar
echo -e "${YELLOW}Este script irá criar/atualizar os seguintes secrets no GitHub:${NC}"
echo ""
echo "Obrigatórios:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "  - $var"
done
echo ""
echo "Opcionais (se existirem no .env):"
for var in "${OPTIONAL_VARS[@]}"; do
    value=$(get_env_value "$var")
    if [ -n "$value" ]; then
        echo "  - $var"
    fi
done
echo ""

read -p "Deseja continuar? (y/N): " -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelado pelo usuário"
    exit 0
fi

echo ""
echo -e "${YELLOW}Criando secrets no GitHub...${NC}"
echo ""

# Criar secrets obrigatórios
SUCCESS_COUNT=0
FAIL_COUNT=0

for var in "${REQUIRED_VARS[@]}"; do
    value=$(get_env_value "$var")
    if [ -n "$value" ]; then
        if echo "$value" | gh secret set "$var" 2>/dev/null; then
            echo -e "${GREEN}  ✓ $var criado${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${RED}  ✗ $var falhou${NC}"
            ((FAIL_COUNT++))
        fi
    fi
done

# Criar secrets opcionais
for var in "${OPTIONAL_VARS[@]}"; do
    value=$(get_env_value "$var")
    if [ -n "$value" ]; then
        if echo "$value" | gh secret set "$var" 2>/dev/null; then
            echo -e "${GREEN}  ✓ $var criado${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${YELLOW}  ⚠ $var falhou (opcional)${NC}"
        fi
    fi
done

echo ""
echo "========================================="
echo -e "${GREEN}✓ Setup concluído!${NC}"
echo "========================================="
echo ""
echo "Estatísticas:"
echo "  ✓ Secrets criados: $SUCCESS_COUNT"
if [ $FAIL_COUNT -gt 0 ]; then
    echo "  ✗ Falhas: $FAIL_COUNT"
fi
echo ""
echo "Próximos passos:"
echo "1. Verificar secrets em: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/secrets/actions"
echo "2. Fazer push para master para testar deploy"
echo "3. Acompanhar em: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo ""
