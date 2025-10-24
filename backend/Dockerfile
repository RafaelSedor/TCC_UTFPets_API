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
    nginx \
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

# Copia config do Nginx para uso em ambientes de 1 container (Render)
# NOTA: Comentado para desenvolvimento local - usamos container Nginx separado
# RUN mkdir -p /etc/nginx/conf.d
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copia e configura o entrypoint
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
