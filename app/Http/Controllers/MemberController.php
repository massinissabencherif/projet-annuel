<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
use App\Http\Requests\StoreMemberRequest;

class MemberController extends Controller
{
    // Lister les membres d'un projet
    public function index($projectId)
    {
        $project = Project::findOrFail($projectId);
        $members = $project->members;
        return response()->json($members);
    }

    // Ajouter un membre par email
    public function store(StoreMemberRequest $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        $validated = $request->validated();
        $user = User::where('email', $validated['email'])->first();
        if ($project->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Déjà membre'], 409);
        }
        $project->members()->attach($user->id);
        return response()->json(['message' => 'Membre ajouté']);
    }

    // Retirer un membre
    public function destroy($projectId, $userId)
    {
        $project = Project::findOrFail($projectId);
        if ($project->creator_id == $userId) {
            return response()->json(['error' => 'Impossible de retirer le créateur'], 403);
        }
        $project->members()->detach($userId);
        return response()->json(['message' => 'Membre retiré']);
    }
}
