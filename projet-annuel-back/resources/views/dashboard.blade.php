<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Kanban Board') }}
        </h2>
    </x-slot>

    <div id="app">
        <!-- L'application Vue.js sera montée ici -->
    </div>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</x-app-layout>
