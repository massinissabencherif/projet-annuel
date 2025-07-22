<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Modifier la Tâche</h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="updateTask">
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez le titre de la tâche"
            />
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez la tâche"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              id="priority"
              v-model="form.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label for="due_date" class="block text-sm font-medium text-gray-700 mb-2">
              Date d'échéance
            </label>
            <input
              id="due_date"
              v-model="form.due_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div class="mb-6">
            <label for="column_id" class="block text-sm font-medium text-gray-700 mb-2">
              Colonne
            </label>
            <select
              id="column_id"
              v-model="form.column_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option 
                v-for="column in columns" 
                :key="column.id" 
                :value="column.id"
              >
                {{ column.name }}
              </option>
            </select>
          </div>
          
          <div class="flex justify-between">
            <button
              type="button"
              @click="deleteTask"
              :disabled="loading"
              class="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Suppression...' : 'Supprimer' }}
            </button>
            
            <div class="flex space-x-3">
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading ? 'Mise à jour...' : 'Mettre à jour' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'EditTaskModal',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'task-updated'],
  setup(props, { emit }) {
    const form = ref({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      column_id: ''
    })
    const columns = ref([])
    const loading = ref(false)

    onMounted(() => {
      // Initialiser le formulaire avec les données de la tâche
      form.value = {
        title: props.task.title || '',
        description: props.task.description || '',
        priority: props.task.priority || 'medium',
        due_date: props.task.due_date ? props.task.due_date.split('T')[0] : '',
        column_id: props.task.column_id || ''
      }
      
      // Charger les colonnes
      loadColumns()
    })

    const loadColumns = async () => {
      try {
        const response = await fetch(`/api/projects/${props.task.project_id}/columns`)
        const data = await response.json()
        columns.value = data.data || []
      } catch (error) {
        console.error('Erreur lors du chargement des colonnes:', error)
      }
    }

    const updateTask = async () => {
      loading.value = true
      
      try {
        const response = await fetch(`/api/tasks/${props.task.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
          },
          body: JSON.stringify(form.value)
        })

        if (response.ok) {
          emit('task-updated')
        } else {
          const error = await response.json()
          alert('Erreur lors de la mise à jour de la tâche: ' + (error.message || 'Erreur inconnue'))
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la mise à jour de la tâche')
      } finally {
        loading.value = false
      }
    }

    const deleteTask = async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        return
      }

      loading.value = true
      
      try {
        const response = await fetch(`/api/tasks/${props.task.id}`, {
          method: 'DELETE',
          headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
          }
        })

        if (response.ok) {
          emit('task-updated')
        } else {
          const error = await response.json()
          alert('Erreur lors de la suppression de la tâche: ' + (error.message || 'Erreur inconnue'))
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la suppression de la tâche')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      columns,
      loading,
      updateTask,
      deleteTask
    }
  }
}
</script> 