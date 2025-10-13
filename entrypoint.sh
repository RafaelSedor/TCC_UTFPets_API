#!/bin/bash

set -e

# Aguarda DB apenas no ambiente de testes (compose local)
if [ "${APP_ENV}" = "testing" ]; then
  echo "⌛ Aguardando PostgreSQL de teste..."
  while ! nc -z test-db 5432; do
      sleep 0.1
  done
  echo "✅ PostgreSQL de teste está pronto!"
fi

# Configuração inicial do Laravel
echo "🚀 Iniciando setup do Laravel..."

# Verifica e configura o ambiente principal
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
fi

# Verifica e prepara .env.testing apenas quando em testes
if [ "${APP_ENV}" = "testing" ]; then
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
fi

# Instala as dependências do Composer
echo "📦 Instalando dependências..."
composer install --no-interaction --optimize-autoloader

# Garante as permissões corretas
echo "🔒 Configurando permissões..."
chown -R www-data:www-data storage || true
chmod -R 775 storage || true
chown -R www-data:www-data bootstrap/cache || true
chmod -R 775 bootstrap/cache || true

# Gera a chave somente se não estiver definida
if [ -z "${APP_KEY}" ]; then
  php artisan key:generate --no-interaction --force
fi

# Configura o JWT para ambiente principal (se não estiver definido)
echo "🔑 Verificando JWT_SECRET..."
if [ -z "${JWT_SECRET}" ]; then
  php artisan jwt:secret --force
fi

# Configura o JWT para ambiente de testes
if [ "${APP_ENV}" = "testing" ]; then
  echo "🔑 Configurando JWT para ambiente de testes..."
  php artisan jwt:secret --force --env=testing
fi

# Otimiza a aplicação
echo "⚡ Otimizando aplicação..."
php artisan optimize || true

# Executa migrações automaticamente se habilitado por env
if [ "${MIGRATE_ON_START}" = "true" ]; then
  if [ "${APP_ENV}" = "testing" ]; then
    php artisan migrate --force --env=testing || true
  else
    php artisan migrate --force || true
  fi
fi

echo "📚 Documentação Swagger disponível em http://localhost:8081/swagger"
echo "✅ Setup do Laravel concluído!"

# Inicia servidor HTTP embutido do PHP (Render expõe $PORT)
exec php -d variables_order=EGPCS -S 0.0.0.0:${PORT:-8080} -t public public/index.php

