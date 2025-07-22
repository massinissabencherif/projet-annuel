<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Project;
use App\Models\Column;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Optionnel : filtrer par projet ou colonne
        $query = Task::query();
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->has('column_id')) {
            $query->where('column_id', $request->column_id);
        }
        
        // Temporairement : retourner toutes les tâches si pas d'authentification
        $userId = Auth::id();
        if (!$userId) {
            $tasks = $query->with(['project', 'users', 'labels'])->get();
        } else {
            // Seuls les membres du projet peuvent voir les tâches
            $tasks = $query->with(['project', 'users', 'labels'])->get()->filter(function ($task) use ($userId) {
                return $task->project->creator_id === $userId || $task->project->members->contains($userId);
            });
        }
        return response()->json($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        \Log::info('=== CRÉATION TÂCHE DÉBUT ===');
        \Log::info('Données reçues:', $request->all());
        
        $validated = $request->validated();
        \Log::info('Données validées:', $validated);
        
        // Temporairement : gérer l'authentification
        $userId = Auth::id();
        if (!$userId) {
            // Utiliser l'utilisateur de test
            $user = \App\Models\User::firstOrCreate(
                ['email' => 'test@example.com'],
                [
                    'name' => 'Utilisateur Test',
                    'password' => bcrypt('password')
                ]
            );
            $userId = $user->id;
        }
        
        // Vérifier que l'utilisateur a accès à la colonne
        $column = Column::findOrFail($validated['column_id']);
        $project = $column->project;
        // DEV : on autorise la création de tâche à tout le monde
        // if ($userId && $project->creator_id !== $userId && !$project->members->contains($userId)) {
        //     abort(403, 'Accès non autorisé');
        // }
        
        \Log::info('Création de la tâche...');
        $task = Task::create($validated);
        \Log::info('Tâche créée avec ID:', ['id' => $task->id]);
        
        if (!empty($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }
        if (!empty($validated['label_ids'])) {
            $task->labels()->sync($validated['label_ids']);
        }
        
        \Log::info('=== CRÉATION TÂCHE TERMINÉE ===');
        return response()->json($task->load(['users', 'labels', 'project']), Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        // Vérifier que l'utilisateur a accès à la tâche
        $project = $task->project;
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            abort(403, 'Accès non autorisé');
        }
        
        $task->load(['project', 'users', 'labels']);
        return response()->json($task->load(['users', 'labels', 'project']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        // DEV : désactiver temporairement l'authentification pour les tests
        // $project = $task->project;
        // if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
        //     abort(403, 'Accès non autorisé');
        // }
        $validated = $request->validated();
        $task->update($validated);
        if (isset($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }
        if (isset($validated['label_ids'])) {
            $task->labels()->sync($validated['label_ids']);
        }
        return response()->json($task->load(['users', 'labels', 'project']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        // Vérifier que l'utilisateur a accès à la tâche
        $project = $task->project;
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            abort(403, 'Accès non autorisé');
        }
        
        $task->delete();
        return response()->json(['message' => 'Tâche supprimée']);
    }

    // Déplacer une tâche vers une autre colonne
    public function move(Request $request, Task $task)
    {
        \Log::info('=== DÉPLACEMENT TÂCHE DÉBUT ===');
        \Log::info('Tâche à déplacer:', ['task_id' => $task->id, 'current_column' => $task->column_id]);
        
        $validated = $request->validate([
            'column_id' => 'required|exists:columns,id',
            'completed_at' => 'nullable|date',
        ]);
        
        \Log::info('Nouvelle colonne:', $validated);
        
        // Temporairement : gérer l'authentification
        $userId = Auth::id();
        if (!$userId) {
            // Utiliser l'utilisateur de test
            $user = \App\Models\User::firstOrCreate(
                ['email' => 'test@example.com'],
                [
                    'name' => 'Utilisateur Test',
                    'password' => bcrypt('password')
                ]
            );
            $userId = $user->id;
        }
        
        // Vérifier que l'utilisateur a accès à la tâche
        $project = $task->project;
        // DEV : on autorise le déplacement de tâche à tout le monde
        // if ($userId && $project->creator_id !== $userId && !$project->members->contains($userId)) {
        //     abort(403, 'Accès non autorisé');
        // }
        
        // Vérifier que la nouvelle colonne appartient au même projet
        $newColumn = Column::findOrFail($validated['column_id']);
        if ($newColumn->project_id !== $task->project_id) {
            abort(400, 'La colonne doit appartenir au même projet');
        }
        
        $oldColumnId = $task->column_id;
        $updateData = ['column_id' => $validated['column_id']];
        if (array_key_exists('completed_at', $validated)) {
            $updateData['completed_at'] = $validated['completed_at'];
        }
        $task->update($updateData);
        
        \Log::info('Tâche déplacée:', [
            'task_id' => $task->id,
            'from_column' => $oldColumnId,
            'to_column' => $validated['column_id'],
            'completed_at' => $task->completed_at
        ]);
        
        \Log::info('=== DÉPLACEMENT TÂCHE TERMINÉ ===');
        return response()->json($task->load(['users', 'labels', 'project']));
    }

    // Assigner/désassigner des utilisateurs à une tâche
    public function assign(Request $request, string $id)
    {
        $task = Task::with('project')->findOrFail($id);
        $validated = $request->validate([
            'user_ids' => 'array',
            'user_ids.*' => 'exists:users,id',
        ]);
        $task->users()->sync($validated['user_ids'] ?? []);
        return response()->json($task->load(['users', 'labels', 'project']));
    }
}
