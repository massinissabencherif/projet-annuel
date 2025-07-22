<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Nouvelle Tâche</h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createTask">
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
          
          <div class="mb-6">
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
          
          <div class="flex justify-end space-x-3">
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
              {{ loading ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'CreateTaskModal',
  props: {
    columnId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'task-created'],
  setup(props, { emit }) {
    const form = ref({
      title: '',
      description: '',
      priority: 'medium',
      due_date: ''
    })
    const loading = ref(false)

    const createTask = async () => {
      loading.value = true
      
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
          },
          body: JSON.stringify({
            ...form.value,
            column_id: props.columnId
          })
        })

        if (response.ok) {
          emit('task-created')
          form.value = {
            title: '',
            description: '',
            priority: 'medium',
            due_date: ''
          }
        } else {
          const error = await response.json()
          alert('Erreur lors de la création de la tâche: ' + (error.message || 'Erreur inconnue'))
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la création de la tâche')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      createTask
    }
  }
}
</script> 