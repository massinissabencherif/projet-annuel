<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ProjectOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $projectId = $request->route('project');
        
        // Si pas de project_id dans la route, essayer de le récupérer depuis la tâche
        if (!$projectId && $request->route('task')) {
            $task = \App\Models\Task::find($request->route('task'));
            if ($task) {
                $projectId = $task->project_id;
            }
        }
        
        if (!$projectId) {
            return response()->json(['error' => 'Projet non spécifié'], 400);
        }

        $project = Project::find($projectId);
        
        if (!$project) {
            return response()->json(['error' => 'Projet non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est le créateur du projet
        if ($project->creator_id !== Auth::id()) {
            return response()->json(['error' => 'Seul le créateur du projet peut effectuer cette action'], 403);
        }

        return $next($request);
    }
}
