import './bootstrap';
import { createApp } from 'vue';

console.log('=== DÉBUT DU SCRIPT APP.JS ===');

// Application Vue.js Kanban complète
const KanbanApp = {
  data() {
    return {
      projects: [],
      selectedProject: null,
      columns: [],
      tasks: [],
      showCreateProjectModal: false,
      loading: true,
      error: null
    }
  },
  template: `
    <div id="kanban-app" class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-gray-900">Kanban Board</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button 
                @click="showCreateProjectModal = true"
                class="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Nouveau Projet
              </button>
              <div class="relative">
                <select 
                  v-model="selectedProject"
                  @change="loadProjectData"
                  class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Sélectionner un projet</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p class="text-gray-600">{{ error }}</p>
        </div>

        <!-- No Project Selected -->
        <div v-else-if="!selectedProject" class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">📋</div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-2">Sélectionnez un projet</h2>
          <p class="text-gray-600">Choisissez un projet dans le menu déroulant pour commencer à travailler</p>
          <div class="mt-4">
            <p class="text-sm text-gray-500">Projets disponibles: {{ projects.length }}</p>
          </div>
        </div>

        <!-- Kanban Board -->
        <div v-else class="space-y-6">
          <!-- Project Header -->
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ getSelectedProjectName() }}</h2>
              <p class="text-gray-600">{{ getSelectedProjectDescription() }}</p>
            </div>
            <button 
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Nouvelle Tâche
            </button>
          </div>

          <!-- Kanban Columns -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              v-for="column in columns" 
              :key="column.id"
              class="bg-white rounded-lg shadow-sm border"
            >
              <div class="p-4 border-b">
                <h3 class="font-medium text-gray-900">{{ column.name }}</h3>
                <p class="text-sm text-gray-500">{{ getTasksForColumn(column.id).length }} tâches</p>
              </div>
              <div class="p-4 space-y-3">
                <div 
                  v-for="task in getTasksForColumn(column.id)" 
                  :key="task.id"
                  class="bg-gray-50 rounded-lg p-3 border cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <h4 class="font-medium text-gray-900 mb-1">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600 mb-2">{{ task.description }}</p>
                  <div class="flex items-center justify-between">
                    <span :class="getPriorityClass(task.priority)" class="text-xs px-2 py-1 rounded-full">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                    <span class="text-xs text-gray-500">{{ task.created_at }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal de création de projet -->
      <div v-if="showCreateProjectModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Nouveau Projet</h3>
              <button @click="showCreateProjectModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p>Modal de création de projet - Vue.js fonctionne !</p>
            <button @click="showCreateProjectModal = false" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  async mounted() {
    console.log('KanbanApp mounted');
    try {
      await this.loadProjects();
    } catch (error) {
      console.error('Erreur dans mounted:', error);
      this.error = 'Erreur lors du chargement des projets';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadProjects() {
      try {
        console.log('Chargement des projets...');
        
        // Récupérer le token CSRF
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        console.log('CSRF Token:', csrfToken);
        
        const response = await fetch('/api/projects', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'same-origin' // Inclure les cookies de session
        });
        
        console.log('Réponse API projets:', response.status);
        console.log('Headers de réponse:', Object.fromEntries(response.headers.entries()));
        
        if (response.status === 401) {
          console.log('Utilisateur non authentifié');
          this.error = 'Vous devez être connecté pour accéder aux projets. Veuillez vous connecter.';
          return;
        }
        
        if (response.ok) {
          const responseText = await response.text();
          console.log('Réponse brute:', responseText);
          
          try {
            const data = JSON.parse(responseText);
            console.log('Projets chargés:', data);
            this.projects = data;
          } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
            this.error = 'Erreur de format de réponse du serveur';
          }
        } else {
          console.error('Erreur API projets:', response.status, response.statusText);
          this.error = `Erreur API: ${response.status} ${response.statusText}`;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        this.error = 'Erreur de connexion au serveur';
      }
    },
    
    async loadProjectData() {
      if (!this.selectedProject) return;
      
      try {
        console.log('Chargement des données du projet:', this.selectedProject);
        
        // Charger les colonnes
        const columnsResponse = await fetch(`/api/projects/${this.selectedProject}/columns`);
        console.log('Réponse API colonnes:', columnsResponse.status);
        if (columnsResponse.ok) {
          const columnsData = await columnsResponse.json();
          console.log('Colonnes chargées:', columnsData);
          this.columns = columnsData;
        }
        
        // Charger les tâches
        const tasksResponse = await fetch(`/api/projects/${this.selectedProject}/tasks`);
        console.log('Réponse API tâches:', tasksResponse.status);
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          console.log('Tâches chargées:', tasksData);
          this.tasks = tasksData;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du projet:', error);
      }
    },
    
    getTasksForColumn(columnId) {
      return this.tasks.filter(task => task.column_id === columnId);
    },
    
    getSelectedProjectName() {
      const project = this.projects.find(p => p.id === this.selectedProject);
      return project ? project.name : '';
    },
    
    getSelectedProjectDescription() {
      const project = this.projects.find(p => p.id === this.selectedProject);
      return project ? project.description : '';
    },
    
    getPriorityClass(priority) {
      const classes = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800'
      };
      return classes[priority] || classes.medium;
    },
    
    getPriorityLabel(priority) {
      const labels = {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute'
      };
      return labels[priority] || 'Moyenne';
    }
  }
};

console.log('Recherche de l\'élément #app...');
const mountElement = document.getElementById('app');

if (mountElement) {
    console.log('✅ Élément #app trouvé:', mountElement);
    console.log('Contenu de #app avant Vue:', mountElement.innerHTML);
    
    try {
        console.log('Création de l\'application Vue Kanban...');
        const app = createApp(KanbanApp);
        console.log('Montage de l\'application Kanban...');
        app.mount('#app');
        console.log('✅ Vue.js Kanban monté avec succès');
    } catch (error) {
        console.error('❌ Erreur lors du montage Vue:', error);
        mountElement.innerHTML = `<div style="padding: 20px; background: red; color: white;">Erreur Vue.js: ${error.message}</div>`;
    }
} else {
    console.error('❌ Élément #app non trouvé');
    document.body.innerHTML += '<div style="padding: 20px; background: red; color: white;">Élément #app manquant</div>';
}

console.log('=== FIN DU SCRIPT APP.JS ===');
