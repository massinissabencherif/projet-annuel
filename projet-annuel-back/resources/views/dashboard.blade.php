<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Kanban Board') }}
        </h2>
    </x-slot>

    <style>
        .sortable-ghost {
            opacity: 0.5;
            background-color: #dbeafe !important;
            border-color: #3b82f6 !important;
        }
        
        .sortable-chosen {
            background-color: #fef3c7 !important;
            border-color: #f59e0b !important;
            transform: rotate(2deg);
        }
        
        .sortable-drag {
            background-color: #dcfce7 !important;
            border-color: #22c55e !important;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .task-card {
            user-select: none;
        }
        
        .sortable-no-drop {
            user-select: none;
            pointer-events: none;
        }
        
        .sortable-drop-zone {
            transition: all 0.2s ease;
        }
        
        .sortable-drop-zone:hover {
            border-color: #3b82f6;
            background-color: #eff6ff;
        }
        
        /* Améliorer la zone de drop pour les colonnes avec tâches */
        .p-4.space-y-3.min-h-\[200px\] {
            min-height: 200px;
            padding: 1rem;
            transition: background-color 0.2s ease;
        }
        
        .p-4.space-y-3.min-h-\[200px\]:hover {
            background-color: #f8fafc;
        }
        
        /* Styles pour notre drag & drop personnalisé */
        .task-card {
            cursor: grab;
            transition: all 0.2s ease;
        }
        
        .task-card:active {
            cursor: grabbing;
        }
        
        .dragging-ghost {
            pointer-events: none;
            z-index: 1000;
        }
        
        .drop-zone-active {
            background-color: #eff6ff !important;
            border: 2px dashed #3b82f6 !important;
            border-radius: 8px;
        }
        
        /* Liseré bleu pour les labels sélectionnés */
        .label-badge.ring-2.ring-blue-500 {
            box-shadow: 0 0 0 2px #3b82f6 !important;
            border-color: #3b82f6 !important;
        }
        .label-badge.opacity-60 {
            opacity: 0.6 !important;
        }

    </style>

    <!-- Kanban Interface -->
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        @include('components.kanban-header')

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div id="kanban-main">
                @include('components.kanban-board')
            </div>
            
            <!-- Vue Liste -->
            @include('components.task-list')
            @include('components.calendar-view')
            @include('components.members-modal')
        </main>
    </div>

    <!-- Modals -->
    @include('components.modal-create-project')
    @include('components.modal-create-task')

    @vite(['resources/css/app.css', 'resources/js/kanban.js'])
</x-app-layout>
