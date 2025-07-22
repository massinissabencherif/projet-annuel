<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AssignProjectCreatorsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer le premier utilisateur (ou créer un utilisateur par défaut)
        $user = User::first();
        
        if (!$user) {
            // Créer un utilisateur par défaut si aucun n'existe
            $user = User::create([
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Pour chaque projet, s'assurer qu'il a un créateur
        Project::chunk(100, function ($projects) use ($user) {
            foreach ($projects as $project) {
                // Vérifier si le projet a déjà des membres
                $existingMembers = DB::table('project_user')
                    ->where('project_id', $project->id)
                    ->get();

                if ($existingMembers->isEmpty()) {
                    // Aucun membre, ajouter l'utilisateur comme créateur
                    DB::table('project_user')->insert([
                        'project_id' => $project->id,
                        'user_id' => $user->id,
                        'is_creator' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    // Le projet a des membres, s'assurer qu'au moins un est créateur
                    $hasCreator = $existingMembers->where('is_creator', true)->count() > 0;
                    
                    if (!$hasCreator) {
                        // Aucun créateur, en désigner un
                        DB::table('project_user')
                            ->where('project_id', $project->id)
                            ->where('user_id', $existingMembers->first()->user_id)
                            ->update(['is_creator' => true]);
                    }
                }
            }
        });

        $this->command->info('Créateurs assignés aux projets avec succès !');
    }
}
