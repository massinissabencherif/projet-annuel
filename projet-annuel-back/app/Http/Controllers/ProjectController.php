<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Retourne les projets de l'utilisateur connecté
        $projects = Project::where('creator_id', Auth::id())
            ->orWhereHas('members', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->with('members')
            ->get();
        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $validated = $request->validated();
        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'creator_id' => Auth::id(),
        ]);
        return response()->json($project, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        // Vérifier que l'utilisateur a accès au projet
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            abort(403, 'Accès non autorisé');
        }

        $project->load('members');
        return response()->json($project);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        // Vérifier que l'utilisateur est le créateur du projet
        if ($project->creator_id !== Auth::id()) {
            abort(403, 'Accès non autorisé');
        }

        $validated = $request->validated();
        $project->update($validated);
        return response()->json($project);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        // Vérifier que l'utilisateur est le créateur du projet
        if ($project->creator_id !== Auth::id()) {
            abort(403, 'Accès non autorisé');
        }

        $project->delete();
        return response()->json(['message' => 'Projet supprimé']);
    }

    /**
     * Get columns for a specific project.
     */
    public function columns(Project $project)
    {
        // Vérifier que l'utilisateur a accès au projet
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            abort(403, 'Accès non autorisé');
        }

        $columns = $project->columns()->with(['tasks' => function ($query) {
            $query->with('users');
        }])->get();

        return response()->json($columns);
    }

    /**
     * Get tasks for a specific project.
     */
    public function tasks(Project $project)
    {
        // Vérifier que l'utilisateur a accès au projet
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            abort(403, 'Accès non autorisé');
        }

        $tasks = $project->tasks()->with(['users', 'column'])->get();

        return response()->json($tasks);
    }
}
