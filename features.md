FONCTIONNALITÉS DÉTAILLÉES DE L’APPLICATION

1. Authentification
   - Inscription obligatoire via un formulaire (email + mot de passe).
   - Envoi d’un email de confirmation avec lien de validation (outil externe autorisé : Resend).
   - Connexion via email + mot de passe.
   - Fonction "mot de passe oublié" avec envoi d’un lien de réinitialisation par email.
   - Lien de réinitialisation valable 5 minutes.

2. Gestion des utilisateurs
   - Création d’un compte utilisateur.
   - Chaque utilisateur peut créer plusieurs projets.
   - Chaque utilisateur peut être membre de plusieurs projets créés par d’autres.
   - Les utilisateurs peuvent être assignés à une ou plusieurs tâches.
   - Le créateur d’un projet est le seul à pouvoir inviter ou retirer des membres (via email).

3. Gestion des projets
   - Un utilisateur peut créer un ou plusieurs projets.
   - Un projet contient :
     - Une liste de membres.
     - Une liste de tâches organisées en colonnes.
   - Seul le créateur du projet peut :
     - Inviter un membre via son email.
     - Retirer un membre du projet.

4. Gestion des tâches
   - Création de tâches par tout membre d’un projet.
   - Chaque tâche comporte :
     - Un titre (obligatoire).
     - Une description (optionnelle).
     - Une ou plusieurs personnes assignées.
     - Un créateur (identifié automatiquement).
     - Une catégorie (optionnelle) correspondant à une colonne (ex : développement, marketing…).
     - Une priorité (optionnelle) : basse, moyenne, élevée.
     - Une date de création (automatique).
     - Une date de complétion (automatique lorsqu’elle est terminée).
     - Une date limite (optionnelle) pour déterminer si elle est en retard.
   - Une tâche peut être déplacée d'une colonne à une autre.

5. Vues des tâches
   - Vue Kanban (par défaut) :
     - Tâches affichées sous forme de cartes.
     - Colonnes par défaut : À faire, En cours, Fait, Annulé.
     - Drag & Drop pour déplacer les cartes entre colonnes.
     - Il doit toujours y avoir au moins une colonne.
     - Une colonne doit être définie comme "terminale" (Fait ou Annulé).
   - Vue Liste :
     - Affichage en tableau ou liste des tâches.
     - Recherche et filtrage possible par titre, description, catégorie, etc.
   - Vue Calendrier :
     - Tâches placées selon leur date limite.
     - Affichage disponible selon plusieurs échelles de temps : jour, 3 jours, semaine, mois.

6. Statistiques (bonus)
   - Pour chaque projet :
     - Nombre moyen de tâches accomplies par utilisateur.
     - Temps moyen de complétion des tâches.
     - Répartition des tâches par catégorie.
     - Possibilité de proposer d’autres statistiques pertinentes.

7. Export iCal (bonus)
   - Génération d’un endpoint HTTP qui retourne la liste des tâches d’un projet au format iCal.
   - Informations à inclure : titre, description, dates, etc.
   - Permet l’importation dans des calendriers externes (Google Calendar, Outlook, etc.).

8. Mode hors-ligne (bonus)
   - Application utilisable sans connexion internet.
   - Avertissement visuel indiquant le passage en mode hors-ligne.
   - Les actions effectuées en hors-ligne sont :
     - Enregistrées localement.
     - Synchronisées automatiquement avec la base de données dès que la connexion est rétablie.

9. Temps réel (bonus)
   - Synchronisation instantanée des modifications entre utilisateurs.
   - Affichage de notifications avec le nom de l’utilisateur ayant effectué une modification.
   - Technologies autorisées : Laravel Pusher, Echo, Mercure.

10. Design & accessibilité
   - Responsive design (adapté aux écrans desktop et mobile).
   - Apparence d’une application mobile (type PWA).
   - Adaptation automatique au thème de l’appareil (clair ou sombre).

11. Langages et technologies imposés
   - Front-end : HTML, CSS, JavaScript.
   - Back-end : Laravel (PHP).
   - Base de données : SQL (relationnelle).

12. Infrastructure
   - Application conteneurisée (ex : Docker).
   - Pas d’utilisation de services comme Firebase ou Vercel.
   - Projet reproductible sur n’importe quelle machine.
   - Fourniture d’un guide d’installation et de démarrage clair.

13. Historique du code
   - Utilisation de Git obligatoire.
   - Chaque commit doit être :
     - Unitaire (une seule tâche/modification à la fois).
     - Clair et concis.
   - Aucun commit massif avec trop de fichiers modifiés.
   - Tous les membres doivent avoir un historique de contributions équilibré.
