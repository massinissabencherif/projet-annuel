# Étape 1 : Build des assets avec Node
FROM node:20 AS node_builder
WORKDIR /var/www
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Image PHP pour Laravel
FROM php:8.2-fpm

# Installe les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Installe Composer
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copie le code source
COPY . .

# Copie les assets Vite buildés depuis l'étape Node
COPY --from=node_builder /var/www/public/build ./public/build

# Installe les dépendances PHP
RUN composer install --optimize-autoloader --no-dev

# Donne les bons droits
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]