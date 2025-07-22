<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Ajouter un Membre</h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="addMember">
          <div class="mb-6">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email du membre
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="exemple@email.com"
            />
            <p class="text-sm text-gray-500 mt-1">
              L'utilisateur recevra une invitation par email
            </p>
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
              {{ loading ? 'Ajout...' : 'Ajouter' }}
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
  name: 'AddMemberModal',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'member-added'],
  setup(props, { emit }) {
    const form = ref({
      email: ''
    })
    const loading = ref(false)

    const addMember = async () => {
      loading.value = true
      
      try {
        const response = await fetch(`/api/projects/${props.projectId}/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
          },
          body: JSON.stringify(form.value)
        })

        if (response.ok) {
          emit('member-added')
          form.value = { email: '' }
        } else {
          const error = await response.json()
          alert('Erreur lors de l\'ajout du membre: ' + (error.message || 'Erreur inconnue'))
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de l\'ajout du membre')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      addMember
    }
  }
}
</script> 