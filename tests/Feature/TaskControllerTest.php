<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private Project $project;
    private Column $column;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['creator_id' => $this->user->id]);
        $this->column = Column::factory()->create(['project_id' => $this->project->id]);
    }

    public function test_user_can_create_task(): void
    {
        $this->actingAs($this->user);

        $taskData = [
            'project_id' => $this->project->id,
            'column_id' => $this->column->id,
            'title' => 'Ma Tâche Test',
            'description' => 'Description de la tâche',
            'priority' => 'medium',
            'category' => 'Développement'
        ];

        $response = $this->postJson('/tasks', $taskData);

        $response->assertStatus(201)
                ->assertJsonStructure(['id', 'title', 'description', 'priority', 'project_id', 'column_id']);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Ma Tâche Test',
            'project_id' => $this->project->id
        ]);
    }

    public function test_user_can_view_tasks(): void
    {
        $this->actingAs($this->user);
        
        Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

        $response = $this->getJson('/tasks');

        $response->assertStatus(200);
    }

    public function test_user_can_view_specific_task(): void
    {
        $this->actingAs($this->user);
        
        $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

        $response = $this->getJson("/tasks/{$task->id}");

        $response->assertStatus(200)
                ->assertJson(['id' => $task->id, 'title' => $task->title]);
    }

    public function test_user_can_update_task(): void
    {
        $this->actingAs($this->user);
        
        $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

        $updateData = ['title' => 'Tâche Modifiée'];

        $response = $this->putJson("/tasks/{$task->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson(['title' => 'Tâche Modifiée']);
    }

    public function test_user_can_move_task(): void
    {
        $this->actingAs($this->user);
        
        $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);
        $newColumn = Column::factory()->create(['project_id' => $this->project->id]);

        $moveData = ['column_id' => $newColumn->id];

        $response = $this->patchJson("/tasks/{$task->id}/move", $moveData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'column_id' => $newColumn->id
        ]);
    }

    public function test_user_can_assign_users_to_task(): void
    {
        $this->actingAs($this->user);
        
        $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);
        $userToAssign = User::factory()->create();

        $assignData = ['user_ids' => [$userToAssign->id]];

        $response = $this->postJson("/tasks/{$task->id}/assign", $assignData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('task_user', [
            'task_id' => $task->id,
            'user_id' => $userToAssign->id
        ]);
    }

    public function test_user_can_delete_task(): void
    {
        $this->actingAs($this->user);
        
        $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

        $response = $this->deleteJson("/tasks/{$task->id}");

        $response->assertStatus(200)
                ->assertJson(['message' => 'Tâche supprimée']);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_validation_requires_priority(): void
    {
        $this->actingAs($this->user);

        $taskData = [
            'project_id' => $this->project->id,
            'column_id' => $this->column->id,
            'title' => 'Ma Tâche Test',
            'priority' => 'invalid_priority'
        ];

        $response = $this->postJson('/tasks', $taskData);

        $response->assertStatus(422);
    }
}
