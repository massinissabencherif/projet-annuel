<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Project;
use App\Models\Column;
use App\Models\Task;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crée 5 utilisateurs
        User::factory(5)->create()->each(function ($user) {
            // Pour chaque utilisateur, crée 2 projets
            Project::factory(2)->create(['creator_id' => $user->id, 'is_seeded' => true])->each(function ($project) use ($user) {
                // Pour chaque projet, crée 3 colonnes
                $columns = Column::factory(3)->create(['project_id' => $project->id]);
                // Pour chaque projet, crée 5 tâches
                Task::factory(5)->create([
                    'project_id' => $project->id,
                    // Associe chaque tâche à une colonne aléatoire du projet
                    'column_id' => $columns->random()->id,
                ])->each(function ($task) use ($user) {
                    // Associe 1 à 3 utilisateurs aléatoires à chaque tâche
                    $userIds = User::inRandomOrder()->take(rand(1, 3))->pluck('id');
                    $task->users()->attach($userIds);
                });
            });
        });
    }
}
