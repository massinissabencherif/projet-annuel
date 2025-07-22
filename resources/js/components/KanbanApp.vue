<template>
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
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
                <option 
                  v-for="project in projects" 
                  :key="project.id" 
                  :value="project.id"
                >
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
      <div v-if="!selectedProject" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📋</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Sélectionnez un projet</h2>
        <p class="text-gray-600">Choisissez un projet dans le menu déroulant pour commencer à travailler</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Project Info -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ currentProject?.name }}</h2>
              <p class="text-gray-600 mt-1">{{ currentProject?.description }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-500">
                {{ currentProject?.members?.length || 0 }} membres
              </span>
              <button 
                @click="showAddMemberModal = true"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Ajouter membre
              </button>
            </div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div 
            v-for="column in columns" 
            :key="column.id"
            class="bg-white rounded-lg shadow"
          >
            <div class="p-4 border-b">
              <h3 class="font-semibold text-gray-900">{{ column.name }}</h3>
              <p class="text-sm text-gray-500">{{ column.tasks?.length || 0 }} tâches</p>
            </div>
            
            <div class="p-4">
              <div class="space-y-3">
                <div 
                  v-for="task in column.tasks" 
                  :key="task.id"
                  @click="editTask(task)"
                  class="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <h4 class="font-medium text-gray-900 mb-2">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600 mb-3">{{ task.description }}</p>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <span 
                        :class="getPriorityClass(task.priority)"
                        class="px-2 py-1 text-xs font-medium rounded-full"
                      >
                        {{ task.priority }}
                      </span>
                      <span class="text-xs text-gray-500">
                        {{ formatDate(task.due_date) }}
                      </span>
                    </div>
                    <div class="flex -space-x-2">
                      <div 
                        v-for="member in task.users?.slice(0, 3)" 
                        :key="member.id"
                        class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      >
                        {{ member.name?.charAt(0) }}
                      </div>
                      <div 
                        v-if="task.users?.length > 3"
                        class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium"
                      >
                        +{{ task.users.length - 3 }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="createTask(column.id)"
                  class="w-full text-center py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  + Ajouter une tâche
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <CreateProjectModal 
      v-if="showCreateProjectModal"
      @close="showCreateProjectModal = false"
      @project-created="onProjectCreated"
    />
    
    <CreateTaskModal 
      v-if="showCreateTaskModal"
      :column-id="selectedColumnId"
      @close="showCreateTaskModal = false"
      @task-created="onTaskCreated"
    />
    
    <EditTaskModal 
      v-if="showEditTaskModal"
      :task="selectedTask"
      @close="showEditTaskModal = false"
      @task-updated="onTaskUpdated"
    />
    
    <AddMemberModal 
      v-if="showAddMemberModal"
      :project-id="selectedProject"
      @close="showAddMemberModal = false"
      @member-added="onMemberAdded"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import CreateProjectModal from './CreateProjectModal.vue'
import CreateTaskModal from './CreateTaskModal.vue'
import EditTaskModal from './EditTaskModal.vue'
import AddMemberModal from './AddMemberModal.vue'

export default {
  name: 'KanbanApp',
  components: {
    CreateProjectModal,
    CreateTaskModal,
    EditTaskModal,
    AddMemberModal
  },
  setup() {
    const projects = ref([])
    const columns = ref([])
    const selectedProject = ref('')
    const currentProject = ref(null)
    
    // Modal states
    const showCreateProjectModal = ref(false)
    const showCreateTaskModal = ref(false)
    const showEditTaskModal = ref(false)
    const showAddMemberModal = ref(false)
    const selectedColumnId = ref(null)
    const selectedTask = ref(null)

    // Load projects on mount
    onMounted(() => {
      loadProjects()
    })

    const loadProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()
        projects.value = data.data || []
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
      }
    }

    const loadProjectData = async () => {
      if (!selectedProject.value) {
        currentProject.value = null
        columns.value = []
        return
      }

      try {
        const [projectResponse, columnsResponse] = await Promise.all([
          fetch(`/api/projects/${selectedProject.value}`),
          fetch(`/api/projects/${selectedProject.value}/columns`)
        ])
        
        const projectData = await projectResponse.json()
        const columnsData = await columnsResponse.json()
        
        currentProject.value = projectData.data
        columns.value = columnsData.data || []
      } catch (error) {
        console.error('Erreur lors du chargement des données du projet:', error)
      }
    }

    const createTask = (columnId) => {
      selectedColumnId.value = columnId
      showCreateTaskModal.value = true
    }

    const editTask = (task) => {
      selectedTask.value = task
      showEditTaskModal.value = true
    }

    const onProjectCreated = (project) => {
      projects.value.push(project)
      showCreateProjectModal.value = false
    }

    const onTaskCreated = () => {
      loadProjectData()
      showCreateTaskModal.value = false
    }

    const onTaskUpdated = () => {
      loadProjectData()
      showEditTaskModal.value = false
    }

    const onMemberAdded = () => {
      loadProjectData()
      showAddMemberModal.value = false
    }

    const getPriorityClass = (priority) => {
      const classes = {
        'low': 'bg-green-100 text-green-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-red-100 text-red-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    }

    return {
      projects,
      columns,
      selectedProject,
      currentProject,
      showCreateProjectModal,
      showCreateTaskModal,
      showEditTaskModal,
      showAddMemberModal,
      selectedColumnId,
      selectedTask,
      loadProjectData,
      createTask,
      editTask,
      onProjectCreated,
      onTaskCreated,
      onTaskUpdated,
      onMemberAdded,
      getPriorityClass,
      formatDate
    }
  }
}
</script> 