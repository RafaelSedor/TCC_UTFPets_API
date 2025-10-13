#!/bin/bash

set -e

# Aguarda DB apenas no ambiente de testes (compose local)
if [ "${APP_ENV}" = "testing" ]; then
  echo "[entrypoint] Aguardando PostgreSQL de teste..."
  while ! nc -z test-db 5432; do
    sleep 0.1
  done
  echo "[entrypoint] PostgreSQL de teste pronto!"
fi

echo "[entrypoint] Iniciando setup do Laravel..."

# Verifica e configura o ambiente principal
if [ ! -f .env ]; then
  echo "[entrypoint] Criando arquivo .env a partir de .env.example"
  cp .env.example .env
fi

# Verifica e prepara .env.testing apenas quando em testes
if [ "${APP_ENV}" = "testing" ]; then
  if [ ! -f .env.testing ]; then
    echo "[entrypoint] Criando .env.testing"
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

# Instala as dependencias do Composer (apenas se vendor/ não existir)
if [ ! -d vendor ]; then
  echo "[entrypoint] Instalando dependencias do Composer..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Garante as permissões corretas
echo "[entrypoint] Ajustando permissoes..."
chown -R www-data:www-data storage || true
chmod -R 775 storage || true
chown -R www-data:www-data bootstrap/cache || true
chmod -R 775 bootstrap/cache || true

# Gera a chave somente se não estiver definida
if [ -z "${APP_KEY:-}" ]; then
  php artisan key:generate --no-interaction --force
fi

# Configura o JWT (gera se não estiver definido)
if [ -z "${JWT_SECRET:-}" ]; then
  php artisan jwt:secret --force
fi

# Configura o JWT para ambiente de testes
if [ "${APP_ENV}" = "testing" ]; then
  php artisan jwt:secret --force --env=testing
fi

# Otimiza a aplicação
echo "[entrypoint] Otimizando aplicacao..."
php artisan optimize || true

# Executa migrações automaticamente se habilitado por env
if [ "${MIGRATE_ON_START:-false}" = "true" ]; then
  if [ "${APP_ENV}" = "testing" ]; then
    php artisan migrate --force --env=testing || true
  else
    php artisan migrate --force || true
  fi
fi

echo "[entrypoint] Setup do Laravel concluido!"

# Seleciona modo de execução conforme ambiente
if [ "${RENDER:-false}" = "true" ]; then
  echo "[entrypoint] Ambiente Render detectado; iniciando Nginx + PHP-FPM"
  # Ajusta Nginx para escutar na PORT do Render e FastCGI local
  if [ -f /etc/nginx/conf.d/default.conf ]; then
    sed -ri "s/listen 80;/listen ${PORT:-8080};/" /etc/nginx/conf.d/default.conf || true
    sed -ri "s/fastcgi_pass app:9000;/fastcgi_pass 127.0.0.1:9000;/" /etc/nginx/conf.d/default.conf || true
  fi

  # Inicia PHP-FPM em background
  php-fpm -F &
  PHP_FPM_PID=$!
  echo "[entrypoint] PHP-FPM PID: ${PHP_FPM_PID}"

  # Inicia Nginx em foreground (processo PID 1)
  echo "[entrypoint] Iniciando Nginx em :${PORT:-8080}"
  exec nginx -g 'daemon off;'
else
  echo "[entrypoint] Iniciando PHP-FPM (produção via Nginx externo)"
  exec php-fpm -F
fi

exec php -d variables_order=EGPCS -S 0.0.0.0:${PORT:-8080} -t public public/index.php
