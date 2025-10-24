#!/bin/bash

# ========================================
# UTFPets - Docker Development Helper
# ========================================
# Script para facilitar o desenvolvimento com Docker
# Uso: ./scripts/docker-dev.sh [comando]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Verifica se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando! Por favor, inicie o Docker Desktop."
        exit 1
    fi
}

# Função principal
case "${1}" in
    start)
        print_info "Iniciando ambiente de desenvolvimento..."
        check_docker
        docker-compose -f docker-compose.local.yml up -d
        print_success "Containers iniciados!"
        print_info "Frontend: http://localhost:4201"
        print_info "Backend: http://localhost:8080"
        print_info "Swagger: http://localhost:8081"
        print_info "PostgreSQL: localhost:5432"
        print_info ""
        print_info "Use './scripts/docker-dev.sh logs' para ver os logs"
        ;;

    stop)
        print_info "Parando containers..."
        docker-compose -f docker-compose.local.yml down
        print_success "Containers parados!"
        ;;

    restart)
        print_info "Reiniciando containers..."
        docker-compose -f docker-compose.local.yml restart
        print_success "Containers reiniciados!"
        ;;

    logs)
        if [ -z "${2}" ]; then
            docker-compose -f docker-compose.local.yml logs -f
        else
            docker-compose -f docker-compose.local.yml logs -f "${2}"
        fi
        ;;

    ps)
        docker-compose -f docker-compose.local.yml ps
        ;;

    build)
        if [ -z "${2}" ]; then
            print_info "Rebuilding todos os containers..."
            docker-compose -f docker-compose.local.yml build
        else
            print_info "Rebuilding ${2}..."
            docker-compose -f docker-compose.local.yml build "${2}"
        fi
        print_success "Build completo!"
        ;;

    migrate)
        print_info "Executando migrations..."
        docker-compose -f docker-compose.local.yml exec backend php artisan migrate
        print_success "Migrations executadas!"
        ;;

    seed)
        print_info "Executando seeders..."
        docker-compose -f docker-compose.local.yml exec backend php artisan db:seed
        print_success "Seeders executados!"
        ;;

    fresh)
        print_warning "Isso vai apagar TODOS os dados do banco de dados!"
        read -p "Tem certeza? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Executando migrate:fresh..."
            docker-compose -f docker-compose.local.yml exec backend php artisan migrate:fresh --seed
            print_success "Banco de dados resetado!"
        else
            print_info "Operação cancelada."
        fi
        ;;

    shell)
        if [ -z "${2}" ]; then
            print_error "Especifique o container: backend ou frontend"
            exit 1
        fi
        print_info "Abrindo shell no container ${2}..."
        docker-compose -f docker-compose.local.yml exec "${2}" sh
        ;;

    clean)
        print_warning "Isso vai remover todos os containers, volumes e dados!"
        read -p "Tem certeza? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Limpando tudo..."
            docker-compose -f docker-compose.local.yml down -v
            docker system prune -f
            print_success "Limpeza completa!"
        else
            print_info "Operação cancelada."
        fi
        ;;

    test)
        if [ "${2}" = "backend" ]; then
            print_info "Executando testes do backend..."
            docker-compose -f docker-compose.local.yml exec backend php artisan test
        elif [ "${2}" = "frontend" ]; then
            print_info "Executando testes do frontend..."
            docker-compose -f docker-compose.local.yml exec frontend npm run test:ci
        else
            print_error "Especifique: backend ou frontend"
            exit 1
        fi
        ;;

    *)
        echo "UTFPets - Docker Development Helper"
        echo ""
        echo "Uso: ./scripts/docker-dev.sh [comando]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start              Inicia todos os containers"
        echo "  stop               Para todos os containers"
        echo "  restart            Reinicia todos os containers"
        echo "  logs [serviço]     Mostra logs (opcional: frontend, backend, etc)"
        echo "  ps                 Lista containers em execução"
        echo "  build [serviço]    Rebuild containers (opcional: especificar serviço)"
        echo "  migrate            Executa migrations do Laravel"
        echo "  seed               Executa seeders do Laravel"
        echo "  fresh              Reseta o banco de dados (migrate:fresh --seed)"
        echo "  shell <serviço>    Abre shell no container (backend ou frontend)"
        echo "  clean              Remove todos os containers e volumes"
        echo "  test <tipo>        Executa testes (backend ou frontend)"
        echo ""
        echo "Exemplos:"
        echo "  ./scripts/docker-dev.sh start"
        echo "  ./scripts/docker-dev.sh logs frontend"
        echo "  ./scripts/docker-dev.sh shell backend"
        echo "  ./scripts/docker-dev.sh test backend"
        ;;
esac
