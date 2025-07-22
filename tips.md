# 💡 Tips & Bonnes pratiques Kanboard

## Bonnes pratiques de code
- Respecte la structure MVC de Laravel et les conventions PSR-12
- Utilise des noms explicites pour les variables, fonctions, classes
- Sépare la logique métier des routes (contrôleurs/services)
- Valide toujours les données côté backend (Form Requests)
- Utilise Eloquent pour les requêtes, évite le SQL brut
- Protéger les routes sensibles avec le middleware `auth`
- Utilise les relations Eloquent pour la clarté et la maintenabilité
- Ajoute des commentaires clairs si la logique est complexe
- Découpe le code en petits blocs testables

## Gestion de projet
- Commits Git petits, clairs, réguliers, avec messages explicites
- Ne jamais commiter de fichiers temporaires ou inutiles
- Priorise les tâches critiques, avance étape par étape
- Teste chaque fonctionnalité dès qu’elle est terminée
- Documente les choix techniques dans le README ou un fichier dédié

## Exploiter l’IA (moi !)
- Demande toujours une explication avant chaque action
- Demande des exemples de tests pour valider chaque étape
- N’hésite pas à demander des alternatives ou des optimisations
- Utilise-moi pour générer des snippets, des migrations, des tests, de la doc
- Je peux t’aider à relire, corriger ou expliquer du code

## Conseils pour tes prompts
- Sois précis sur ce que tu veux (ex : “génère la migration pour tasks”)
- Précise le contexte si besoin (ex : “en respectant dev-rules.md”)
- Demande systématiquement comment tester ce que je propose
- N’hésite pas à demander des checklists ou des plans détaillés
- Si tu veux une explication pédagogique, précise-le

## Astuces diverses
- Pour l’email (validation, reset), tu peux utiliser Resend
- Utilise Postman ou Insomnia pour tester les endpoints API
- Utilise Laravel Tinker pour tester les modèles/relations rapidement
- Pour le drag & drop, commence simple avant d’ajouter la synchro backend 