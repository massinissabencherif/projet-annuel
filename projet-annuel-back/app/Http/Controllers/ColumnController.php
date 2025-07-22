<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Column;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
use App\Http\Requests\StoreColumnRequest;
use App\Http\Requests\UpdateColumnRequest;

class ColumnController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Optionnel : filtrer par projet
        $query = Column::query();
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        // Seuls les membres du projet peuvent voir les colonnes
        $columns = $query->get()->filter(function ($column) {
            return $column->project->creator_id === Auth::id() || $column->project->members->contains(Auth::id());
        });
        return response()->json($columns);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreColumnRequest $request)
    {
        $validated = $request->validated();
        $project = Project::findOrFail($validated['project_id']);
        // DEV : autoriser tout le monde temporairement
        // if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
        //     return response()->json(['error' => 'Non autorisé'], 403);
        // }
        // Limite à 7 colonnes max
        if ($project->columns()->count() >= 7) {
            return response()->json(['error' => 'Nombre maximum de colonnes atteint'], 422);
        }
        // Calcul de l'ordre
        $maxOrder = $project->columns()->max('order') ?? 0;
        $column = $project->columns()->create([
            'name' => $validated['name'],
            'is_terminal' => $validated['is_terminal'] ?? false,
            'order' => $maxOrder + 1,
        ]);
        return response()->json($column, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $column = Column::with('project')->findOrFail($id);
        // Seuls les membres du projet peuvent voir la colonne
        if ($column->project->creator_id !== Auth::id() && !$column->project->members->contains(Auth::id())) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }
        return response()->json($column);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateColumnRequest $request, string $id)
    {
        $column = Column::with('project')->findOrFail($id);
        // Seul le créateur du projet peut modifier la colonne
        if ($column->project->creator_id !== Auth::id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }
        $validated = $request->validated();
        $column->update($validated);
        return response()->json($column);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $column = Column::with('project')->findOrFail($id);
        $project = $column->project;
        // DEV : autoriser tout le monde temporairement
        // if ($project->creator_id !== Auth::id()) {
        //     return response()->json(['error' => 'Non autorisé'], 403);
        // }
        // Empêcher la suppression si c'est la dernière colonne
        if ($project->columns()->count() <= 1) {
            return response()->json(['error' => 'Impossible de supprimer la dernière colonne du projet'], 409);
        }
        // Si la colonne contient des tâches, les marquer comme terminées
        $tasks = $column->tasks;
        if ($tasks->count() > 0) {
            foreach ($tasks as $task) {
                $task->completed_at = now();
                $task->save();
            }
        }
        $column->delete();
        return response()->json(['message' => 'Colonne supprimée et tâches terminées']);
    }

    // Mettre à jour l'ordre des colonnes (drag & drop)
    public function reorder(Request $request, $projectId)
    {
        $columnIds = $request->input('column_ids'); // tableau d'IDs dans le nouvel ordre
        if (!is_array($columnIds)) {
            return response()->json(['error' => 'Format invalide'], 422);
        }
        foreach ($columnIds as $index => $colId) {
            \App\Models\Column::where('id', $colId)->where('project_id', $projectId)->update(['order' => $index + 1]);
        }
        return response()->json(['message' => 'Ordre des colonnes mis à jour']);
    }
}
