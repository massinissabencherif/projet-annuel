<div id="calendar-view" class="hidden">
    <div class="bg-white rounded-lg shadow-sm border">
        <!-- Calendar Header -->
        <div class="p-6 border-b">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <h2 class="text-2xl font-bold text-gray-900" id="calendar-title">Calendrier</h2>
                    <div class="flex items-center space-x-2">
                        <button id="prev-month" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <button id="today-btn" class="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            Aujourd'hui
                        </button>
                        <button id="next-month" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="flex items-center space-x-4">
                    <!-- View Selector -->
                    <div class="flex bg-gray-100 rounded-lg p-1">
                        <button id="month-view-btn" class="px-3 py-1 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm transition-colors">
                            Mois
                        </button>
                        <button id="week-view-btn" class="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Semaine
                        </button>
                        <button id="three-days-view-btn" class="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            3 Jours
                        </button>
                        <button id="day-view-btn" class="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Jour
                        </button>
                    </div>
                    
                    <!-- Create Task Button -->
                    <button onclick="openCreateTaskModal()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Nouvelle Tâche
                    </button>
                </div>
            </div>
        </div>

        <!-- Calendar Navigation -->
        <div class="px-6 py-4 border-b bg-gray-50">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <span id="current-date-range" class="text-lg font-medium text-gray-900">Janvier 2025</span>
                </div>
                
                <!-- Suppression des filtres ici -->
            </div>
        </div>

        <!-- Calendar Grid -->
        <div class="p-6">
            <!-- Month View -->
            <div id="month-calendar" class="calendar-view">
                <div class="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    <!-- Day Headers -->
                    <div class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">Dim</div>
                    <div class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">Lun</div>
                    <div class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">Mar</div>
                    <div class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">Mer</div>
                    <div class="bg-gray-50 p-3 text-center text-center text-sm font-medium text-gray-900">Jeu</div>
                    <div class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">Ven</div>
                    <div class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">Sam</div>
                    
                    <!-- Calendar Days -->
                    <div id="calendar-days" class="contents">
                        <!-- Days will be populated by JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Week View -->
            <div id="week-calendar" class="calendar-view hidden">
                <div class="grid grid-cols-8 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    <!-- Time Column -->
                    <div class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">Heure</div>
                    
                    <!-- Day Headers -->
                    <div id="week-day-headers" class="contents">
                        <!-- Day headers will be populated by JavaScript -->
                    </div>
                    
                    <!-- Week Time Slots -->
                    <div id="week-time-slots" class="contents">
                        <!-- Time slots will be populated by JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Three Days View -->
            <div id="three-days-calendar" class="calendar-view hidden">
                <div class="grid grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    <!-- Time Column -->
                    <div class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900">Heure</div>
                    
                    <!-- Day Headers -->
                    <div id="three-days-headers" class="contents">
                        <!-- Day headers will be populated by JavaScript -->
                    </div>
                    
                    <!-- Three Days Time Slots -->
                    <div id="three-days-time-slots" class="contents">
                        <!-- Time slots will be populated by JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Day View -->
            <div id="day-calendar" class="calendar-view hidden">
                <div class="grid grid-cols-1 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    <!-- Day Header -->
                    <div id="day-header" class="bg-gray-50 p-4 text-center">
                        <h3 id="day-title" class="text-lg font-medium text-gray-900">Lundi 20 Janvier 2025</h3>
                    </div>
                    
                    <!-- Day Time Slots -->
                    <div id="day-time-slots" class="contents">
                        <!-- Time slots will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Task Detail Modal -->
<div id="task-detail-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
            <h3 id="modal-task-title" class="text-lg font-medium text-gray-900 mb-4"></h3>
            <div id="modal-task-details" class="space-y-3">
                <!-- Task details will be populated by JavaScript -->
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button onclick="closeTaskDetailModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    Fermer
                </button>
                <button id="edit-task-btn" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Modifier
                </button>
            </div>
        </div>
    </div>
</div> 