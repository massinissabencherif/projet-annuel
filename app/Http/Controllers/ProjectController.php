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
        $userId = Auth::id();
        if (!$userId) {
            $projects = Project::where('is_seeded', true)->with('members')->get();
        } else {
            $projects = Project::where('creator_id', $userId)
                ->orWhereHas('members', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->orWhere('is_seeded', true)
                ->with('members')
                ->get();
        }
        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $validated = $request->validated();
        
        // Utiliser l'utilisateur connecté comme créateur
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'creator_id' => $user->id,
        ]);

        // Créer les colonnes par défaut pour le projet
        $defaultColumns = [
            ['name' => 'À faire', 'is_terminal' => false, 'order' => 1],
            ['name' => 'En cours', 'is_terminal' => false, 'order' => 2],
            ['name' => 'Terminé', 'is_terminal' => true, 'order' => 3],
            ['name' => 'Annulé', 'is_terminal' => false, 'order' => 4],
        ];
        foreach ($defaultColumns as $columnData) {
            $project->columns()->create($columnData);
        }

        // Ajouter le créateur comme membre avec le statut is_creator = true
        $project->users()->attach($user->id, [
            'is_creator' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json($project, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        if (!$project->is_seeded && $project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
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
        $userId = Auth::id();
        if (!$project->is_seeded && $userId && $project->creator_id !== $userId && !$project->members->contains($userId)) {
            abort(403, 'Accès non autorisé');
        }

        $columns = $project->columns()->with(['tasks' => function ($query) {
            $query->with('users');
        }])->orderBy('order')->get();

        return response()->json($columns);
    }

    /**
     * Get tasks for a specific project.
     */
    public function tasks(Project $project)
    {
        $userId = Auth::id();
        if (!$project->is_seeded && $userId && $project->creator_id !== $userId && !$project->members->contains($userId)) {
            abort(403, 'Accès non autorisé');
        }

        $tasks = $project->tasks()->with(['users', 'column', 'labels'])->get();

        return response()->json($tasks);
    }

    /**
     * Exporter les tâches d'un projet au format iCal
     */
    public function exportICal(Project $project)
    {
        $userId = Auth::id();
        if (!$project->is_seeded && $userId && $project->creator_id !== $userId && !$project->members->contains($userId)) {
            abort(403, 'Accès non autorisé');
        }

        $tasks = $project->tasks()->get();
        $ical = [];
        $ical[] = 'BEGIN:VCALENDAR';
        $ical[] = 'VERSION:2.0';
        $ical[] = 'PRODID:-//KanbanApp//EN';
        foreach ($tasks as $task) {
            $ical[] = 'BEGIN:VEVENT';
            $ical[] = 'UID:task-' . $task->id . '@kanban';
            $ical[] = 'SUMMARY:' . addcslashes($task->title, ",;\\");
            if ($task->description) {
                $ical[] = 'DESCRIPTION:' . addcslashes($task->description, ",;\\");
            }
            if ($task->due_date) {
                $ical[] = 'DTSTART;VALUE=DATE:' . date('Ymd', strtotime($task->due_date));
                $ical[] = 'DTEND;VALUE=DATE:' . date('Ymd', strtotime($task->due_date));
            }
            $ical[] = 'END:VEVENT';
        }
        $ical[] = 'END:VCALENDAR';
        $icalContent = implode("\r\n", $ical);
        return response($icalContent, 200)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="project-' . $project->id . '-tasks.ics"');
    }

    /**
     * Statistiques sur un projet
     */
    public function stats(Project $project)
    {
        $userId = Auth::id();
        if (!$project->is_seeded && $userId && $project->creator_id !== $userId && !$project->members->contains($userId)) {
            abort(403, 'Accès non autorisé');
        }

        $tasks = $project->tasks()->with('users')->get();
        $members = $project->members;

        // Nombre total de tâches
        $totalTasks = $tasks->count();
        // Tâches terminées (completed_at non null)
        $completedTasks = $tasks->whereNotNull('completed_at');
        $nbCompleted = $completedTasks->count();
        // Temps moyen de complétion (en jours)
        $avgCompletionTime = null;
        if ($nbCompleted > 0) {
            $avgCompletionTime = $completedTasks->map(function($task) {
                return ($task->completed_at && $task->created_at) ? (strtotime($task->completed_at) - strtotime($task->created_at)) / 86400 : null;
            })->filter()->avg();
        }
        // Nombre moyen de tâches accomplies par membre
        $tasksByMember = [];
        foreach ($members as $member) {
            $tasksByMember[$member->id] = [
                'name' => $member->name,
                'completed' => $completedTasks->filter(function($task) use ($member) {
                    return $task->users->contains('id', $member->id);
                })->count()
            ];
        }
        // Répartition des tâches par catégories
        $categories = $tasks->groupBy('category')->map(function($group) {
            return $group->count();
        });
        // Nombre de tâches en cours (non terminées)
        $inProgress = $tasks->whereNull('completed_at')->count();

        return response()->json([
            'total_tasks' => $totalTasks,
            'completed_tasks' => $nbCompleted,
            'in_progress_tasks' => $inProgress,
            'avg_completion_time_days' => $avgCompletionTime,
            'tasks_by_member' => array_values($tasksByMember),
            'categories' => $categories,
        ]);
    }
}
