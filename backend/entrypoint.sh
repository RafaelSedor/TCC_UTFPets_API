#!/bin/bash

set -e

# Diretórios/arquivos padrão do ambiente
APP_DIR="/var/www"
ENV_DIR="${ENV_DIR:-/etc/utfpets}"
ENV_SRC="${ENV_FILE:-${ENV_DIR}/.env}"
ENV_DST="${APP_DIR}/.env"
TEST_ENV_SRC="${ENV_DIR}/.env.testing"

# Aguarda DB apenas no ambiente de testes (compose local)
if [ "${APP_ENV}" = "testing" ]; then
  echo "[entrypoint] Aguardando PostgreSQL de teste..."
  while ! nc -z test-db 5432; do
    sleep 0.1
  done
  echo "[entrypoint] PostgreSQL de teste pronto!"
fi

echo "[entrypoint] Iniciando setup do Laravel..."

# Configura .env a partir de variáveis de ambiente ou arquivo
echo "[entrypoint] ENV_DIR=${ENV_DIR}"
if [ -n "${DB_HOST:-}" ] && [ -n "${DB_USERNAME:-}" ]; then
  echo "[entrypoint] Usando variáveis de ambiente"
elif [ -f "${ENV_SRC}" ]; then
  echo "[entrypoint] Copiando .env: ${ENV_SRC}"
  cp "${ENV_SRC}" "${ENV_DST}"
elif [ "${RENDER:-false}" = "true" ]; then
  echo "[entrypoint] RENDER=true: variáveis de ambiente"
elif [ ! -f "${ENV_DST}" ]; then
  echo "[entrypoint] Criando .env de .env.example"
  cp "${APP_DIR}/.env.example" "${ENV_DST}"
fi

# Prepara .env.testing para ambiente de testes
if [ "${APP_ENV}" = "testing" ]; then
  if [ -f "${TEST_ENV_SRC}" ]; then
    cp "${TEST_ENV_SRC}" "${APP_DIR}/.env.testing"
    echo "[entrypoint] .env.testing copiado"
  elif [ ! -f .env.testing ]; then
    echo "[entrypoint] Criando .env.testing"
    cp .env.example .env.testing
    sed -i 's/DB_CONNECTION=.*/DB_CONNECTION=pgsql_testing/' .env.testing
    sed -i 's/DB_HOST=.*/DB_HOST=test-db/' .env.testing
    sed -i 's/DB_PORT=.*/DB_PORT=5432/' .env.testing
    sed -i 's/DB_DATABASE=.*/DB_DATABASE=utfpets_test/' .env.testing
    sed -i 's/DB_USERNAME=.*/DB_USERNAME=test_user/' .env.testing
    sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=test_password/' .env.testing
  fi
fi

# Instala dependências do Composer
if [ ! -d vendor ]; then
  echo "[entrypoint] Instalando dependências..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Ajusta permissões
echo "[entrypoint] Ajustando permissões..."
chown -R www-data:www-data storage || true
chmod -R 775 storage || true
chown -R www-data:www-data bootstrap/cache || true
chmod -R 775 bootstrap/cache || true

# Gera chaves se necessário
if [ -z "${APP_KEY:-}" ]; then
  php artisan key:generate --no-interaction --force
fi

if [ -z "${JWT_SECRET:-}" ]; then
  php artisan jwt:secret --force
fi

if [ "${APP_ENV}" = "testing" ]; then
  php artisan jwt:secret --force --env=testing
fi

# Otimiza aplicação
echo "[entrypoint] Otimizando aplicação..."
php artisan route:clear || true
php artisan config:clear || true
php artisan view:clear || true
php artisan cache:clear || true
php artisan optimize || true

# Executa migrações se habilitado
if [ "${MIGRATE_ON_START:-false}" = "true" ]; then
  if [ "${APP_ENV}" = "testing" ]; then
    php artisan migrate --force --env=testing || true
  else
    php artisan migrate --force || true
  fi
fi

echo "[entrypoint] Setup concluído!"

# Inicia serviços
if [ "${RENDER:-false}" = "true" ]; then
  echo "[entrypoint] Iniciando Nginx + PHP-FPM"
  if [ -f /etc/nginx/conf.d/default.conf ]; then
    sed -ri "s/listen 80;/listen ${PORT:-8080};/" /etc/nginx/conf.d/default.conf || true
    sed -ri "s/fastcgi_pass app:9000;/fastcgi_pass 127.0.0.1:9000;/" /etc/nginx/conf.d/default.conf || true
  fi
  php-fpm -F &
  PHP_FPM_PID=$!
  echo "[entrypoint] PHP-FPM PID: ${PHP_FPM_PID}"
  echo "[entrypoint] Nginx em :${PORT:-8080}"
  exec nginx -g 'daemon off;'
else
  echo "[entrypoint] Iniciando PHP-FPM"
  exec php-fpm -F
fi
