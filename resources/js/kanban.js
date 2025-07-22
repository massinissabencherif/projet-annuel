// Persistance de la sélection projet/vue dans le localStorage

document.addEventListener('DOMContentLoaded', function() {
    const projectSelect = document.getElementById('project-select');
    const viewSelector = document.getElementById('view-selector');

    async function loadProjects() {
        // ... code pour charger les projets via l'API ...
        // Après avoir ajouté toutes les options dans le select :
        updateProjectSelect(); // <-- Appel explicite ici
    }

    function updateProjectSelect() {
        // ... code pour ajouter les options ...
        // Après avoir ajouté toutes les options :
        const savedProject = localStorage.getItem('kanban_selected_project');
        if (savedProject && projectSelect) {
            projectSelect.value = savedProject;
            // Déclenche le changement de projet
            const event = new Event('change');
            projectSelect.dispatchEvent(event);
        }
    }

    function updateViewSelector() {
        // ... code pour ajouter les options de vue si besoin ...
        const savedView = localStorage.getItem('kanban_selected_view');
        if (savedView && viewSelector) {
            viewSelector.value = savedView;
            const event = new Event('change');
            viewSelector.dispatchEvent(event);
        }
    }

    // Persistance de la sélection projet/vue dans le localStorage
    // (Supprimer toute restauration dans DOMContentLoaded)

    if (projectSelect) {
        projectSelect.addEventListener('change', function(event) {
            localStorage.setItem('kanban_selected_project', event.target.value);
        });
    }
    if (viewSelector) {
        viewSelector.addEventListener('change', function(event) {
            localStorage.setItem('kanban_selected_view', event.target.value);
        });
    }
}); 