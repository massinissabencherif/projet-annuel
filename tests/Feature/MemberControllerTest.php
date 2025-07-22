<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MemberControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $creator;
    private User $member;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->creator = User::factory()->create();
        $this->member = User::factory()->create();
        $this->project = Project::factory()->create(['creator_id' => $this->creator->id]);
    }

    public function test_creator_can_list_project_members(): void
    {
        $this->actingAs($this->creator);

        $response = $this->getJson("/projects/{$this->project->id}/members");

        $response->assertStatus(200);
    }

    public function test_creator_can_add_member_by_email(): void
    {
        $this->actingAs($this->creator);

        $memberData = ['email' => $this->member->email];

        $response = $this->postJson("/projects/{$this->project->id}/members", $memberData);

        $response->assertStatus(200)
                ->assertJson(['message' => 'Membre ajouté']);

        $this->assertDatabaseHas('project_user', [
            'project_id' => $this->project->id,
            'user_id' => $this->member->id
        ]);
    }

    public function test_creator_cannot_add_same_member_twice(): void
    {
        $this->actingAs($this->creator);

        // Ajouter le membre une première fois
        $this->project->members()->attach($this->member->id);

        $memberData = ['email' => $this->member->email];

        $response = $this->postJson("/projects/{$this->project->id}/members", $memberData);

        $response->assertStatus(409)
                ->assertJson(['error' => 'Déjà membre']);
    }

    public function test_creator_can_remove_member(): void
    {
        $this->actingAs($this->creator);

        // Ajouter le membre d'abord
        $this->project->members()->attach($this->member->id);

        $response = $this->deleteJson("/projects/{$this->project->id}/members/{$this->member->id}");

        $response->assertStatus(200)
                ->assertJson(['message' => 'Membre retiré']);

        $this->assertDatabaseMissing('project_user', [
            'project_id' => $this->project->id,
            'user_id' => $this->member->id
        ]);
    }

    public function test_creator_cannot_remove_themselves(): void
    {
        $this->actingAs($this->creator);

        $response = $this->deleteJson("/projects/{$this->project->id}/members/{$this->creator->id}");

        $response->assertStatus(403)
                ->assertJson(['error' => 'Impossible de retirer le créateur']);
    }

    public function test_member_cannot_manage_project_members(): void
    {
        // Ajouter le membre au projet
        $this->project->members()->attach($this->member->id);
        $this->actingAs($this->member);

        $newMember = User::factory()->create();
        $memberData = ['email' => $newMember->email];

        $response = $this->postJson("/projects/{$this->project->id}/members", $memberData);

        $response->assertStatus(403);
    }

    public function test_non_member_cannot_access_project_members(): void
    {
        $otherUser = User::factory()->create();
        $this->actingAs($otherUser);

        $response = $this->getJson("/projects/{$this->project->id}/members");

        $response->assertStatus(403);
    }

    public function test_cannot_add_nonexistent_user(): void
    {
        $this->actingAs($this->creator);

        $memberData = ['email' => 'nonexistent@example.com'];

        $response = $this->postJson("/projects/{$this->project->id}/members", $memberData);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_user_cannot_access_members(): void
    {
        $response = $this->getJson("/projects/{$this->project->id}/members");
        $response->assertStatus(401);
    }
}
