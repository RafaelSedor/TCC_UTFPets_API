#!/bin/bash

set -e

# Aguarda o PostgreSQL de teste estar pronto
echo "🔄 Aguardando PostgreSQL de teste..."
while ! nc -z test-db 5432; do
    sleep 0.1
done
echo "✅ PostgreSQL de teste está pronto!"

# Configuração inicial do Laravel
echo "🚀 Iniciando setup do Laravel..."

# Verifica e configura o ambiente principal
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
fi

# Verifica e configura o ambiente de testes
if [ ! -f .env.testing ]; then
    echo "Criando arquivo .env.testing..."
    cp .env.example .env.testing
    # Configura as variáveis para o banco de teste Docker
    sed -i 's/DB_CONNECTION=.*/DB_CONNECTION=pgsql_testing/' .env.testing
    sed -i 's/DB_HOST=.*/DB_HOST=test-db/' .env.testing
    sed -i 's/DB_PORT=.*/DB_PORT=5432/' .env.testing
    sed -i 's/DB_DATABASE=.*/DB_DATABASE=utfpets_test/' .env.testing
    sed -i 's/DB_USERNAME=.*/DB_USERNAME=test_user/' .env.testing
    sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=test_password/' .env.testing
fi

# Instala as dependências do Composer
echo "📦 Instalando dependências..."
composer install --no-interaction --optimize-autoloader

# Garante as permissões corretas
echo "🔒 Configurando permissões..."
chown -R www-data:www-data storage
chmod -R 775 storage
chown -R www-data:www-data bootstrap/cache
chmod -R 775 bootstrap/cache

# Gera a chave da aplicação se não existir
php artisan key:generate --no-interaction --force

# Configura o JWT para ambiente principal
echo "🔑 Configurando JWT para ambiente principal..."
php artisan jwt:secret --force

# Configura o JWT para ambiente de testes
echo "🔑 Configurando JWT para ambiente de testes..."
php artisan jwt:secret --force --env=testing


# NOTA: As migrações devem ser executadas manualmente quando necessário
echo "ℹ️  Para executar migrações:"
echo "   - Teste: php artisan migrate --force --env=testing"
echo "   - Produção: php artisan migrate --force"
echo ""
echo "✅ Setup do Laravel concluído!"
echo "✅ Aplicação pronta para uso!"

# Otimiza a aplicação
echo "⚡ Otimizando aplicação..."
php artisan optimize

# Documentação Swagger será servida pelo container externo
echo "📚 Documentação Swagger disponível em http://localhost:8081/swagger"
echo "✅ Setup do Laravel concluído!"

# Inicia o servidor PHP-FPM
exec php-fpm
