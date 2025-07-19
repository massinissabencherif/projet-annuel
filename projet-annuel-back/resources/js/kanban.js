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

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation du Kanban...');
    initializeKanban();
});

function initializeKanban() {
    setupEventListeners();
    loadProjects();
}

function setupEventListeners() {
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
    
    // Ajouter les projets
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
        console.log('Option ajoutée:', project.name, '(ID:', project.id, ')');
    });
    
    console.log('Sélecteur mis à jour avec', projects.length, 'projets');
}

async function onProjectChange(event) {
    const projectId = event.target.value;
    if (projectId) {
        console.log('Chargement des données du projet:', projectId);
        await loadProjectData(projectId);
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

// Fonctions pour les formulaires
async function createProject(event) {
    console.log('=== FONCTION createProject APPELÉE ===');
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const projectData = {
        name: formData.get('name'),
        description: formData.get('description')
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
    }
}

async function createTask(event) {
    console.log('=== FONCTION createTask APPELÉE ===');
    event.preventDefault();
    
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
        moveTask(draggedTaskId, dropZone.columnId);
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

// Fonction pour mettre à jour l'affichage sans réinitialiser Sortable
function updateKanbanDisplay() {
    console.log('=== MISE À JOUR AFFICHAGE KANBAN ===');
    
    // Mettre à jour les compteurs de tâches
    const columns = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm.border');
    columns.forEach(column => {
        const columnIdElement = column.querySelector('[data-column-id]');
        if (!columnIdElement) {
            console.warn('Élément data-column-id non trouvé dans une colonne');
            return;
        }
        
        const columnId = columnIdElement.getAttribute('data-column-id');
        const taskCount = getTasksForColumn(columnId).length;
        const countElement = column.querySelector('.text-sm.text-gray-500');
        if (countElement) {
            countElement.textContent = `${taskCount} tâches`;
        }
        
        // Mettre à jour l'affichage des tâches dans cette colonne
        const taskContainer = column.querySelector('.p-4.space-y-3');
        if (taskContainer) {
            const tasksForColumn = getTasksForColumn(columnId);
            
            // Supprimer les anciennes tâches
            const oldTasks = taskContainer.querySelectorAll('.task-card');
            oldTasks.forEach(task => task.remove());
            
            // Ajouter les nouvelles tâches
            tasksForColumn.forEach(task => {
                const taskElement = createTaskElement(task, columnId);
                taskContainer.appendChild(taskElement);
            });
            
            // Mettre à jour le message "Aucune tâche"
            const noTaskMessage = taskContainer.querySelector('.sortable-no-drop');
            if (tasksForColumn.length === 0) {
                if (!noTaskMessage) {
                    taskContainer.innerHTML = `
                        <div class="text-center py-8 text-gray-400 sortable-no-drop">
                            <p class="text-sm">Aucune tâche</p>
                            <div class="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 sortable-drop-zone">
                                <p class="text-xs text-gray-500">Déposez une tâche ici</p>
                            </div>
                        </div>
                    `;
                }
            } else {
                if (noTaskMessage) {
                    noTaskMessage.remove();
                }
            }
        }
    });
    
    console.log('Affichage mis à jour');
}

// Fonction pour créer un élément de tâche
function createTaskElement(task, columnId) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'bg-gray-50 rounded-lg p-3 border cursor-move hover:bg-gray-100 transition-colors task-card';
    taskDiv.setAttribute('data-task-id', task.id);
    taskDiv.setAttribute('data-column-id', columnId);
    
    taskDiv.innerHTML = `
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
    `;
    
    return taskDiv;
}

// Fonction pour déplacer une tâche via l'API
async function moveTask(taskId, newColumnId) {
    console.log('=== DÉPLACEMENT TÂCHE ===');
    console.log('Tâche:', taskId, 'Vers colonne:', newColumnId);
    
    try {
        const response = await fetch(`/api/tasks/${taskId}/move`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({
                column_id: newColumnId
            })
        });
        
        console.log('Réponse API déplacement:', response.status, response.statusText);
        
        if (response.ok) {
            const updatedTask = await response.json();
            console.log('Tâche déplacée avec succès:', updatedTask);
            console.log('Column ID dans la réponse:', updatedTask.column_id);
            console.log('Type de column_id:', typeof updatedTask.column_id);
            
            // Mettre à jour la tâche dans la liste locale
            const taskIndex = tasks.findIndex(t => t.id == taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = updatedTask;
                console.log('Tâche mise à jour dans la liste locale');
                console.log('Tâche mise à jour:', tasks[taskIndex]);
                console.log('Liste des tâches après mise à jour:', tasks);
            }
            
            // Afficher un message de succès
            showSuccess('Tâche déplacée avec succès !');
            
            // Mettre à jour l'affichage en réaffichant complètement le Kanban
            showKanbanBoard();
        } else {
            let errorMessage = 'Erreur lors du déplacement de la tâche';
            try {
                const errorData = await response.json();
                errorMessage += ': ' + (errorData.message || 'Erreur inconnue');
                console.error('Erreur API déplacement:', errorData);
            } catch (e) {
                console.error('Erreur lors du parsing de l\'erreur:', e);
            }
            
            showError(errorMessage);
            
            // Recharger les données pour remettre la tâche à sa place
            console.log('Rechargement des données après erreur...');
            await loadProjectData(currentProject);
        }
    } catch (error) {
        console.error('Erreur lors du déplacement de la tâche:', error);
        showError('Erreur de connexion au serveur');
        
        // Recharger les données pour remettre la tâche à sa place
        console.log('Rechargement des données après erreur de connexion...');
        await loadProjectData(currentProject);
    }
}