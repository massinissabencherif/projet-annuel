{{-- Kanban Header Component --}}
<header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
                <h1 class="text-2xl font-bold text-gray-900">Kanban Board</h1>
            </div>
            <div class="flex items-center space-x-4">
                <!-- Sélecteur de vue -->
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500">Vue :</span>
                    <select id="view-selector" class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="kanban">Kanban</option>
                        <option value="list">Liste</option>
                        <option value="calendar">Calendrier</option>
                    </select>
                </div>
                <button 
                    id="new-project-btn"
                    onclick="openCreateProjectModal()"
                    class="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Nouveau Projet
                </button>
                <button 
                    id="manage-members-btn"
                    onclick="openMembersModal()"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Gérer les membres
                </button>
                <div class="relative">
                    <select 
                        id="project-select"
                        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Sélectionner un projet</option>
                        @foreach($projects ?? [] as $project)
                            <option value="{{ $project->id }}">{{ $project->name }}</option>
                        @endforeach
                    </select>
                </div>
                <button 
                    id="export-ical-btn"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    onclick="exportICal()"
                >
                    Exporter iCal
                </button>
            </div>
        </div>
    </div>
</header> 