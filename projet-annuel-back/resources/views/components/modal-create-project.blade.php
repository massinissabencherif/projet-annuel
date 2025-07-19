{{-- Modal de création de projet --}}
<div id="create-project-modal" class="modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">Nouveau Projet</h3>
                <button class="modal-close text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form id="create-project-form" onsubmit="createProject(event)">
                @csrf
                <div class="mb-4">
                    <label for="project-name" class="block text-sm font-medium text-gray-700 mb-2">Nom du projet</label>
                    <input 
                        type="text" 
                        id="project-name"
                        name="name"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mon nouveau projet"
                    >
                </div>
                
                <div class="mb-4">
                    <label for="project-description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                        id="project-description"
                        name="description"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description du projet..."
                    ></textarea>
                </div>
                
                <div class="flex justify-end space-x-3">
                    <button 
                        type="button"
                        class="modal-close px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit"
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Créer
                    </button>
                </div>
            </form>
        </div>
    </div>
</div> 