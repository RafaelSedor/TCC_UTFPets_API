#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Iniciando setup do UTFPets...${NC}"

# 1. Verificar dependências
echo -e "\n${YELLOW}📦 Verificando dependências...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker não encontrado. Por favor, instale o Docker primeiro.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro.${NC}" >&2; exit 1; }

# 2. Configurar variáveis de ambiente
echo -e "\n${YELLOW}⚙️ Configurando variáveis de ambiente...${NC}"

# Backend
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Arquivo .env do backend criado${NC}"
fi

# Frontend
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✅ Arquivo .env do frontend criado${NC}"
fi

# 3. Gerar chaves necessárias
echo -e "\n${YELLOW}🔑 Gerando chaves...${NC}"

# Gerar APP_KEY para Laravel
docker-compose exec -T backend php artisan key:generate --force
echo -e "${GREEN}✅ APP_KEY gerada${NC}"

# Gerar JWT_SECRET
docker-compose exec -T backend php artisan jwt:secret --force
echo -e "${GREEN}✅ JWT_SECRET gerada${NC}"

# 4. Setup do banco de dados
echo -e "\n${YELLOW}🗄️ Configurando banco de dados...${NC}"
docker-compose exec -T backend php artisan migrate:fresh --seed
echo -e "${GREEN}✅ Migrations e seeds executadas${NC}"

# 5. Otimizações para produção
echo -e "\n${YELLOW}⚡ Otimizando para produção...${NC}"

# Backend
docker-compose exec -T backend composer install --no-dev --optimize-autoloader
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache
docker-compose exec -T backend php artisan view:cache

# Frontend
docker-compose exec -T frontend npm install
docker-compose exec -T frontend npm run build:prod

echo -e "${GREEN}✅ Otimizações concluídas${NC}"

# 6. Verificar serviços
echo -e "\n${YELLOW}🔍 Verificando status dos serviços...${NC}"
docker-compose ps

# 7. Mostrar URLs de acesso
echo -e "\n${GREEN}🌟 Setup concluído! O UTFPets está disponível em:${NC}"
echo -e "📱 Frontend: ${YELLOW}https://utfpets.online${NC}"
echo -e "🔧 API: ${YELLOW}https://api.utfpets.online${NC}"
echo -e "📚 Swagger: ${YELLOW}https://api.utfpets.online/swagger${NC}"

echo -e "\n${GREEN}Para iniciar o sistema, execute:${NC}"
echo -e "docker-compose up -d"