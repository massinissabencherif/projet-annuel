# Étape 1 : Build des assets et installation des dépendances
FROM node:20-alpine AS node-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.js ./
RUN npm run build

# Étape 2 : Installation des dépendances PHP
FROM composer:2.7 AS composer-deps
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Étape 3 : Image finale avec PHP-FPM et Nginx
FROM php:8.2-fpm-alpine

# Install Nginx, Supervisor, extensions PHP nécessaires à Laravel
RUN apk add --no-cache nginx supervisor bash \
    && docker-php-ext-install pdo pdo_mysql

WORKDIR /var/www/html

# Copier le code source
COPY --from=composer-deps /app /var/www/html
COPY --from=node-build /app/resources /var/www/html/resources
COPY --from=node-build /app/public/build /var/www/html/public/build
COPY . /var/www/html

# Copier la config Nginx
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# Copier la config Supervisor
COPY ./docker/supervisord.conf /etc/supervisord.conf

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Exposer le port Railway
EXPOSE 8080

# Commande de démarrage
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"] 