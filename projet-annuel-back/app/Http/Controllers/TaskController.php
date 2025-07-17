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
        // Seuls les membres du projet peuvent voir les tâches
        $tasks = $query->with(['project', 'users'])->get()->filter(function ($task) {
            return $task->project->creator_id === Auth::id() || $task->project->members->contains(Auth::id());
        });
        return response()->json($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $validated = $request->validated();
        
        // Vérifier que l'utilisateur a accès à la colonne
        $column = Column::findOrFail($validated['column_id']);
        $project = $column->project;
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            abort(403, 'Accès non autorisé');
        }
        
        $task = Task::create($validated);
        if (!empty($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }
        return response()->json($task, Response::HTTP_CREATED);
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
        
        $task->load(['project', 'users']);
        return response()->json($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        // Vérifier que l'utilisateur a accès à la tâche
        $project = $task->project;
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            abort(403, 'Accès non autorisé');
        }
        
        $validated = $request->validated();
        $task->update($validated);
        if (isset($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }
        return response()->json($task);
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
    public function move(Request $request, string $id)
    {
        $task = Task::with('project')->findOrFail($id);
        $validated = $request->validate([
            'column_id' => 'required|exists:columns,id',
        ]);
        $task->update(['column_id' => $validated['column_id']]);
        return response()->json($task);
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
        return response()->json($task);
    }
}
