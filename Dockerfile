# Utilise une image PHP officielle avec les extensions nécessaires
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

# Définit le répertoire de travail
WORKDIR /var/www

# Copie le code source
COPY . .

# Installe les dépendances PHP
RUN composer install --optimize-autoloader --no-dev

# Donne les bons droits
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

# Expose le port 8000 (Railway détecte ce port par défaut)
EXPOSE 8000

# Commande de lancement
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"] 