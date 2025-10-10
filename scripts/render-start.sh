#!/bin/bash

set -e

echo "🚀 Iniciando aplicação no Render..."

# Resolve IPv4 do host do banco (evita problemas com IPv6)
if [ -n "$DB_HOST" ] && [[ ! "$DB_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "🔍 Resolvendo host do banco: $DB_HOST"
    
    # Tenta obter IPv4 do host usando nslookup
    IPV4=$(nslookup "$DB_HOST" 2>/dev/null | grep -A1 "Name:" | grep "Address" | head -n1 | awk '{print $2}' | grep -v ":" || echo "")
    
    if [ -n "$IPV4" ] && [[ "$IPV4" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "✅ IPv4 resolvido: $IPV4"
        echo "📝 Usando IP direto ao invés do hostname"
        export DB_HOST="$IPV4"
    else
        echo "⚠️  Não foi possível resolver IPv4, usando host original"
    fi
else
    echo "ℹ️  Usando configuração de host atual: $DB_HOST"
fi

# Aguarda um pouco antes de tentar conectar
echo "⏳ Aguardando 5 segundos..."
sleep 5

# Gera a chave da aplicação se não existir
if [ -z "$APP_KEY" ]; then
    echo "⚠️  APP_KEY não definida, gerando..."
    php artisan key:generate --force
fi

# Gera o JWT secret se não existir
if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET não definida, gerando..."
    php artisan jwt:secret --force
fi

# Limpa e otimiza caches
echo "🧹 Limpando caches..."
php artisan config:clear || true
php artisan cache:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Executa as migrações
echo "📊 Executando migrações do banco de dados..."
php artisan migrate --force --no-interaction

# Executa os seeders (apenas se necessário)
if [ "$RUN_SEEDERS" = "true" ]; then
    echo "🌱 Executando seeders..."
    php artisan db:seed --force --no-interaction
fi

# Otimiza a aplicação para produção
echo "⚡ Otimizando aplicação..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Cria links simbólicos do storage
echo "🔗 Criando links simbólicos..."
php artisan storage:link || true

echo "✅ Aplicação pronta!"


