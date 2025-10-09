#!/bin/bash

# 🗄️ Script de Configuração de Banco de Dados - UTFPets API
# Este script facilita o gerenciamento dos ambientes de banco de dados

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
        exit 1
    fi
}

# Função para configurar ambiente de teste
setup_test_environment() {
    print_header "Configurando Ambiente de Teste"
    
    print_message "Iniciando containers de teste..."
    docker-compose up -d test-db
    
    print_message "Aguardando banco de teste estar pronto..."
    sleep 10
    
    print_message "Executando migrações no ambiente de teste..."
    docker-compose exec utfpets-app php artisan migrate --force --env=testing
    
    print_message "Executando testes..."
    docker-compose exec utfpets-app php artisan test
    
    print_message "✅ Ambiente de teste configurado com sucesso!"
}

# Função para configurar ambiente de produção
setup_production_environment() {
    print_header "Configurando Ambiente de Produção"
    
    print_warning "⚠️  ATENÇÃO: Esta operação irá executar migrações no banco de PRODUÇÃO!"
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_message "Operação cancelada."
        exit 0
    fi
    
    print_message "Verificando conexão com Supabase..."
    docker-compose exec utfpets-app php artisan tinker --execute="DB::connection()->getPdo(); echo 'Conexão OK';"
    
    print_message "Executando migrações no ambiente de produção..."
    docker-compose exec utfpets-app php artisan migrate --force
    
    print_message "✅ Ambiente de produção configurado com sucesso!"
}

# Função para limpar ambientes
clean_environment() {
    print_header "Limpando Ambientes"
    
    print_message "Parando containers..."
    docker-compose down
    
    print_message "Removendo volumes de teste..."
    docker volume rm utfpets_test_pgdata 2>/dev/null || true
    
    print_message "✅ Ambientes limpos com sucesso!"
}

# Função para mostrar status
show_status() {
    print_header "Status dos Ambientes"
    
    print_message "Containers Docker:"
    docker-compose ps
    
    echo
    print_message "Volumes Docker:"
    docker volume ls | grep utfpets || echo "Nenhum volume encontrado"
    
    echo
    print_message "Conexões de banco configuradas:"
    docker-compose exec utfpets-app php artisan tinker --execute="
        echo 'Teste: ' . (DB::connection('pgsql_testing')->getPdo() ? 'OK' : 'ERRO');
        echo 'Produção: ' . (DB::connection('pgsql')->getPdo() ? 'OK' : 'ERRO');
    " 2>/dev/null || print_warning "Não foi possível verificar conexões"
}

# Função para mostrar ajuda
show_help() {
    echo "🗄️  UTFPets API - Gerenciador de Banco de Dados"
    echo
    echo "Uso: $0 [comando]"
    echo
    echo "Comandos disponíveis:"
    echo "  test        - Configura e executa ambiente de teste"
    echo "  production  - Configura ambiente de produção (Supabase)"
    echo "  clean       - Limpa todos os ambientes"
    echo "  status      - Mostra status dos ambientes"
    echo "  help        - Mostra esta ajuda"
    echo
    echo "Exemplos:"
    echo "  $0 test        # Configura ambiente de teste"
    echo "  $0 production  # Executa migrações na produção"
    echo "  $0 clean       # Limpa tudo"
    echo "  $0 status      # Verifica status"
}

# Verificar se Docker está rodando
check_docker

# Processar argumentos
case "${1:-help}" in
    test)
        setup_test_environment
        ;;
    production)
        setup_production_environment
        ;;
    clean)
        clean_environment
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando inválido: $1"
        echo
        show_help
        exit 1
        ;;
esac
