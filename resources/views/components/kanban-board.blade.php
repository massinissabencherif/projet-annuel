{{-- Kanban Board Component --}}
@if(isset($project) && $project)
    <div class="space-y-6">
        <!-- Project Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ $project->name }}</h2>
                <p class="text-gray-600">{{ $project->description }}</p>
            </div>
            <div class="flex space-x-2">
                {{-- Suppression du bouton Nouveau Projet ici (en haut) --}}
                <button 
                    onclick="openCreateTaskModal()"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Nouvelle Tâche
                </button>
                <button 
                    id="stats-btn"
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    onclick="openStatsModal()"
                >
                    Statistiques
                </button>
            </div>
        </div>

        <!-- Kanban Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($columns ?? [] as $column)
                <div class="bg-white rounded-lg shadow-sm border">
                    <div class="p-4 border-b">
                        <h3 class="font-medium text-gray-900">{{ $column->name }}</h3>
                        <p class="text-sm text-gray-500">{{ $column->tasks->count() }} tâches</p>
                    </div>
                    <div class="p-4 space-y-3">
                        @foreach($column->tasks as $task)
                            <div class="bg-gray-50 rounded-lg p-3 border cursor-pointer hover:bg-gray-100 transition-colors">
                                <h4 class="font-medium text-gray-900 mb-1">{{ $task->title }}</h4>
                                <p class="text-sm text-gray-600 mb-2">{{ $task->description }}</p>
                                <div class="flex items-center justify-between">
                                    <span class="{{ $task->priority_class }} text-xs px-2 py-1 rounded-full">
                                        {{ $task->priority_label }}
                                    </span>
                                    <span class="text-xs text-gray-500">{{ $task->created_at->format('d/m/Y') }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endforeach
        </div>
    </div>
@else
    <div class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📋</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Sélectionnez un projet</h2>
        <p class="text-gray-600">Choisissez un projet dans le menu déroulant pour commencer à travailler</p>
        <div class="mt-4">
            <p class="text-sm text-gray-500">Projets disponibles: {{ $projects->count() ?? 0 }}</p>
        </div>
    </div>
@endif 