📐 RÈGLES DE GÉNÉRATION DE CODE POUR CURSOR (KANBOARD)

1. STRUCTURE & NOMMAGE
- Respecte l’architecture Laravel par défaut (MVC)
- Les modèles Eloquent sont en singulier (ex : User, Project, Task)
- Les tables SQL sont en pluriel (ex : users, tasks)
- Les routes REST sont en kebab-case (`/project-tasks`), les noms de méthodes en camelCase

2. CONVENTIONS DE CODE
- Le code doit être propre, lisible et indenté (PSR-12 pour PHP)
- Pas de logique métier dans les routes. Elle doit aller dans les contrôleurs ou services
- Les variables et fonctions doivent avoir des noms explicites (ex : `updateTaskDeadline()` plutôt que `doStuff()`)

3. CONTEXTUALISATION
- Chaque entité doit respecter ses relations : 
  - Un utilisateur peut avoir plusieurs projets
  - Un projet peut avoir plusieurs membres
  - Une tâche appartient à un projet, peut être assignée à plusieurs utilisateurs
- Les colonnes d’un projet doivent inclure au minimum : à faire, en cours, fait, annulé

4. MIGRATIONS
- Chaque champ de migration doit être justifié : nullable si non obligatoire, timestamps inclus partout
- Utiliser les relations (`foreignId('project_id')->constrained()->onDelete('cascade')`)

5. GESTION DES DONNÉES
- Les requêtes SQL doivent passer par Eloquent (pas de query SQL brute sans raison)
- Les formulaires doivent être validés avec des Form Requests Laravel (`StoreTaskRequest`, `UpdateProjectRequest`)

6. SÉCURITÉ
- Aucune donnée sensible en clair (email, mot de passe…)
- Toujours utiliser `bcrypt()` pour les mots de passe
- Protéger les routes avec `auth` middleware quand nécessaire

7. FRONTEND (KANBAN & UI)
- Chaque tâche doit être identifiable visuellement par :
  - Sa couleur de priorité
  - Son titre lisible
  - Des badges pour les dates ou membres assignés
- Le drag & drop doit respecter la structure des colonnes
- Ne jamais dupliquer inutilement le même composant HTML

8. BONUS (temps réel, hors-ligne…)
- Le mode hors-ligne doit stocker les données temporairement avec `localStorage` ou `IndexedDB`
- La synchronisation doit être propre et détecter les conflits éventuels
- Le temps réel ne doit être ajouté que sur des entités critiques (tâches, statuts)

9. GIT & COMMITS
- Ne génère jamais de fichiers inutiles ou temporaires (`.DS_Store`, `node_modules`, `vendor`)
- Chaque ajout de code doit pouvoir correspondre à un **commit isolé et clair**
- Évite de tout générer d’un coup si la logique est complexe : priorise des petits blocs

10. TESTABILITÉ
- Si possible, rendre les fonctions découplées pour être testables
- N’imbrique pas trop de conditions dans une même méthode

---

✳️ Résumé :
→ Code clair, découpé, logique, cohérent avec Laravel  
→ Pas de duplication  
→ Priorité à la compréhension, la sécurité, et l’architecture  
→ Reste modulaire, pas de "tout en un"

