FROM php:8.2-fpm

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    nano \
    libpq-dev \
    libzip-dev \
    zip \
    libonig-dev \
    libxml2-dev \
    netcat-traditional \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_pgsql zip

# Instala o Composer
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

# Configura o Composer para rodar como root
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www

COPY . .

RUN chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data .

# Copia e configura o entrypoint
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
