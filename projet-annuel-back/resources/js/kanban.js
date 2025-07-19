// Import de Sortable.js pour le drag & drop
// import Sortable from 'sortablejs'; // Désactivé pour notre système personnalisé

// Kanban JavaScript - Version Blade avec Drag & Drop personnalisé
console.log('=== KANBAN.JS CHARGÉ ===');

// Variables globales
let projects = [];
let columns = [];
let tasks = [];
let currentProject = null;

// Variables pour le drag & drop personnalisé
let isDragging = false;
let draggedElement = null;
let draggedTaskId = null;
let draggedColumnId = null;
let ghostElement = null;
let dropZones = [];

// Variables pour la vue liste
let currentView = 'kanban';
let allTasks = [];
let filteredTasks = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { field: 'created_at', direction: 'desc' };
let currentFilters = {
    search: '',
    column: '',
    priority: ''
};

// Variables pour le calendrier
let currentDate = new Date();
let calendarView = 'month'; // 'month', 'week', 'day'
let calendarTasks = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation du Kanban...');
    initializeKanban();
});

function initializeKanban() {
    setupEventListeners();
    loadProjects();
}

function cleanupEventListeners() {
    console.log('=== NETTOYAGE EVENT LISTENERS ===');
    
    // Supprimer les événements des formulaires
    const projectForm = document.getElementById('create-project-form');
    if (projectForm) {
        projectForm.removeEventListener('submit', createProject);
    }
    
    const taskForm = document.getElementById('create-task-form');
    if (taskForm) {
        taskForm.removeEventListener('submit', createTask);
    }
    
    // Supprimer les événements du sélecteur de projet
    const projectSelect = document.getElementById('project-select');
    if (projectSelect) {
        projectSelect.removeEventListener('change', onProjectChange);
    }
    
    // Supprimer les événements du sélecteur de vue
    const viewSelector = document.getElementById('view-selector');
    if (viewSelector) {
        viewSelector.removeEventListener('change', onViewChange);
    }
    
    // Supprimer les événements globaux
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    console.log('=== NETTOYAGE EVENT LISTENERS TERMINÉ ===');
}

function setupEventListeners() {
    console.log('=== SETUP EVENT LISTENERS ===');
    
    // Nettoyer les événements précédents pour éviter les doublons
    cleanupEventListeners();
    
    // Sélecteur de projet
    const projectSelect = document.getElementById('project-select');
    if (projectSelect) {
        projectSelect.addEventListener('change', onProjectChange);
    }
    
    // Fermeture des modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Fermeture des modals en cliquant à l'extérieur
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    });
    
    // Formulaires
    const projectForm = document.getElementById('create-project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', createProject);
    }
    
    const taskForm = document.getElementById('create-task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', createTask);
    }
    
    // Événements globaux pour le drag & drop
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Sélecteur de vue
    const viewSelector = document.getElementById('view-selector');
    if (viewSelector) {
        viewSelector.addEventListener('change', onViewChange);
    }
    
    // Événements pour la vue liste
    setupListViewEvents();
    
    // Événements pour la gestion des membres
    const inviteMemberForm = document.getElementById('invite-member-form');
    if (inviteMemberForm) {
        inviteMemberForm.addEventListener('submit', inviteMember);
    }
    
    console.log('=== EVENT LISTENERS SETUP TERMINÉ ===');
}

async function loadProjects() {
    console.log('Chargement des projets...');
    
    try {
        const response = await fetch('/api/projects');
        console.log('Réponse API projets:', response.status);
        
        if (response.ok) {
            projects = await response.json();
            console.log('Projets chargés:', projects);
            updateProjectSelect();
        } else {
            console.error('Erreur lors du chargement des projets:', response.status);
            showError('Erreur lors du chargement des projets');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showError('Erreur de connexion au serveur');
    }
}

function updateProjectSelect() {
    const projectSelect = document.getElementById('project-select');
    if (!projectSelect) return;
    
    console.log('Mise à jour du sélecteur de projets avec', projects.length, 'projets');
    
    // Garder l'option par défaut
    const defaultOption = projectSelect.querySelector('option[value=""]');
    projectSelect.innerHTML = '';
    if (defaultOption) {
        projectSelect.appendChild(defaultOption);
    }
    
    // Ajouter l'option "Tous les projets"
    const allProjectsOption = document.createElement('option');
    allProjectsOption.value = 'all';
    allProjectsOption.textContent = 'Tous les projets';
    projectSelect.appendChild(allProjectsOption);
    console.log('Option ajoutée: Tous les projets (ID: all)');
    
    // Ajouter les projets
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
        console.log('Option ajoutée:', project.name, '(ID:', project.id, ')');
    });
    
    console.log('Sélecteur mis à jour avec', projects.length + 1, 'projets (incluant "Tous les projets")');
}

async function onProjectChange(event) {
    const projectId = event.target.value;
    console.log('Changement de projet sélectionné:', projectId);
    
    if (projectId === 'all') {
        // Option "Tous les projets" sélectionnée
        console.log('Affichage de tous les projets');
        currentProject = 'all';
        
        // Basculer automatiquement vers la vue liste
        const viewSelector = document.getElementById('view-selector');
        if (viewSelector) {
            viewSelector.value = 'list';
        }
        
        // Afficher la vue liste avec toutes les tâches
        showListView();
        
    } else if (projectId) {
        // Projet spécifique sélectionné
        console.log('Chargement des données du projet:', projectId);
        
        // Vérifier la vue actuelle
        const viewSelector = document.getElementById('view-selector');
        const currentView = viewSelector ? viewSelector.value : 'kanban';
        
        if (currentView === 'list') {
            // Si on est en vue liste, recharger les données de la vue liste
            currentProject = projectId;
            await loadTasksForListView();
        } else if (currentView === 'calendar') {
            // Si on est en vue calendrier, recharger les données du calendrier
            currentProject = projectId;
            await loadCalendarTasks();
            renderCalendar();
        } else {
            // Sinon, basculer vers la vue Kanban
            if (viewSelector) {
                viewSelector.value = 'kanban';
            }
            await loadProjectData(projectId);
        }
    } else {
        showNoProjectSelected();
    }
}

async function loadProjectData(projectId) {
    currentProject = projectId;
    showLoading();
    
    try {
        // Charger les colonnes
        const columnsResponse = await fetch(`/api/projects/${projectId}/columns`);
        if (columnsResponse.ok) {
            columns = await columnsResponse.json();
            console.log('Colonnes chargées:', columns);
        }
        
        // Charger les tâches
        const tasksResponse = await fetch(`/api/projects/${projectId}/tasks`);
        if (tasksResponse.ok) {
            tasks = await tasksResponse.json();
            console.log('Tâches chargées:', tasks);
        }
        
        showKanbanBoard();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showError('Erreur lors du chargement des données du projet');
    }
}

function showLoading() {
    const mainContent = document.getElementById('kanban-main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="flex items-center justify-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span class="ml-3 text-gray-600">Chargement...</span>
            </div>
        `;
    }
}

function showError(message) {
    const mainContent = document.getElementById('kanban-main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="flex items-center justify-center h-64">
                <div class="text-center">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
                    <p class="text-gray-600">${message}</p>
                </div>
            </div>
        `;
    }
}

function showNoProjectSelected() {
    const mainContent = document.getElementById('kanban-main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="flex items-center justify-center h-64">
                <div class="text-center">
                    <div class="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun projet sélectionné</h3>
                    <p class="text-gray-600">Veuillez sélectionner un projet pour voir le tableau Kanban</p>
                </div>
            </div>
        `;
    }
}

function showKanbanBoard() {
    const mainContent = document.getElementById('kanban-main');
    if (!mainContent) {
        console.error('Container Kanban non trouvé');
        return;
    }
    
    const project = projects.find(p => p.id == currentProject);
    const projectName = project ? project.name : '';
    const projectDescription = project ? project.description : '';
    
    mainContent.innerHTML = `
        <div class="space-y-6">
            <!-- Project Header -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">${projectName}</h2>
                <p class="text-gray-600">${projectDescription || 'Aucune description'}</p>
            </div>

            <!-- Actions -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-4">
                    <button 
                        onclick="openCreateProjectModal()"
                        class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Nouveau Projet
                    </button>
                </div>
                <button 
                    onclick="openCreateTaskModal()"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Nouvelle Tâche
                </button>
            </div>

            <!-- Kanban Columns -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${columns.map(column => `
                    <div class="bg-white rounded-lg shadow-sm border">
                        <div class="p-4 border-b bg-gray-50" data-column-id="${column.id}">
                            <h3 class="font-medium text-gray-900">${column.name}</h3>
                            <p class="text-sm text-gray-500">${getTasksForColumn(column.id).length} tâches</p>
                        </div>
                        <div class="p-4 space-y-3 min-h-[200px]">
                            ${getTasksForColumn(column.id).map(task => `
                                <div 
                                    class="bg-gray-50 rounded-lg p-3 border cursor-move hover:bg-gray-100 transition-colors task-card"
                                    data-task-id="${task.id}"
                                    data-column-id="${column.id}"
                                >
                                    <div class="flex items-start justify-between mb-2">
                                        <h4 class="font-medium text-gray-900 text-sm">${task.title}</h4>
                                        <span class="${getPriorityClass(task.priority)} text-xs px-2 py-1 rounded-full">
                                            ${getPriorityLabel(task.priority)}
                                        </span>
                                    </div>
                                    ${task.description ? `<p class="text-sm text-gray-600 mb-2">${task.description}</p>` : ''}
                                    ${task.category ? `<p class="text-xs text-blue-600 mb-2">📁 ${task.category}</p>` : ''}
                                    ${task.due_date ? `<p class="text-xs text-orange-600 mb-2">📅 ${formatDate(task.due_date)}</p>` : ''}
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs text-gray-500">Créée le ${formatDate(task.created_at)}</span>
                                        ${task.users && task.users.length > 0 ? `
                                            <div class="flex -space-x-1">
                                                ${task.users.slice(0, 3).map(user => `
                                                    <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                        ${user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                `).join('')}
                                                ${task.users.length > 3 ? `<div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs">+${task.users.length - 3}</div>` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                            ${getTasksForColumn(column.id).length === 0 ? `
                                <div class="text-center py-8 text-gray-400 sortable-no-drop">
                                    <p class="text-sm">Aucune tâche</p>
                                    <div class="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 sortable-drop-zone">
                                        <p class="text-xs text-gray-500">Déposez une tâche ici</p>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Initialiser le drag & drop après l'affichage
    setTimeout(() => {
        initializeCustomDragAndDrop();
    }, 100);
    
    // Mettre à jour les filtres de colonne pour la vue liste
    updateColumnFilter();
    
    // Si on est en vue liste, charger les tâches
    if (currentView === 'list') {
        loadTasksForListView();
    }
}

function getTasksForColumn(columnId) {
    return tasks.filter(task => task.column_id == columnId);
}

function getPriorityClass(priority) {
    const classes = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800'
    };
    return classes[priority] || classes.medium;
}

function getPriorityLabel(priority) {
    const labels = {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute'
    };
    return labels[priority] || 'Moyenne';
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fonctions pour les modals
function openCreateProjectModal() {
    console.log('=== OUVERTURE MODAL CRÉATION PROJET ===');
    const modal = document.getElementById('create-project-modal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Modal création projet ouverte');
    } else {
        console.error('Modal création projet non trouvée');
    }
}

function openCreateTaskModal() {
    console.log('=== OUVERTURE MODAL CRÉATION TÂCHE ===');
    console.log('Projet actuel:', currentProject);
    
    if (!currentProject) {
        showError('Veuillez sélectionner un projet d\'abord');
        return;
    }
    
    const modal = document.getElementById('create-task-modal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Modal création tâche ouverte');
        // Charger les colonnes dans le select
        loadColumnsForTaskModal();
    } else {
        console.error('Modal création tâche non trouvée');
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
    // Réinitialiser les formulaires
    resetForms();
}

function resetForms() {
    const projectForm = document.getElementById('create-project-form');
    const taskForm = document.getElementById('create-task-form');
    
    if (projectForm) projectForm.reset();
    if (taskForm) taskForm.reset();
}

// Variables pour éviter les soumissions multiples
let isCreatingTask = false;
let isCreatingProject = false;

async function createProject(event) {
    console.log('=== FONCTION createProject APPELÉE ===');
    event.preventDefault();
    
    // Éviter les soumissions multiples
    if (isCreatingProject) {
        console.log('Création de projet déjà en cours, ignoré');
        return;
    }
    
    isCreatingProject = true;
    
    const form = event.target;
    const formData = new FormData(form);
    
    const projectData = {
        name: formData.get('name'),
        description: formData.get('description'),
        creator_email: formData.get('creator_email')
    };
    
    console.log('Données du projet à créer:', projectData);
    
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify(projectData)
        });
        
        console.log('Réponse API création projet:', response.status, response.statusText);
        
        if (response.ok) {
            const newProject = await response.json();
            console.log('Projet créé avec succès:', newProject);
            
            // Ajouter le projet à la liste
            projects.push(newProject);
            console.log('Liste des projets mise à jour:', projects);
            
            // Mettre à jour le sélecteur
            updateProjectSelect();
            
            // Fermer le modal
            closeModal();
            
            // Afficher un message de succès
            showSuccess('Projet créé avec succès !');
            
            // Recharger les projets pour s'assurer de la cohérence
            await loadProjects();
        } else {
            const errorData = await response.json();
            console.error('Erreur API:', errorData);
            showError('Erreur lors de la création du projet: ' + (errorData.message || 'Erreur inconnue'));
        }
    } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        showError('Erreur de connexion au serveur');
    } finally {
        // Réinitialiser le flag de création
        isCreatingProject = false;
    }
}

async function createTask(event) {
    console.log('=== FONCTION createTask APPELÉE ===');
    event.preventDefault();
    
    // Éviter les soumissions multiples
    if (isCreatingTask) {
        console.log('Création de tâche déjà en cours, ignoré');
        return;
    }
    
    isCreatingTask = true;
    
    if (!currentProject) {
        showError('Veuillez sélectionner un projet d\'abord');
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        priority: formData.get('priority'),
        due_date: formData.get('due_date'),
        column_id: formData.get('column_id'),
        project_id: currentProject
    };
    
    console.log('Données de la tâche à créer:', taskData);
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify(taskData)
        });
        
        console.log('Réponse API création tâche:', response.status, response.statusText);
        
        if (response.ok) {
            let newTask;
            try {
                newTask = await response.json();
                console.log('Tâche créée avec succès:', newTask);
            } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                const responseText = await response.text();
                console.error('Réponse brute du serveur:', responseText);
                showError('Erreur de parsing de la réponse du serveur');
                return;
            }
            
            // Ajouter la tâche à la liste
            tasks.push(newTask);
            console.log('Liste des tâches mise à jour:', tasks);
            
            // Fermer le modal
            closeModal();
            
            // Afficher un message de succès
            showSuccess('Tâche créée avec succès !');
            
            // Recharger les données du projet
            await loadProjectData(currentProject);
        } else {
            let errorData;
            try {
                errorData = await response.json();
            } catch (parseError) {
                const responseText = await response.text();
                console.error('Réponse d\'erreur brute:', responseText);
                showError(`Erreur ${response.status}: ${response.statusText}`);
                return;
            }
            console.error('Erreur API:', errorData);
            showError('Erreur lors de la création de la tâche: ' + (errorData.message || 'Erreur inconnue'));
        }
    } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error);
        showError('Erreur de connexion au serveur');
    } finally {
        // Réinitialiser le flag de création
        isCreatingTask = false;
    }
}

async function loadColumnsForTaskModal() {
    if (!currentProject) {
        console.error('Aucun projet sélectionné');
        return;
    }
    
    try {
        console.log('Chargement des colonnes pour le projet:', currentProject);
        const response = await fetch(`/api/projects/${currentProject}/columns`);
        
        if (response.ok) {
            const projectColumns = await response.json();
            console.log('Colonnes chargées:', projectColumns);
            
            const columnSelect = document.getElementById('task-column');
            if (columnSelect) {
                // Vider les options existantes (garder la première)
                while (columnSelect.children.length > 1) {
                    columnSelect.removeChild(columnSelect.lastChild);
                }
                
                // Ajouter les colonnes du projet
                projectColumns.forEach(column => {
                    const option = document.createElement('option');
                    option.value = column.id;
                    option.textContent = column.name;
                    columnSelect.appendChild(option);
                });
                
                console.log('Options de colonnes mises à jour:', columnSelect.children.length - 1, 'colonnes');
            }
        } else {
            console.error('Erreur lors du chargement des colonnes:', response.status);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des colonnes:', error);
    }
}

function showSuccess(message) {
    // Créer une notification de succès
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Supprimer la notification après 3 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

console.log('=== KANBAN.JS TERMINÉ ===');

// Exposer les fonctions globalement pour les formulaires
window.createProject = createProject;
window.createTask = createTask;
window.openCreateProjectModal = openCreateProjectModal;
window.openCreateTaskModal = openCreateTaskModal;

// Fonction pour initialiser le drag & drop personnalisé
function initializeCustomDragAndDrop() {
    console.log('=== INITIALISATION DRAG & DROP PERSONNALISÉ ===');
    
    // Nettoyer les événements précédents
    cleanupDragAndDrop();
    
    // Initialiser les zones de drop
    initializeDropZones();
    
    // Initialiser les éléments draggables
    initializeDraggableElements();
    
    console.log('Drag & drop personnalisé initialisé');
}

// Fonction pour nettoyer le drag & drop
function cleanupDragAndDrop() {
    // Supprimer les événements précédents
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        card.removeEventListener('mousedown', startDrag);
    });
    
    // Supprimer l'élément fantôme s'il existe
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
    }
    
    // Réinitialiser les variables
    isDragging = false;
    draggedElement = null;
    draggedTaskId = null;
    draggedColumnId = null;
    dropZones = [];
}

// Fonction pour initialiser les zones de drop
function initializeDropZones() {
    const columns = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm.border');
    dropZones = [];
    
    columns.forEach(column => {
        const columnId = column.querySelector('[data-column-id]')?.getAttribute('data-column-id');
        if (columnId) {
            const taskContainer = column.querySelector('.p-4.space-y-3');
            if (taskContainer) {
                dropZones.push({
                    element: taskContainer,
                    columnId: columnId,
                    rect: taskContainer.getBoundingClientRect()
                });
            }
        }
    });
    
    console.log('Zones de drop initialisées:', dropZones.length);
}

// Fonction pour initialiser les éléments draggables
function initializeDraggableElements() {
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach(card => {
        card.addEventListener('mousedown', startDrag);
        card.style.cursor = 'grab';
    });
    
    console.log('Éléments draggables initialisés:', taskCards.length);
}

// Fonction pour démarrer le drag
function startDrag(event) {
    console.log('=== DÉBUT DRAG PERSONNALISÉ ===');
    
    event.preventDefault();
    
    const card = event.currentTarget;
    const taskId = card.getAttribute('data-task-id');
    const columnId = card.getAttribute('data-column-id');
    
    console.log('Tâche à déplacer:', taskId, 'Colonne actuelle:', columnId);
    
    // Sauvegarder les informations de drag
    isDragging = true;
    draggedElement = card;
    draggedTaskId = taskId;
    draggedColumnId = columnId;
    
    // Créer l'élément fantôme
    createGhostElement(card);
    
    // Masquer l'élément original
    card.style.opacity = '0.3';
    
    // Empêcher la sélection de texte
    document.body.style.userSelect = 'none';
}

// Fonction pour créer l'élément fantôme
function createGhostElement(originalElement) {
    ghostElement = originalElement.cloneNode(true);
    ghostElement.style.position = 'fixed';
    ghostElement.style.zIndex = '1000';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.opacity = '0.8';
    ghostElement.style.transform = 'rotate(5deg)';
    ghostElement.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
    ghostElement.classList.add('dragging-ghost');
    
    document.body.appendChild(ghostElement);
}

// Fonction pour gérer le mouvement de la souris
function handleMouseMove(event) {
    if (!isDragging || !ghostElement) return;
    
    // Déplacer l'élément fantôme
    ghostElement.style.left = (event.clientX - ghostElement.offsetWidth / 2) + 'px';
    ghostElement.style.top = (event.clientY - ghostElement.offsetHeight / 2) + 'px';
    
    // Mettre à jour les zones de drop
    updateDropZones(event.clientX, event.clientY);
}

// Fonction pour mettre à jour les zones de drop
function updateDropZones(mouseX, mouseY) {
    dropZones.forEach(zone => {
        const rect = zone.element.getBoundingClientRect();
        const isOver = mouseX >= rect.left && mouseX <= rect.right && 
                      mouseY >= rect.top && mouseY <= rect.bottom;
        
        if (isOver) {
            zone.element.classList.add('drop-zone-active');
        } else {
            zone.element.classList.remove('drop-zone-active');
        }
    });
}

// Fonction pour gérer la fin du drag
function handleMouseUp(event) {
    if (!isDragging) return;
    
    console.log('=== FIN DRAG PERSONNALISÉ ===');
    
    // Trouver la zone de drop
    const dropZone = findDropZone(event.clientX, event.clientY);
    
    if (dropZone && dropZone.columnId !== draggedColumnId) {
        console.log('Drop détecté vers la colonne:', dropZone.columnId);
        moveTaskToColumn(draggedTaskId, dropZone.columnId);
    } else {
        console.log('Aucun drop valide détecté');
    }
    
    // Nettoyer le drag
    cleanupDrag();
}

// Fonction pour trouver la zone de drop
function findDropZone(mouseX, mouseY) {
    return dropZones.find(zone => {
        const rect = zone.element.getBoundingClientRect();
        return mouseX >= rect.left && mouseX <= rect.right && 
               mouseY >= rect.top && mouseY <= rect.bottom;
    });
}

// Fonction pour nettoyer le drag
function cleanupDrag() {
    // Supprimer l'élément fantôme
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
    }
    
    // Restaurer l'élément original
    if (draggedElement) {
        draggedElement.style.opacity = '1';
        draggedElement = null;
    }
    
    // Nettoyer les zones de drop
    dropZones.forEach(zone => {
        zone.element.classList.remove('drop-zone-active');
    });
    
    // Réinitialiser les variables
    isDragging = false;
    draggedTaskId = null;
    draggedColumnId = null;
    
    // Restaurer la sélection de texte
    document.body.style.userSelect = '';
}

// Fonction pour déplacer une tâche vers une nouvelle colonne
async function moveTaskToColumn(taskId, newColumnId) {
    console.log('=== DÉPLACEMENT TÂCHE VERS COLONNE ===');
    console.log('Tâche ID:', taskId, 'Nouvelle colonne ID:', newColumnId);
    
    try {
        const response = await fetch(`/api/tasks/${taskId}/move`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            },
            body: JSON.stringify({
                column_id: newColumnId
            })
        });
        
        if (response.ok) {
            const updatedTask = await response.json();
            console.log('Tâche déplacée avec succès:', updatedTask);
            
            // Mettre à jour l'affichage Kanban
            if (currentView === 'kanban') {
                await loadProjectData(currentProject);
            }
            
            // Mettre à jour l'affichage Liste si on est en vue liste
            if (currentView === 'list') {
                await loadTasksForListView();
            }
            
            console.log('Affichage mis à jour après déplacement');
        } else {
            console.error('Erreur lors du déplacement de la tâche:', response.status);
            const errorData = await response.json();
            console.error('Détails de l\'erreur:', errorData);
        }
    } catch (error) {
        console.error('Erreur lors du déplacement de la tâche:', error);
    }
}

// ===== FONCTIONS POUR LA VUE LISTE =====

// Fonction pour gérer le changement de vue
function onViewChange(event) {
    currentView = event.target.value;
    console.log('Changement de vue vers:', currentView);
    
    if (currentView === 'kanban') {
        showKanbanView();
    } else if (currentView === 'list') {
        showListView();
    } else if (currentView === 'calendar') {
        showCalendarView();
    }
}

// Fonction pour afficher la vue Kanban
function showKanbanView() {
    document.getElementById('kanban-main').classList.remove('hidden');
    document.getElementById('task-list-view').classList.add('hidden');
    
    // Réinitialiser le drag & drop
    if (currentProject) {
        initializeCustomDragAndDrop();
    }
}

// Fonction pour afficher la vue Liste
async function showListView() {
    document.getElementById('kanban-main').classList.add('hidden');
    document.getElementById('task-list-view').classList.remove('hidden');
    
    // Si aucun projet n'est sélectionné, sélectionner le premier
    if (!currentProject && projects.length > 0) {
        console.log('Aucun projet sélectionné, sélection du premier projet...');
        const firstProject = projects[0];
        currentProject = firstProject.id;
        
        // Mettre à jour le sélecteur de projet
        const projectSelect = document.getElementById('project-select');
        if (projectSelect) {
            projectSelect.value = currentProject;
        }
        
        console.log('Premier projet sélectionné:', currentProject);
    }
    
    // Mettre à jour les filtres de colonne
    await updateColumnFilter();
    
    // Gérer l'affichage de la colonne projet
    updateProjectColumnVisibility();
    
    // Charger les tâches pour la vue liste
    await loadTasksForListView();
}

// Fonction pour configurer les événements de la vue liste
function setupListViewEvents() {
    // Recherche
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(onSearchChange, 300));
    }
    
    // Filtres
    const columnFilter = document.getElementById('column-filter');
    if (columnFilter) {
        columnFilter.addEventListener('change', onFilterChange);
    }
    
    const priorityFilter = document.getElementById('priority-filter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', onFilterChange);
    }
    
    // Tri
    const sortHeaders = document.querySelectorAll('[data-sort]');
    sortHeaders.forEach(header => {
        header.addEventListener('click', onSortClick);
    });
    
    // Pagination
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    const prevPageMobile = document.getElementById('prev-page-mobile');
    const nextPageMobile = document.getElementById('next-page-mobile');
    
    if (prevPage) prevPage.addEventListener('click', () => changePage(currentPage - 1));
    if (nextPage) nextPage.addEventListener('click', () => changePage(currentPage + 1));
    if (prevPageMobile) prevPageMobile.addEventListener('click', () => changePage(currentPage - 1));
    if (nextPageMobile) nextPageMobile.addEventListener('click', () => changePage(currentPage + 1));
}

// Fonction pour charger les tâches pour la vue liste
async function loadTasksForListView() {
    if (!currentProject) {
        console.log('Aucun projet sélectionné');
        // Afficher un message dans le tableau
        const tbody = document.getElementById('task-list-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <div class="text-lg font-medium mb-2">Aucun projet sélectionné</div>
                        <div class="text-sm">Veuillez sélectionner un projet dans le menu déroulant pour voir les tâches.</div>
                    </td>
                </tr>
            `;
        }
        return;
    }
    
    try {
        console.log('Chargement des tâches pour la vue liste...');
        console.log('Projet actuel:', currentProject);
        
        // Mettre à jour les filtres de colonne et l'affichage des colonnes
        await updateColumnFilter();
        updateProjectColumnVisibility();
        
        let response;
        if (currentProject === 'all') {
            // Charger toutes les tâches de tous les projets
            console.log('Chargement de toutes les tâches de tous les projets');
            response = await fetch('/api/tasks');
        } else {
            // Charger les tâches d'un projet spécifique
            response = await fetch(`/api/projects/${currentProject}/tasks`);
        }
        
        const data = await response.json();
        
        console.log('Réponse API:', data);
        
        allTasks = data.data || data || [];
        console.log('Tâches chargées:', allTasks.length);
        console.log('Première tâche:', allTasks[0]);
        
        // Appliquer les filtres et tri
        applyFiltersAndSort();
        renderTaskList();
        
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
    }
}

// Fonction pour appliquer les filtres et le tri
function applyFiltersAndSort() {
    filteredTasks = [...allTasks];
    
    // Appliquer les filtres
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (currentFilters.column) {
        filteredTasks = filteredTasks.filter(task => 
            task.column_id == currentFilters.column
        );
    }
    
    if (currentFilters.priority) {
        filteredTasks = filteredTasks.filter(task => 
            task.priority === currentFilters.priority
        );
    }
    
    // Appliquer le tri
    filteredTasks.sort((a, b) => {
        let aValue = a[currentSort.field];
        let bValue = b[currentSort.field];
        
        // Gestion des valeurs nulles
        if (aValue === null) aValue = '';
        if (bValue === null) bValue = '';
        
        // Tri spécial pour les colonnes
        if (currentSort.field === 'column') {
            aValue = a.column?.name || '';
            bValue = b.column?.name || '';
        }
        
        if (currentSort.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    console.log('Tâches filtrées:', filteredTasks.length);
}

// Fonction pour rendre la liste des tâches
function renderTaskList() {
    const tbody = document.getElementById('task-list-body');
    if (!tbody) {
        console.error('Element tbody non trouvé');
        return;
    }
    
    console.log('Rendu de la liste des tâches...');
    console.log('Tâches filtrées:', filteredTasks.length);
    console.log('Page actuelle:', currentPage);
    
    // Calculer la pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const tasksToShow = filteredTasks.slice(startIndex, endIndex);
    
    console.log('Tâches à afficher:', tasksToShow.length);
    console.log('Première tâche à afficher:', tasksToShow[0]);
    
    // Mettre à jour les informations de pagination
    updatePaginationInfo(startIndex, endIndex);
    
    // Générer le HTML
    const html = tasksToShow.map(task => createTaskRow(task)).join('');
    console.log('HTML généré:', html.substring(0, 200) + '...');
    
    tbody.innerHTML = html;
    
    // Mettre à jour la pagination
    renderPagination();
}

// Fonction pour créer une ligne de tâche
function createTaskRow(task) {
    const priorityClass = getPriorityClass(task.priority);
    const priorityLabel = getPriorityLabel(task.priority);
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : '-';
    const createdDate = new Date(task.created_at).toLocaleDateString('fr-FR');
    const columnName = task.column?.name || 'Inconnue';
    const assignedUsers = task.users?.map(user => user.name).join(', ') || 'Non assigné';
    const projectName = task.project?.name || 'Projet inconnu';
    
    // Déterminer si on doit afficher la colonne projet et masquer la colonne colonne
    const showProjectColumn = currentProject === 'all';
    const showColumnColumn = currentProject !== 'all';
    
    return `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${task.title}</div>
                ${task.description ? `<div class="text-sm text-gray-500">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</div>` : ''}
            </td>
            ${showProjectColumn ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${projectName}</td>` : ''}
            ${showColumnColumn ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${columnName}</td>` : ''}
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityClass}">
                    ${priorityLabel}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${dueDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${assignedUsers}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${createdDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editTaskFromList(${task.id})" class="text-blue-600 hover:text-blue-900 mr-3">Modifier</button>
                <button onclick="deleteTaskFromList(${task.id})" class="text-red-600 hover:text-red-900">Supprimer</button>
            </td>
        </tr>
    `;
}

// Fonction pour mettre à jour les informations de pagination
function updatePaginationInfo(startIndex, endIndex) {
    const startItem = document.getElementById('start-item');
    const endItem = document.getElementById('end-item');
    const totalItems = document.getElementById('total-items');
    
    if (startItem) startItem.textContent = filteredTasks.length > 0 ? startIndex + 1 : 0;
    if (endItem) endItem.textContent = Math.min(endIndex, filteredTasks.length);
    if (totalItems) totalItems.textContent = filteredTasks.length;
}

// Fonction pour rendre la pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    
    if (!pageNumbers) return;
    
    // Activer/désactiver les boutons précédent/suivant
    if (prevPage) prevPage.disabled = currentPage <= 1;
    if (nextPage) nextPage.disabled = currentPage >= totalPages;
    
    // Générer les numéros de page
    let pageNumbersHtml = '';
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pageNumbersHtml += `
            <button 
                onclick="changePage(${i})"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${isActive ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}"
            >
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pageNumbersHtml;
}

// Fonction pour changer de page
function changePage(page) {
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTaskList();
    }
}

// Fonction pour gérer le changement de recherche
function onSearchChange(event) {
    currentFilters.search = event.target.value;
    currentPage = 1;
    applyFiltersAndSort();
    renderTaskList();
}

// Fonction pour gérer le changement de filtre
function onFilterChange(event) {
    const filterType = event.target.id.replace('-filter', '');
    currentFilters[filterType] = event.target.value;
    currentPage = 1;
    applyFiltersAndSort();
    renderTaskList();
}

// Fonction pour gérer le clic sur le tri
function onSortClick(event) {
    const field = event.currentTarget.dataset.sort;
    
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    applyFiltersAndSort();
    renderTaskList();
    updateSortIcons();
}

// Fonction pour mettre à jour les icônes de tri
function updateSortIcons() {
    const sortHeaders = document.querySelectorAll('[data-sort]');
    sortHeaders.forEach(header => {
        const field = header.dataset.sort;
        const icon = header.querySelector('.sort-icon');
        
        if (currentSort.field === field) {
            icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
        } else {
            icon.textContent = '↕';
        }
    });
}

// Fonction utilitaire pour debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fonction pour éditer une tâche depuis la liste
function editTaskFromList(taskId) {
    // TODO: Implémenter l'édition depuis la liste
    console.log('Éditer la tâche:', taskId);
    alert('Fonctionnalité d\'édition à implémenter');
}

// Fonction pour supprimer une tâche depuis la liste
async function deleteTaskFromList(taskId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            }
        });
        
        if (response.ok) {
            // Recharger la liste
            loadTasksForListView();
        } else {
            alert('Erreur lors de la suppression de la tâche');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de la tâche');
    }
}

// Fonction pour gérer l'affichage des colonnes selon le contexte
function updateProjectColumnVisibility() {
    const projectHeader = document.getElementById('project-column-header');
    const columnHeader = document.getElementById('column-header');
    
    if (currentProject === 'all') {
        // Pour "Tous les projets" : afficher la colonne Projet, masquer la colonne Colonne
        if (projectHeader) projectHeader.style.display = 'table-cell';
        if (columnHeader) columnHeader.style.display = 'none';
    } else {
        // Pour un projet spécifique : masquer la colonne Projet, afficher la colonne Colonne
        if (projectHeader) projectHeader.style.display = 'none';
        if (columnHeader) columnHeader.style.display = 'table-cell';
    }
}

// Fonction pour mettre à jour les filtres de colonne
async function updateColumnFilter() {
    const columnFilter = document.getElementById('column-filter');
    if (!columnFilter) return;
    
    // Garder l'option "Toutes les colonnes"
    columnFilter.innerHTML = '<option value="">Toutes les colonnes</option>';
    
    if (currentProject === 'all') {
        // Pour "Tous les projets", charger toutes les colonnes de tous les projets
        try {
            const response = await fetch('/api/columns');
            if (response.ok) {
                const allColumns = await response.json();
                const uniqueColumns = allColumns.filter((column, index, self) => 
                    index === self.findIndex(c => c.name === column.name)
                );
                
                uniqueColumns.forEach(column => {
                    const option = document.createElement('option');
                    option.value = column.id;
                    option.textContent = column.name;
                    columnFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des colonnes:', error);
        }
    } else if (columns.length) {
        // Ajouter les colonnes du projet actuel
        columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.id;
            option.textContent = column.name;
            columnFilter.appendChild(option);
        });
    }
}

// ========================================
// FONCTIONS POUR LA VUE CALENDRIER
// ========================================

// Fonction pour afficher la vue calendrier
function showCalendarView() {
    document.getElementById('kanban-main').classList.add('hidden');
    document.getElementById('task-list-view').classList.add('hidden');
    document.getElementById('calendar-view').classList.remove('hidden');
    
    // S'assurer que le sélecteur de vue est correctement mis à jour
    const viewSelector = document.getElementById('view-selector');
    if (viewSelector) {
        viewSelector.value = 'calendar';
    }
    
    // Initialiser le calendrier
    initializeCalendar();
}

// Fonction pour initialiser le calendrier
async function initializeCalendar() {
    console.log('Initialisation du calendrier...');
    
    // Charger les tâches pour le calendrier
    await loadCalendarTasks();
    
    // Configurer les événements du calendrier
    setupCalendarEvents();
    
    // Afficher la vue actuelle
    renderCalendar();
}

// Fonction pour charger les tâches du calendrier
async function loadCalendarTasks() {
    try {
        console.log('Chargement des tâches pour le calendrier...');
        console.log('Projet actuel pour calendrier:', currentProject);
        
        let response;
        if (currentProject === 'all') {
            console.log('Chargement de toutes les tâches pour le calendrier');
            response = await fetch('/api/tasks');
        } else if (currentProject) {
            console.log('Chargement des tâches du projet', currentProject, 'pour le calendrier');
            response = await fetch(`/api/projects/${currentProject}/tasks`);
        } else {
            console.log('Aucun projet sélectionné pour le calendrier');
            calendarTasks = [];
            return;
        }
        
        const data = await response.json();
        calendarTasks = data.data || data || [];
        
        console.log('Tâches calendrier chargées:', calendarTasks.length);
        console.log('Première tâche calendrier:', calendarTasks[0]);
        
    } catch (error) {
        console.error('Erreur lors du chargement des tâches calendrier:', error);
        calendarTasks = [];
    }
}

// Fonction pour configurer les événements du calendrier
function setupCalendarEvents() {
    // Navigation
    document.getElementById('prev-month')?.addEventListener('click', () => navigateCalendar(-1));
    document.getElementById('next-month')?.addEventListener('click', () => navigateCalendar(1));
    document.getElementById('today-btn')?.addEventListener('click', goToToday);
    
    // Changement de vue
    document.getElementById('month-view-btn')?.addEventListener('click', () => changeCalendarView('month'));
    document.getElementById('week-view-btn')?.addEventListener('click', () => changeCalendarView('week'));
    document.getElementById('three-days-view-btn')?.addEventListener('click', () => changeCalendarView('three-days'));
    document.getElementById('day-view-btn')?.addEventListener('click', () => changeCalendarView('day'));
    
    // Filtres
    document.getElementById('calendar-project-filter')?.addEventListener('change', onCalendarFilterChange);
    document.getElementById('calendar-priority-filter')?.addEventListener('change', onCalendarFilterChange);
}

// Fonction pour naviguer dans le calendrier
function navigateCalendar(direction) {
    console.log('Navigation calendrier:', direction, 'vue actuelle:', calendarView);
    
    if (calendarView === 'month') {
        // Défiler mois par mois
        currentDate.setMonth(currentDate.getMonth() + direction);
        console.log('Navigation mois:', currentDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }));
    } else if (calendarView === 'week') {
        // Défiler semaine par semaine
        currentDate.setDate(currentDate.getDate() + (direction * 7));
        console.log('Navigation semaine:', currentDate.toLocaleDateString('fr-FR'));
    } else if (calendarView === 'three-days') {
        // Défiler par blocs de 3 jours
        currentDate.setDate(currentDate.getDate() + (direction * 3));
        console.log('Navigation 3 jours:', currentDate.toLocaleDateString('fr-FR'));
    } else if (calendarView === 'day') {
        // Défiler jour par jour
        currentDate.setDate(currentDate.getDate() + direction);
        console.log('Navigation jour:', currentDate.toLocaleDateString('fr-FR'));
    }
    
    renderCalendar();
}

// Fonction pour aller à aujourd'hui
function goToToday() {
    currentDate = new Date();
    renderCalendar();
}

// Fonction pour changer la vue du calendrier
function changeCalendarView(view) {
    calendarView = view;
    
    // Mettre à jour les boutons
    document.getElementById('month-view-btn').className = view === 'month' ? 
        'px-3 py-1 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm transition-colors' :
        'px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors';
    
    document.getElementById('week-view-btn').className = view === 'week' ? 
        'px-3 py-1 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm transition-colors' :
        'px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors';
    
    document.getElementById('three-days-view-btn').className = view === 'three-days' ? 
        'px-3 py-1 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm transition-colors' :
        'px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors';
    
    document.getElementById('day-view-btn').className = view === 'day' ? 
        'px-3 py-1 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm transition-colors' :
        'px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors';
    
    // Masquer toutes les vues
    document.querySelectorAll('.calendar-view').forEach(view => view.classList.add('hidden'));
    
    // Afficher la vue sélectionnée
    document.getElementById(`${view}-calendar`).classList.remove('hidden');
    
    renderCalendar();
}

// Fonction pour rendre le calendrier
function renderCalendar() {
    if (calendarView === 'month') {
        renderMonthView();
    } else if (calendarView === 'week') {
        renderWeekView();
    } else if (calendarView === 'three-days') {
        renderThreeDaysView();
    } else if (calendarView === 'day') {
        renderDayView();
    }
    
    updateCalendarTitle();
}

// Fonction pour rendre la vue mois
function renderMonthView() {
    const calendarDays = document.getElementById('calendar-days');
    if (!calendarDays) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let html = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.toDateString() === new Date().toDateString();
        const dayTasks = getTasksForDate(date);
        
        html += `
            <div class="bg-white min-h-[120px] p-2 ${isCurrentMonth ? '' : 'bg-gray-50'} ${isToday ? 'ring-2 ring-blue-500' : ''}">
                <div class="text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'text-blue-600' : ''}">
                    ${date.getDate()}
                </div>
                <div class="mt-1 space-y-1">
                    ${dayTasks.slice(0, 3).map(task => `
                        <div class="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 ${getPriorityClass(task.priority)}" 
                             onclick="showTaskDetail(${task.id})" 
                             title="${task.title}">
                            ${task.title.substring(0, 15)}${task.title.length > 15 ? '...' : ''}
                        </div>
                    `).join('')}
                    ${dayTasks.length > 3 ? `<div class="text-xs text-gray-500">+${dayTasks.length - 3} autres</div>` : ''}
                </div>
            </div>
        `;
    }
    
    calendarDays.innerHTML = html;
}

// Fonction pour rendre la vue semaine
function renderWeekView() {
    const weekDayHeaders = document.getElementById('week-day-headers');
    const weekTimeSlots = document.getElementById('week-time-slots');
    if (!weekDayHeaders || !weekTimeSlots) return;
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    // En-têtes des jours
    let headersHtml = '';
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const isToday = date.toDateString() === new Date().toDateString();
        
        headersHtml += `
            <div class="bg-gray-50 p-3 text-center ${isToday ? 'bg-blue-50' : ''}">
                <div class="text-sm font-medium text-gray-900">${date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                <div class="text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}">${date.getDate()}</div>
            </div>
        `;
    }
    weekDayHeaders.innerHTML = headersHtml;
    
    // Créneaux horaires
    let timeSlotsHtml = '';
    for (let hour = 8; hour <= 18; hour++) {
        timeSlotsHtml += `<div class="bg-gray-50 p-2 text-xs text-gray-500 text-center">${hour}h</div>`;
        
        for (let day = 0; day < 7; day++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + day);
            date.setHours(hour);
            
            let hourTasks = [];
            if (hour === 18) {
                // À 18h, afficher toutes les tâches de la journée (par date d'échéance)
                hourTasks = getTasksForDate(date);
            } else {
                // Pour les autres heures, afficher les tâches spécifiques à cette heure
                hourTasks = getTasksForDateAndHour(date, hour);
            }
            
            timeSlotsHtml += `
                <div class="bg-white p-1 min-h-[60px] border-l border-t border-gray-200">
                    ${hourTasks.map(task => `
                        <div class="text-xs p-1 rounded mb-1 cursor-pointer hover:bg-gray-100 ${getPriorityClass(task.priority)}" 
                             onclick="showTaskDetail(${task.id})" 
                             title="${task.title}">
                            ${task.title.substring(0, 20)}${task.title.length > 20 ? '...' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    weekTimeSlots.innerHTML = timeSlotsHtml;
}

// Fonction pour rendre la vue jour
function renderDayView() {
    const dayTitle = document.getElementById('day-title');
    const dayTimeSlots = document.getElementById('day-time-slots');
    if (!dayTitle || !dayTimeSlots) return;
    
    dayTitle.textContent = currentDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Obtenir toutes les tâches pour cette date (par date d'échéance)
    const dayTasks = getTasksForDate(currentDate);
    
    let timeSlotsHtml = '';
    for (let hour = 8; hour <= 18; hour++) {
        let hourTasks = [];
        
        if (hour === 18) {
            // À 18h, afficher toutes les tâches de la journée
            hourTasks = dayTasks;
        } else {
            // Pour les autres heures, afficher les tâches spécifiques à cette heure
            hourTasks = getTasksForDateAndHour(currentDate, hour);
        }
        
        timeSlotsHtml += `
            <div class="bg-white p-4 border-b border-gray-200">
                <div class="flex">
                    <div class="w-16 text-sm font-medium text-gray-500">${hour}h</div>
                    <div class="flex-1">
                        ${hourTasks.map(task => `
                            <div class="mb-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${getPriorityClass(task.priority)}" 
                                 onclick="showTaskDetail(${task.id})">
                                <div class="font-medium text-sm">${task.title}</div>
                                ${task.description ? `<div class="text-xs text-gray-600 mt-1">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</div>` : ''}
                                <div class="text-xs text-gray-500 mt-2">${task.project?.name || 'Projet inconnu'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    dayTimeSlots.innerHTML = timeSlotsHtml;
}

// Fonction pour rendre la vue "3 jours"
function renderThreeDaysView() {
    const threeDaysHeaders = document.getElementById('three-days-headers');
    const threeDaysTimeSlots = document.getElementById('three-days-time-slots');
    if (!threeDaysHeaders || !threeDaysTimeSlots) return;
    
    // Calculer les 3 jours à afficher (jour actuel + 2 jours suivants)
    const startDate = new Date(currentDate);
    
    // En-têtes des jours
    let headersHtml = '';
    for (let i = 0; i < 3; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const isToday = date.toDateString() === new Date().toDateString();
        
        headersHtml += `
            <div class="bg-gray-50 p-3 text-center ${isToday ? 'bg-blue-50' : ''}">
                <div class="text-sm font-medium text-gray-900">${date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                <div class="text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}">${date.getDate()}</div>
            </div>
        `;
    }
    threeDaysHeaders.innerHTML = headersHtml;
    
    // Créneaux horaires
    let timeSlotsHtml = '';
    for (let hour = 8; hour <= 18; hour++) {
        timeSlotsHtml += `<div class="bg-gray-50 p-2 text-xs text-gray-500 text-center">${hour}h</div>`;
        
        for (let day = 0; day < 3; day++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + day);
            date.setHours(hour);
            
            let hourTasks = [];
            if (hour === 18) {
                // À 18h, afficher toutes les tâches de la journée (par date d'échéance)
                hourTasks = getTasksForDate(date);
            } else {
                // Pour les autres heures, afficher les tâches spécifiques à cette heure
                hourTasks = getTasksForDateAndHour(date, hour);
            }
            
            timeSlotsHtml += `
                <div class="bg-white p-1 min-h-[60px] border-l border-t border-gray-200">
                    ${hourTasks.map(task => `
                        <div class="text-xs p-1 rounded mb-1 cursor-pointer hover:bg-gray-100 ${getPriorityClass(task.priority)}" 
                             onclick="showTaskDetail(${task.id})" 
                             title="${task.title}">
                            ${task.title.substring(0, 20)}${task.title.length > 20 ? '...' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    threeDaysTimeSlots.innerHTML = timeSlotsHtml;
}

// Fonction pour mettre à jour le titre du calendrier
function updateCalendarTitle() {
    const title = document.getElementById('current-date-range');
    if (!title) return;
    
    if (calendarView === 'month') {
        title.textContent = currentDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    } else if (calendarView === 'week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        title.textContent = `${startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (calendarView === 'three-days') {
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 1); // Afficher les 3 derniers jours
        const endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 2); // Afficher les 3 prochains jours
        title.textContent = `${startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (calendarView === 'day') {
        title.textContent = currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
}

// Fonction pour obtenir les tâches pour une date
function getTasksForDate(date) {
    return calendarTasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === date.toDateString();
    });
}

// Fonction pour obtenir les tâches pour une date et une heure
function getTasksForDateAndHour(date, hour) {
    return calendarTasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === date.toDateString() && taskDate.getHours() === hour;
    });
}

// Fonction pour afficher les détails d'une tâche
function showTaskDetail(taskId) {
    const task = calendarTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = document.getElementById('task-detail-modal');
    const title = document.getElementById('modal-task-title');
    const details = document.getElementById('modal-task-details');
    const editBtn = document.getElementById('edit-task-btn');
    
    title.textContent = task.title;
    
    details.innerHTML = `
        ${task.description ? `<div><strong>Description:</strong> ${task.description}</div>` : ''}
        <div><strong>Projet:</strong> ${task.project?.name || 'Projet inconnu'}</div>
        <div><strong>Colonne:</strong> ${task.column?.name || 'Inconnue'}</div>
        <div><strong>Priorité:</strong> <span class="${getPriorityClass(task.priority)}">${getPriorityLabel(task.priority)}</span></div>
        ${task.due_date ? `<div><strong>Échéance:</strong> ${new Date(task.due_date).toLocaleDateString('fr-FR')}</div>` : ''}
        <div><strong>Assigné à:</strong> ${task.users?.map(u => u.name).join(', ') || 'Non assigné'}</div>
        <div><strong>Créée le:</strong> ${new Date(task.created_at).toLocaleDateString('fr-FR')}</div>
    `;
    
    editBtn.onclick = () => editTaskFromList(taskId);
    
    modal.classList.remove('hidden');
}

// Fonction pour fermer le modal de détails
function closeTaskDetailModal() {
    document.getElementById('task-detail-modal').classList.add('hidden');
}

// Fonction pour gérer les changements de filtre du calendrier
function onCalendarFilterChange() {
    renderCalendar();
}

// ========================================
// FONCTIONS POUR LA GESTION DES MEMBRES
// ========================================

// Fonction pour ouvrir le modal des membres
function openMembersModal() {
    console.log('=== OUVERTURE MODAL MEMBRES ===');
    
    const modal = document.getElementById('members-modal');
    console.log('Modal trouvé:', modal);
    
    if (!modal) {
        console.error('Modal des membres non trouvé dans le DOM');
        return;
    }
    
    // Vérifier que l'utilisateur est le créateur du projet
    if (!isCurrentUserProjectCreator()) {
        console.log('Utilisateur non autorisé à gérer les membres');
        showMembersMessage('Seul le créateur du projet peut gérer les membres.', 'error');
        return;
    }
    
    console.log('Chargement des membres du projet:', currentProject);
    
    // Charger les informations du projet et des membres
    loadProjectMembers();
    
    // Afficher le modal
    modal.classList.remove('hidden');
    console.log('Modal affiché');
}

// Exposer la fonction globalement pour l'attribut onclick
window.openMembersModal = openMembersModal;

// Fonction pour fermer le modal des membres
function closeMembersModal() {
    const modal = document.getElementById('members-modal');
    if (modal) {
        modal.classList.add('hidden');
        resetMembersForm();
    }
}

// Exposer la fonction globalement
window.closeMembersModal = closeMembersModal;

// Fonction pour vérifier si l'utilisateur actuel est le créateur du projet
function isCurrentUserProjectCreator() {
    // Pour l'instant, on autorise tous les utilisateurs à gérer les membres
    // Cette fonction devrait être adaptée selon votre logique d'authentification
    console.log('Vérification des droits de créateur - autorisé temporairement');
    return true;
}

// Fonction pour charger les membres du projet
async function loadProjectMembers() {
    if (!currentProject || currentProject === 'all') {
        showMembersMessage('Veuillez sélectionner un projet spécifique.', 'error');
        return;
    }
    
    const loading = document.getElementById('members-loading');
    const membersList = document.getElementById('members-list');
    const projectName = document.getElementById('project-name');
    const projectCreator = document.getElementById('project-creator');
    
    if (loading) loading.classList.remove('hidden');
    if (membersList) membersList.innerHTML = '';
    
    try {
        // Charger les informations du projet
        const projectResponse = await fetch(`/api/projects/${currentProject}`);
        if (projectResponse.ok) {
            const project = await projectResponse.json();
            if (projectName) projectName.textContent = project.name;
        }
        
        // Charger les membres du projet
        const membersResponse = await fetch(`/api/projects/${currentProject}/members`);
        if (membersResponse.ok) {
            const members = await membersResponse.json();
            console.log('Membres chargés:', members);
            
            // Trouver le créateur parmi les membres
            const creator = members.find(member => member.pivot?.is_creator === true);
            console.log('Créateur trouvé:', creator);
            
            if (projectCreator) {
                if (creator) {
                    projectCreator.textContent = creator.name;
                    console.log('Nom du créateur affiché:', creator.name);
                } else {
                    // Fallback : utiliser les informations du projet
                    const projectResponse = await fetch(`/api/projects/${currentProject}`);
                    if (projectResponse.ok) {
                        const project = await projectResponse.json();
                        if (project.creator && project.creator.name) {
                            projectCreator.textContent = project.creator.name;
                            console.log('Nom du créateur depuis projet:', project.creator.name);
                        } else {
                            projectCreator.textContent = 'Utilisateur inconnu';
                            console.log('Aucun créateur trouvé');
                        }
                    } else {
                        projectCreator.textContent = 'Utilisateur inconnu';
                    }
                }
            }
            
            renderMembersList(members);
        } else {
            const errorData = await membersResponse.json();
            console.error('Erreur API membres:', errorData);
            showMembersMessage('Erreur lors du chargement des membres.', 'error');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
        showMembersMessage('Erreur de connexion au serveur.', 'error');
    } finally {
        if (loading) loading.classList.add('hidden');
    }
}

// Fonction pour afficher la liste des membres
function renderMembersList(members) {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;
    
    if (members.length === 0) {
        membersList.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <p class="text-sm">Aucun membre pour le moment</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    members.forEach(member => {
        const isCreator = member.pivot?.is_creator || false;
        html += `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        ${member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${member.name}</p>
                        <p class="text-xs text-gray-500">${member.email}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${isCreator ? `
                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Créateur</span>
                    ` : `
                        <button 
                            onclick="removeMember(${member.id})"
                            class="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Retirer
                        </button>
                    `}
                </div>
            </div>
        `;
    });
    
    membersList.innerHTML = html;
}

// Fonction pour inviter un nouveau membre
async function inviteMember(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('#member-email').value.trim();
    
    if (!email) {
        showMembersMessage('Veuillez saisir une adresse email.', 'error');
        return;
    }
    
    if (!currentProject || currentProject === 'all') {
        showMembersMessage('Veuillez sélectionner un projet spécifique.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/projects/${currentProject}/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMembersMessage('Invitation envoyée avec succès !', 'success');
            form.reset();
            // Recharger la liste des membres
            loadProjectMembers();
        } else {
            showMembersMessage(data.message || 'Erreur lors de l\'envoi de l\'invitation.', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de l\'invitation:', error);
        showMembersMessage('Erreur de connexion au serveur.', 'error');
    }
}

// Fonction pour retirer un membre
async function removeMember(userId) {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre du projet ?')) {
        return;
    }
    
    if (!currentProject || currentProject === 'all') {
        showMembersMessage('Veuillez sélectionner un projet spécifique.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/projects/${currentProject}/members/${userId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            }
        });
        
        if (response.ok) {
            showMembersMessage('Membre retiré avec succès.', 'success');
            // Recharger la liste des membres
            loadProjectMembers();
        } else {
            const data = await response.json();
            showMembersMessage(data.message || 'Erreur lors du retrait du membre.', 'error');
        }
    } catch (error) {
        console.error('Erreur lors du retrait du membre:', error);
        showMembersMessage('Erreur de connexion au serveur.', 'error');
    }
}

// Exposer la fonction globalement
window.removeMember = removeMember;

// Fonction pour afficher un message dans le modal
function showMembersMessage(message, type = 'info') {
    const messageDiv = document.getElementById('members-message');
    const messageText = document.getElementById('members-message-text');
    
    if (messageDiv && messageText) {
        messageText.textContent = message;
        
        // Supprimer les classes de couleur précédentes
        messageDiv.className = 'mt-4 p-3 rounded-md';
        
        // Ajouter la classe de couleur appropriée
        if (type === 'success') {
            messageDiv.classList.add('bg-green-100', 'text-green-800');
        } else if (type === 'error') {
            messageDiv.classList.add('bg-red-100', 'text-red-800');
        } else {
            messageDiv.classList.add('bg-blue-100', 'text-blue-800');
        }
        
        messageDiv.classList.remove('hidden');
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

// Fonction pour réinitialiser le formulaire d'invitation
function resetMembersForm() {
    const form = document.getElementById('invite-member-form');
    if (form) {
        form.reset();
    }
    
    const messageDiv = document.getElementById('members-message');
    if (messageDiv) {
        messageDiv.classList.add('hidden');
    }
}