#!/bin/bash

set -e

# Aguarda o PostgreSQL estar pronto
echo "🔄 Aguardando PostgreSQL..."
while ! nc -z db 5432; do
    sleep 0.1
done
echo "✅ PostgreSQL está pronto!"

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
    sed -i 's/DB_DATABASE=.*/DB_DATABASE=testing/g' .env.testing
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


# Executa as migrações no ambiente principal
echo "🔄 Executando migrações no ambiente principal..."
php artisan migrate --force

# Otimiza a aplicação
echo "⚡ Otimizando aplicação..."
php artisan optimize

# Gera a documentação Swagger
echo "📚 Gerando documentação Swagger..."
php artisan l5-swagger:generate

# Configura permissões para a documentação
chmod -R 777 storage/api-docs

echo "✅ Documentação Swagger gerada com sucesso!"
echo "✅ Setup do Laravel concluído!"

# Inicia o servidor PHP-FPM
exec php-fpm
