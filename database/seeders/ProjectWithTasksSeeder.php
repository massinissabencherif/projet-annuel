<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class ProjectWithTasksSeeder extends Seeder
{
    public function run()
    {
        $user = User::firstOrCreate(
            ['email' => 'massibencherif@gmail.com'],
            [
                'name' => 'Massi Bencherif',
                'password' => bcrypt('password')
            ]
        );
        Project::factory(10)->create(['creator_id' => $user->id, 'is_seeded' => true])->each(function ($project) use ($user) {
            $project->members()->syncWithoutDetaching([$user->id]);
            // Créer les colonnes par défaut pour chaque projet
            $defaultColumns = [
                ['name' => 'À faire', 'is_terminal' => false, 'order' => 1],
                ['name' => 'En cours', 'is_terminal' => false, 'order' => 2],
                ['name' => 'Terminé', 'is_terminal' => true, 'order' => 3],
                ['name' => 'Annulé', 'is_terminal' => false, 'order' => 4],
            ];
            foreach ($defaultColumns as $columnData) {
                $project->columns()->create($columnData);
            }
            $columns = $project->columns()->pluck('id')->toArray();
            Task::factory(rand(3, 7))->create([
                'project_id' => $project->id,
                'column_id' => function() use ($columns) {
                    return $columns[array_rand($columns)];
                }
            ]);
        });
    }
} 