#!/bin/bash

set -e

echo "🚀 Iniciando aplicação no Render..."

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
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

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

# Inicia Supervisor para gerenciar PHP-FPM, Nginx e Queue Workers
echo "🚀 Iniciando Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

