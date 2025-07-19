# 🗺️ Roadmap Projet annuel

## Étape 0 – Initialisation
- [x] 0.1 Créer le projet Laravel ("laravel new projet-annuel" ou via Docker)
- [x] 0.2 Initialiser le dépôt Git, créer le .gitignore adapté
- [x] 0.3 Configurer Docker (docker-compose.yml, Dockerfile, .env)
- [x] 0.4 Vérifier le fonctionnement du conteneur (accès à http://localhost)
- [x] 0.5 Ajouter le README.md et y décrire le projet, la stack, les commandes de base
- [x] 0.6 Créer le fichier dev-rules.md (déjà fait)
- [x] 0.7 Créer roadmap.md (ce fichier)
- [x] 0.8 Créer tips.md

## Étape 1 – Authentification
- [x] 1.1 Installer Laravel Breeze (backend + frontend)
- [x] 1.2 Générer les migrations et modèles User (déjà présent)
- [x] 1.3 Configurer l'inscription avec email de validation (Resend autorisé)
- [x] 1.4 Configurer la connexion
- [x] 1.5 Mettre en place la réinitialisation du mot de passe (email via Resend, lien expirant 5 min)
- [ ] 1.6 Protéger les routes sensibles avec le middleware `auth`
- [ ] 1.7 Tester tous les cas d'usage (inscription, connexion, reset, validation email)

## Étape 1.5 – Intégration Authentification API Kanban
- [ ] 1.5.1 Protéger les routes API avec le middleware `auth:sanctum`
- [ ] 1.5.2 Adapter le frontend JavaScript pour gérer l'authentification
- [ ] 1.5.3 Intégrer les tokens CSRF dans les requêtes fetch
- [ ] 1.5.4 Rediriger vers login si non authentifié
- [ ] 1.5.5 Tester l'authentification complète avec l'application Kanban

## Étape 2 – Modélisation des données
- [x] 2.1 Créer la migration projects (id, name, creator_id, timestamps)
- [x] 2.2 Créer la migration columns (id, project_id, name, is_terminal, timestamps)
- [x] 2.3 Créer la migration tasks (id, project_id, title, description, category, priority, due_date, completed_at, timestamps)
- [x] 2.4 Créer la migration task_user (pivot)
- [x] 2.5 Générer les modèles Eloquent associés
- [x] 2.6 Définir les relations Eloquent (User-Project, Project-Column, Project-Task, Task-User)
- [x] 2.7 Ajouter les factories pour les tests
- [x] 2.8 Tester les migrations et les relations

## Étape 3 – Backend : logique métier
- [x] 3.1 Générer ProjectController (CRUD)
- [x] 3.2 Générer TaskController (CRUD)
- [x] 3.3 Générer MemberController (gestion des membres par email)
- [x] 3.4 Définir les routes REST (kebab-case)
- [x] 3.5 Implémenter la validation via Form Requests
- [x] 3.6 Gérer les droits d'accès (seul le créateur gère les membres)
- [x] 3.7 Tester chaque endpoint (Postman ou tests automatisés)

## Étape 4 – Frontend : Vue Kanban
- [x] 4.1 Créer la structure HTML/CSS de la vue Kanban
- [x] 4.2 Générer dynamiquement les colonnes et tâches
- [x] 4.3 Intégrer le drag & drop (ex. SortableJS)
- [x] 4.4 Mettre à jour le backend lors du déplacement d'une tâche
- [x] 4.5 Afficher les couleurs de priorité, badges, membres
- [x] 4.6 Tester l'UI sur desktop et mobile

## Étape 5 – Vues Liste & Calendrier
- [x] 5.1 Créer la vue liste (tableau, recherche, filtres)
- [x] 5.2 Créer la vue calendrier (FullCalendar.js)
- [x] 5.3 Afficher les tâches selon due_date
- [x] 5.4 Permettre le changement de vue (Kanban/liste/calendrier)
- [x] 5.5 Tester l'ergonomie et la cohérence des données

## Étape 6 – Responsive & Thème
- [ ] 6.1 Intégrer Tailwind CSS
- [ ] 6.2 Adapter le design mobile-first
- [ ] 6.3 Gérer le thème sombre/clair automatique
- [ ] 6.4 Tester sur plusieurs tailles d'écran

## Étape 7 – Bonus
- [ ] 7.1 Mode hors-ligne (IndexedDB/localStorage)
- [ ] 7.2 Synchro à la reconnexion
- [ ] 7.3 Notifications temps réel (Laravel Echo/Pusher/Mercure)
- [ ] 7.4 Statistiques projet (tâches par membre, durée moyenne, etc.)
- [ ] 7.5 Export iCal (route /calendar.ics) 