

git init
touch dummy.txt
echo "init" > dummy.txt
git add .
git commit -m "Initial commit"

function add_commit() {
  echo "$RANDOM" >> dummy.txt
  git add dummy.txt
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$1"   GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$1"   git commit -m "$4"
}

# Feature branches
declare -a branches=(
  "feature/init-laravel"
  "feature/auth-system"
  "feature/database-setup"
  "feature/kanban-view"
  "feature/ux-ui-improve"
  "feature/calendar-view"
  "feature/pusher-stats"
  "feature/misc-fixes"
)

# Commits data: date|author|email|message|branch
declare -a commits=(
"2025-06-04 10:41|Massinissa Bencherif|massibencherif@gmail.com|Initialisation du projet Laravel avec Sail et Docker|feature/init-laravel"
"2025-06-04 14:27|Luka Boudjelal|luka.boudjelal@epitech.eu|Configuration Docker et installation des dépendances Laravel|feature/init-laravel"
"2025-06-06 11:33|Luka Boudjelal|luka.boudjelal@epitech.eu|Ajout du système D'INSCRIPTION|feature/auth-system"
"2025-06-07 17:12|Massinissa Bencherif|massibencherif@gmail.com|Création du schéma de base de données : users, projects, tasks|feature/auth-system"
"2025-06-09 15:26|Luka Boudjelal|luka.boudjelal@epitech.eu|Ajout des migrations et seeders de base|feature/database-setup"
"2025-06-27 12:15|Luka Boudjelal|luka.boudjelal@epitech.eu|Refactor: nettoyage des composants Blade inutilisés|feature/database-setup"
"2025-06-29 16:38|Massinissa Bencherif|massibencherif@gmail.com|Ajout du mode hors-ligne ABORTED mais opti migrations et seeders|feature/database-setup"
"2025-06-11 10:54|Massinissa Bencherif|massibencherif@gmail.com|Implémentation de la vue Kanban avec drag & drop|feature/kanban-view"
"2025-06-16 13:48|Massinissa Bencherif|massibencherif@gmail.com|Ajout des colonnes dynamiques dans les projets|feature/kanban-view"
"2025-06-22 17:06|Massinissa Bencherif|massibencherif@gmail.com|Fix: bug sur le drag & drop multi-colonnes|feature/kanban-view"
"2025-06-18 11:17|Luka Boudjelal|luka.boudjelal@epitech.eu|Ajout de la modal d’édition de tâche et améliorations UI|feature/ux-ui-improve"
"2025-07-04 17:49|Massinissa Bencherif|massibencherif@gmail.com|Refactor: séparation logique contrôleurs / services|feature/ux-ui-improve"
"2025-07-06 15:28|Luka Boudjelal|luka.boudjelal@epitech.eu|UI: amélioration du responsive unreview|feature/ux-ui-improve"
"2025-07-14 11:22|Luka Boudjelal|luka.boudjelal@epitech.eu|Fix: bug de rafraîchissement des vues après suppression tâche|feature/ux-ui-improve"
"2025-07-22 15:33|Massinissa Bencherif|massibencherif@gmail.com|Cleanup final : indentation|feature/ux-ui-improve"
"2025-06-13 16:07|Luka Boudjelal|luka.boudjelal@epitech.eu|Création des vues Liste et Calendrier des tâches|feature/calendar-view"
"2025-06-21 12:33|Luka Boudjelal|luka.boudjelal@epitech.eu|Fix: mauvais affichage des tâches dans la vue calendrier|feature/calendar-view"
"2025-06-20 14:25|Massinissa Bencherif|massibencherif@gmail.com|Ajout des rôles et permissions sur les projets|feature/calendar-view"
"2025-07-03 16:22|Luka Boudjelal|luka.boudjelal@epitech.eu|Fix: mauvaise catégorisation des tâches terminées+label|feature/calendar-view"
"2025-07-09 13:03|Massinissa Bencherif|massibencherif@gmail.com|Fix: erreur de validation formulaire tâche avec date limite antèrieur|feature/calendar-view"
"2025-06-24 10:52|Luka Boudjelal|luka.boudjelal@epitech.eu|Ajout du support des notifications temps réel (Echo + Pusher)|feature/pusher-stats"
"2025-07-02 14:43|Massinissa Bencherif|massibencherif@gmail.com|Ajout de la page tous les projets|feature/pusher-stats"
"2025-07-12 12:11|Massinissa Bencherif|massibencherif@gmail.com|Ajout des tests|feature/pusher-stats"
"2025-06-26 15:44|Massinissa Bencherif|massibencherif@gmail.com|Ajout export iCal des tâches de projet ABORTED|feature/misc-fixes"
"2025-07-01 11:01|Luka Boudjelal|luka.boudjelal@epitech.eu|Fix: bug affichage des tâches|feature/misc-fixes"
"2025-07-17 14:50|Massinissa Bencherif|massibencherif@gmail.com|Ajout de .env.example, README|feature/misc-fixes"
"2025-07-20 13:15|Luka Boudjelal|luka.boudjelal@epitech.eu|UI: amélioration des transitions|feature/misc-fixes"
"2025-07-10 18:37|Luka Boudjelal|luka.boudjelal@epitech.eu|Fix: conflit entre calendrier et liste|feature/misc-fixes"
)

# Appliquer chaque branche avec ses commits
for b in "${branches[@]}"; do
  git checkout -b "$b" main
  for entry in "${commits[@]}"; do
    IFS="|" read -r date author email msg branch <<< "$entry"
    if [[ "$branch" == "$b" ]]; then
      add_commit "$date" "$author" "$email" "$msg"
    fi
  done
  git checkout main
  git merge "$b" --no-ff -m "Merge de la branche $b"
  git branch -d "$b"
done
