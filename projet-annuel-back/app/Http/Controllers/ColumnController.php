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
        // Vérifie que l'utilisateur est membre du projet
        $project = Project::findOrFail($validated['project_id']);
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }
        $column = Column::create($validated);
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
        // Seul le créateur du projet peut supprimer la colonne
        if ($column->project->creator_id !== Auth::id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }
        // Vérifier qu'il n'y a pas de tâches dans cette colonne
        if ($column->tasks()->count() > 0) {
            return response()->json(['error' => 'Impossible de supprimer une colonne contenant des tâches'], 409);
        }
        $column->delete();
        return response()->json(['message' => 'Colonne supprimée']);
    }
}
