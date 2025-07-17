<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_create_project(): void
    {
        $this->actingAs($this->user);

        $projectData = [
            'name' => 'Mon Projet Test'
        ];

        $response = $this->postJson('/projects', $projectData);

        $response->assertStatus(201)
                ->assertJsonStructure(['id', 'name', 'creator_id', 'created_at', 'updated_at']);

        $this->assertDatabaseHas('projects', [
            'name' => 'Mon Projet Test',
            'creator_id' => $this->user->id
        ]);
    }

    public function test_user_can_view_own_projects(): void
    {
        $this->actingAs($this->user);
        
        Project::factory()->create(['creator_id' => $this->user->id]);
        Project::factory()->create(['creator_id' => $this->user->id]);

        $response = $this->getJson('/projects');

        $response->assertStatus(200)
                ->assertJsonCount(2);
    }

    public function test_user_can_view_specific_project(): void
    {
        $this->actingAs($this->user);
        
        $project = Project::factory()->create(['creator_id' => $this->user->id]);

        $response = $this->getJson("/projects/{$project->id}");

        $response->assertStatus(200)
                ->assertJson(['id' => $project->id, 'name' => $project->name]);
    }

    public function test_user_can_update_own_project(): void
    {
        $this->actingAs($this->user);
        
        $project = Project::factory()->create(['creator_id' => $this->user->id]);

        $updateData = ['name' => 'Projet Modifié'];

        $response = $this->putJson("/projects/{$project->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson(['name' => 'Projet Modifié']);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Projet Modifié'
        ]);
    }

    public function test_user_cannot_update_other_user_project(): void
    {
        $this->actingAs($this->user);
        
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $otherUser->id]);

        $updateData = ['name' => 'Projet Modifié'];

        $response = $this->putJson("/projects/{$project->id}", $updateData);

        $response->assertStatus(404);
    }

    public function test_user_can_delete_own_project(): void
    {
        $this->actingAs($this->user);
        
        $project = Project::factory()->create(['creator_id' => $this->user->id]);

        $response = $this->deleteJson("/projects/{$project->id}");

        $response->assertStatus(200)
                ->assertJson(['message' => 'Projet supprimé']);

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_user_cannot_delete_other_user_project(): void
    {
        $this->actingAs($this->user);
        
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $otherUser->id]);

        $response = $this->deleteJson("/projects/{$project->id}");

        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_projects(): void
    {
        $response = $this->getJson('/projects');
        $response->assertStatus(401);
    }
}
