<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectMemberController extends Controller
{
    /**
     * Afficher tous les membres d'un projet
     */
    public function index(Project $project): JsonResponse
    {
        try {
            // Récupérer directement depuis la table pivot pour éviter les problèmes de cache
            $members = \DB::table('project_user')
                ->join('users', 'project_user.user_id', '=', 'users.id')
                ->where('project_user.project_id', $project->id)
                ->select('users.id', 'users.name', 'users.email', 'project_user.is_creator')
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'pivot' => [
                            'is_creator' => (bool) $member->is_creator,
                            'role' => $member->is_creator ? 'admin' : 'member'
                        ]
                    ];
                });

            \Log::info("Membres du projet {$project->id}:", $members->toArray());
            return response()->json($members);
        } catch (\Exception $e) {
            \Log::error("Erreur lors du chargement des membres: " . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du chargement des membres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Inviter un utilisateur par email
     */
    public function invite(Request $request, Project $project): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email'
            ]);

            $email = $request->input('email');
            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Aucun utilisateur trouvé avec cette adresse email'
                ], 404);
            }

            // Vérifier si l'utilisateur est déjà membre du projet
            if ($project->users()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'message' => 'Cet utilisateur est déjà membre du projet'
                ], 400);
            }

            // Ajouter l'utilisateur au projet
            $project->users()->attach($user->id, [
                'is_creator' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'message' => 'Utilisateur invité avec succès',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Adresse email invalide ou utilisateur inexistant',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retirer un membre du projet
     */
    public function remove(Project $project, User $user): JsonResponse
    {
        try {
            // Vérifier si l'utilisateur est membre du projet
            if (!$project->users()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'message' => 'Cet utilisateur n\'est pas membre du projet'
                ], 404);
            }

            // Vérifier si c'est le créateur du projet
            $pivot = $project->users()->where('user_id', $user->id)->first()->pivot;
            if ($pivot->is_creator) {
                return response()->json([
                    'message' => 'Le créateur du projet ne peut pas être retiré'
                ], 400);
            }

            // Retirer l'utilisateur du projet
            $project->users()->detach($user->id);

            return response()->json([
                'message' => 'Membre retiré avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du retrait du membre',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
