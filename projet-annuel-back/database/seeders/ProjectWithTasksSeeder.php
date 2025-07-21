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
        Project::factory(10)->create(['creator_id' => $user->id])->each(function ($project) use ($user) {
            $project->members()->syncWithoutDetaching([$user->id]);
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