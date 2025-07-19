<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        // Récupérer les projets de l'utilisateur connecté
        $projects = Project::where('creator_id', Auth::id())
            ->orWhereHas('members', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->with('members')
            ->get();

        return view('dashboard', compact('projects'));
    }

    public function showProject($projectId)
    {
        $project = Project::findOrFail($projectId);
        
        // Vérifier que l'utilisateur a accès au projet
        if ($project->creator_id !== Auth::id() && !$project->members->contains(Auth::id())) {
            abort(403, 'Accès non autorisé');
        }

        // Récupérer les colonnes avec leurs tâches
        $columns = $project->columns()->with(['tasks' => function ($query) {
            $query->with('users');
        }])->get();

        // Ajouter les classes CSS et labels pour les priorités
        $columns->each(function ($column) {
            $column->tasks->each(function ($task) {
                $task->priority_class = $this->getPriorityClass($task->priority);
                $task->priority_label = $this->getPriorityLabel($task->priority);
            });
        });

        return view('dashboard', compact('project', 'columns'));
    }

    private function getPriorityClass($priority)
    {
        $classes = [
            'low' => 'bg-green-100 text-green-800',
            'medium' => 'bg-yellow-100 text-yellow-800',
            'high' => 'bg-red-100 text-red-800'
        ];
        return $classes[$priority] ?? $classes['medium'];
    }

    private function getPriorityLabel($priority)
    {
        $labels = [
            'low' => 'Basse',
            'medium' => 'Moyenne',
            'high' => 'Haute'
        ];
        return $labels[$priority] ?? 'Moyenne';
    }
} 