{{-- Modal de création de tâche --}}
<div id="create-task-modal" class="modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">Nouvelle Tâche</h3>
                <button class="modal-close text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form id="create-task-form" onsubmit="createTask(event)">
                @csrf
                <div class="mb-4">
                    <label for="task-title" class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                    <input 
                        type="text" 
                        id="task-title"
                        name="title"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Titre de la tâche"
                    >
                </div>
                
                <div class="mb-4">
                    <label for="task-description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                        id="task-description"
                        name="description"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description de la tâche..."
                    ></textarea>
                </div>
                
                <div class="mb-4">
                    <label for="task-category" class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                    <input 
                        type="text" 
                        id="task-category"
                        name="category"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Développement, Design, Test..."
                    >
                </div>
                
                <div class="mb-4">
                    <label for="task-priority" class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select 
                        id="task-priority"
                        name="priority"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="low">Basse</option>
                        <option value="medium" selected>Moyenne</option>
                        <option value="high">Haute</option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label for="task-due-date" class="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
                    <input 
                        type="date" 
                        id="task-due-date"
                        name="due_date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                </div>
                
                <div class="mb-4">
                    <label for="task-column" class="block text-sm font-medium text-gray-700 mb-2">Colonne</label>
                    <select 
                        id="task-column"
                        name="column_id"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Sélectionner une colonne</option>
                        <!-- Les options seront ajoutées dynamiquement -->
                    </select>
                </div>
                
                <div class="mb-4" id="label-select-block">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Labels</label>
                    <div id="label-badges" class="flex flex-wrap gap-2"></div>
                    <input type="hidden" name="label_ids" id="selected-label-ids" value="">
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