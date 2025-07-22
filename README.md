# Guide d'installation et de démarrage

## Prérequis
- PHP >= 8.2
- Composer
- Node.js >= 18
- NPM
- Une base de données MySQL/MariaDB (ou SQLite pour test)
- (Optionnel) Docker & Docker Compose

## 1. Cloner le projet
```bash
git clone <https://github.com/massinissabencherif/projet-annuel.git>
cd <https://github.com/massinissabencherif/projet-annuel.git>
```

## 2. Installer les dépendances PHP
```bash
composer install
```

## 3. Installer les dépendances front-end
```bash
npm install
```

## 4. Configurer l'environnement
Copiez le fichier `.env.example` en `.env` puis modifiez les variables si besoin (DB, mail, etc.) :
```bash
cp .env.example .env
```

Générez la clé d'application Laravel :
```bash
.vendor/bin/sail artisan key:generate
```

## 5. Créer la base de données
- Créez une base de données vide (MySQL/MariaDB ou SQLite)
- Mettez à jour les variables `DB_*` dans `.env`

## 6. Lancer les migrations et les seeders
```bash
./vendor/bin/sail artisan migrate --seed
```

## 7. Compiler les assets front-end
Pour le développement (hot reload) :
```bash
npm run dev
```
Pour la production :
```bash
npm run build
```

## 8. Lancer le serveur de développement Laravel
```bash
./vendor/bin/sail artisan serve
```

L'application sera accessible sur http://localhost:8000

## 9. (Optionnel) Lancer avec Docker
Si tu veux utiliser Docker Compose :
```bash
docker-compose up --build
```

## 10. Commandes utiles
- Lancer les tests :
  ```bash
  ./vendor/bin/sail artisan test
  ```
- Rafraîchir la base de données :
  ```bash
  ./vendor/bin/sail artisan migrate:fresh --seed
  ```
- Accéder à Tinker (console Eloquent) :
  ```bash
  ./vendor/bin/sail artisan tinker
  ```

## 11. Problèmes courants
- Si tu as une erreur de permission sur `storage` ou `bootstrap/cache` :
  ```bash
  chmod -R 775 storage bootstrap/cache
  ```
- Si tu utilises SQLite, crée le fichier vide :
  ```bash
  touch database/database.sqlite
  ```

## 12. Structure du projet
- `app/` : code backend Laravel
- `resources/js/` : code front-end (Kanban, vues...)
- `resources/views/` : templates Blade
- `public/` : point d'entrée web et assets compilés
- `database/` : migrations, seeders, factories
- `tests/` : tests automatisés

---