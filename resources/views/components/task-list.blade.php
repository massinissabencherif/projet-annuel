{{-- Task List View Component --}}
<div id="task-list-view" class="hidden">
    <!-- Filtres et recherche -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Recherche -->
            <div class="md:col-span-2">
                <label for="search-input" class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                <input 
                    type="text" 
                    id="search-input" 
                    placeholder="Rechercher dans les tâches..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
            </div>
            
            <!-- Filtre par colonne -->
            <div>
                <label for="column-filter" class="block text-sm font-medium text-gray-700 mb-1">Colonne</label>
                <select id="column-filter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Toutes les colonnes</option>
                </select>
            </div>
            
            <!-- Filtre par priorité -->
            <div>
                <label for="priority-filter" class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select id="priority-filter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Toutes les priorités</option>
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Tableau des tâches -->
    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="title">
                            Titre
                            <span class="sort-icon">↕</span>
                        </th>
                        <th id="project-column-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="project" style="display: none;">
                            Projet
                            <span class="sort-icon">↕</span>
                        </th>
                        <th id="column-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="column">
                            Colonne
                            <span class="sort-icon">↕</span>
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="priority">
                            Priorité
                            <span class="sort-icon">↕</span>
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="due_date">
                            Échéance
                            <span class="sort-icon">↕</span>
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigné à
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="created_at">
                            Créée le
                            <span class="sort-icon">↕</span>
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody id="task-list-body" class="bg-white divide-y divide-gray-200">
                    <!-- Les tâches seront injectées ici par JavaScript -->
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div id="task-list-pagination" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
                <button id="prev-page-mobile" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Précédent
                </button>
                <button id="next-page-mobile" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Suivant
                </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700">
                        Affichage de <span id="start-item" class="font-medium">1</span> à <span id="end-item" class="font-medium">10</span> sur <span id="total-items" class="font-medium">20</span> résultats
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button id="prev-page" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <span class="sr-only">Précédent</span>
                            ←
                        </button>
                        <div id="page-numbers" class="flex">
                            <!-- Les numéros de page seront générés ici -->
                        </div>
                        <button id="next-page" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <span class="sr-only">Suivant</span>
                            →
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</div> 