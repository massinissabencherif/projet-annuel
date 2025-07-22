<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ProjectAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $projectId = $request->route('project') ?? $request->input('project_id');
        
        if (!$projectId) {
            return response()->json(['error' => 'Projet non spécifié'], 400);
        }

        $project = Project::find($projectId);
        
        if (!$project) {
            return response()->json(['error' => 'Projet non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est le créateur ou un membre du projet
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        return $next($request);
    }
}
