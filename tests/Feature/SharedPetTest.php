<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Pet;
use App\Models\SharedPet;
use App\Models\Meal;
use App\Enums\SharedPetRole;
use App\Enums\InvitationStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class SharedPetTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $editor;
    private User $viewer;
    private Pet $pet;
    private string $ownerToken;
    private string $editorToken;
    private string $viewerToken;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->owner = User::factory()->create();
        $this->editor = User::factory()->create();
        $this->viewer = User::factory()->create();
        $this->pet = Pet::factory()->create(['user_id' => $this->owner->id]);
        
        // Gera tokens JWT
        $this->ownerToken = Auth::login($this->owner) ?? '';
        $this->editorToken = Auth::login($this->editor) ?? '';
        $this->viewerToken = Auth::login($this->viewer) ?? '';
    }

    /** @test */
    public function owner_can_invite_user_to_share_pet()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/share", [
            'user_id' => $this->editor->id,
            'role' => 'editor',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Convite enviado com sucesso.',
                'data' => [
                    'user_id' => $this->editor->id,
                    'role' => 'editor',
                    'invitation_status' => 'pending',
                ],
            ]);

        $this->assertDatabaseHas('shared_pets', [
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => 'editor',
            'invitation_status' => 'pending',
        ]);
    }

    /** @test */
    public function can_invite_by_email()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/share", [
            'email' => $this->editor->email,
            'role' => 'editor',
        ]);

        $response->assertStatus(201);
    }

    /** @test */
    public function cannot_create_duplicate_invitation()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/share", [
            'user_id' => $this->editor->id,
            'role' => 'editor',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Este usuário já tem acesso a este pet.',
            ]);
    }

    /** @test */
    public function user_can_accept_invitation()
    {
        $shared = SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->editorToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/share/{$this->editor->id}/accept");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Convite aceito com sucesso.',
            ]);

        $this->assertDatabaseHas('shared_pets', [
            'id' => $shared->id,
            'invitation_status' => 'accepted',
        ]);
    }

    /** @test */
    public function only_invited_user_can_accept()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->viewerToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/share/{$this->editor->id}/accept");

        $response->assertStatus(403);
    }

    /** @test */
    public function owner_can_change_role()
    {
        $shared = SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->patchJson("/api/v1/pets/{$this->pet->id}/share/{$this->editor->id}", [
            'role' => 'viewer',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('shared_pets', [
            'id' => $shared->id,
            'role' => 'viewer',
        ]);
    }

    /** @test */
    public function non_owner_cannot_change_role()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->editorToken
        ])->patchJson("/api/v1/pets/{$this->pet->id}/share/{$this->editor->id}", [
            'role' => 'viewer',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function owner_can_revoke_access()
    {
        $shared = SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->deleteJson("/api/v1/pets/{$this->pet->id}/share/{$this->editor->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('shared_pets', [
            'id' => $shared->id,
        ]);
    }

    /** @test */
    public function editor_can_create_meals()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->editorToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/meals", [
            'food_type' => 'Ração Premium',
            'quantity' => 100,
            'unit' => 'g',
            'scheduled_for' => now()->addHours(2)->format('Y-m-d H:i:s'),
        ]);

        $response->assertStatus(201);
    }

    /** @test */
    public function viewer_cannot_create_meals()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->viewer->id,
            'role' => SharedPetRole::VIEWER,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->viewerToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/meals", [
            'food_type' => 'Ração Premium',
            'quantity' => 100,
            'unit' => 'g',
            'scheduled_for' => now()->addHours(2)->format('Y-m-d H:i:s'),
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function viewer_can_view_pet()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->viewer->id,
            'role' => SharedPetRole::VIEWER,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->viewerToken
        ])->getJson("/api/v1/pets/{$this->pet->id}");

        $response->assertStatus(200);
    }

    /** @test */
    public function editor_cannot_delete_pet()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->editorToken
        ])->deleteJson("/api/v1/pets/{$this->pet->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function only_owner_can_manage_sharing()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->editorToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/share", [
            'user_id' => $this->viewer->id,
            'role' => 'viewer',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function can_list_all_participants()
    {
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id,
        ]);

        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->viewer->id,
            'role' => SharedPetRole::VIEWER,
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => $this->owner->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->getJson("/api/v1/pets/{$this->pet->id}/share");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}

