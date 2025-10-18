<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Pet;
use App\Models\SharedLocation;
use App\Models\User;
use App\Enums\InvitationStatus;
use App\Enums\SharedPetRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class SharedLocationTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected User $invitedUser;
    protected string $ownerToken;
    protected string $invitedToken;
    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        // Owner da location
        $this->owner = User::factory()->create();
        $this->ownerToken = Auth::login($this->owner) ?? '';

        // Usuário que será convidado
        $this->invitedUser = User::factory()->create();
        $this->invitedToken = Auth::login($this->invitedUser) ?? '';

        // Location com alguns pets
        $this->location = Location::factory()->create(['user_id' => $this->owner->id]);
        Pet::factory()->count(3)->create([
            'user_id' => $this->owner->id,
            'location_id' => $this->location->id
        ]);
    }

    // ========================================
    // Testes de Listagem de Participantes
    // ========================================

    public function test_owner_can_list_location_participants(): void
    {
        // Criar alguns compartilhamentos
        SharedLocation::factory()->count(2)->create([
            'location_id' => $this->location->id,
            'invited_by' => $this->owner->id,
            'invitation_status' => InvitationStatus::ACCEPTED
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->getJson("/api/v1/locations/{$this->location->id}/share");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['user_id', 'name', 'email', 'role', 'invitation_status']
                ],
                'meta' => ['total', 'pets_count']
            ])
            ->assertJsonPath('meta.pets_count', 3);
    }

    public function test_non_owner_cannot_list_participants(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->invitedToken
        ])->getJson("/api/v1/locations/{$this->location->id}/share");

        $response->assertStatus(403);
    }

    // ========================================
    // Testes de Envio de Convite
    // ========================================

    public function test_owner_can_share_location_with_email(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share", [
            'email' => $this->invitedUser->email,
            'role' => 'editor'
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => 'Convite enviado com sucesso. O usuário terá acesso a 3 pet(s) desta location.'])
            ->assertJsonPath('data.user_id', $this->invitedUser->id)
            ->assertJsonPath('data.role', 'editor')
            ->assertJsonPath('data.invitation_status', 'pending')
            ->assertJsonPath('data.pets_count', 3);

        $this->assertDatabaseHas('shared_locations', [
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => $this->owner->id
        ]);
    }

    public function test_owner_can_share_location_with_user_id(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share", [
            'user_id' => $this->invitedUser->id,
            'role' => 'viewer'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.role', 'viewer');

        $this->assertDatabaseHas('shared_locations', [
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::VIEWER
        ]);
    }

    public function test_cannot_share_location_with_owner_role(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share", [
            'email' => $this->invitedUser->email,
            'role' => 'owner'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_cannot_share_location_with_self(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share", [
            'email' => $this->owner->email,
            'role' => 'editor'
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'O dono da location não pode ser convidado para compartilhar.']);
    }

    public function test_cannot_share_location_twice_with_same_user(): void
    {
        // Primeiro compartilhamento
        SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => $this->owner->id
        ]);

        // Tentar compartilhar novamente
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share", [
            'email' => $this->invitedUser->email,
            'role' => 'viewer'
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Este usuário já tem acesso a esta location.']);
    }

    public function test_non_owner_cannot_share_location(): void
    {
        $thirdUser = User::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->invitedToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share", [
            'email' => $thirdUser->email,
            'role' => 'editor'
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_share_nonexistent_user(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share", [
            'email' => 'naoexiste@example.com',
            'role' => 'editor'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ========================================
    // Testes de Aceitação de Convite
    // ========================================

    public function test_invited_user_can_accept_invitation(): void
    {
        $sharedLocation = SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => $this->owner->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->invitedToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share/{$this->invitedUser->id}/accept");

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Convite aceito com sucesso. Você agora tem acesso a 3 pet(s).'])
            ->assertJsonPath('data.invitation_status', 'accepted')
            ->assertJsonPath('data.pets_count', 3);

        $this->assertDatabaseHas('shared_locations', [
            'id' => $sharedLocation->id,
            'invitation_status' => InvitationStatus::ACCEPTED
        ]);
    }

    public function test_only_invited_user_can_accept_their_invitation(): void
    {
        SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => $this->owner->id
        ]);

        // Owner tentando aceitar em nome do convidado
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share/{$this->invitedUser->id}/accept");

        $response->assertStatus(403);
    }

    public function test_cannot_accept_already_accepted_invitation(): void
    {
        SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->invitedToken
        ])->postJson("/api/v1/locations/{$this->location->id}/share/{$this->invitedUser->id}/accept");

        $response->assertStatus(404);
    }

    // ========================================
    // Testes de Alteração de Papel
    // ========================================

    public function test_owner_can_change_participant_role(): void
    {
        $sharedLocation = SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->patchJson("/api/v1/locations/{$this->location->id}/share/{$this->invitedUser->id}", [
            'role' => 'viewer'
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Papel atualizado com sucesso.'])
            ->assertJsonPath('data.role', 'viewer')
            ->assertJsonPath('data.previous_role', 'editor');

        $this->assertDatabaseHas('shared_locations', [
            'id' => $sharedLocation->id,
            'role' => SharedPetRole::VIEWER
        ]);
    }

    public function test_non_owner_cannot_change_role(): void
    {
        SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        $thirdUser = User::factory()->create();
        $thirdToken = Auth::login($thirdUser) ?? '';

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $thirdToken
        ])->patchJson("/api/v1/locations/{$this->location->id}/share/{$this->invitedUser->id}", [
            'role' => 'viewer'
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_change_role_to_owner(): void
    {
        SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::VIEWER,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->patchJson("/api/v1/locations/{$this->location->id}/share/{$this->invitedUser->id}", [
            'role' => 'owner'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    // ========================================
    // Testes de Revogação de Acesso
    // ========================================

    public function test_owner_can_revoke_access(): void
    {
        $sharedLocation = SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->ownerToken
        ])->deleteJson("/api/v1/locations/{$this->location->id}/share/{$this->invitedUser->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Acesso revogado com sucesso.']);

        $this->assertDatabaseMissing('shared_locations', [
            'id' => $sharedLocation->id
        ]);
    }

    public function test_non_owner_cannot_revoke_access(): void
    {
        SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->invitedToken
        ])->deleteJson("/api/v1/locations/{$this->location->id}/share/{$this->invitedUser->id}");

        $response->assertStatus(403);
    }

    // ========================================
    // Testes de Hierarquia de Permissões
    // ========================================

    public function test_shared_location_gives_access_to_all_pets(): void
    {
        // Compartilha location com usuário como editor
        SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        // Pega todos os pets da location
        $pets = Pet::where('location_id', $this->location->id)->get();

        // Verifica se o usuário convidado tem acesso a todos os pets
        foreach ($pets as $pet) {
            $this->assertTrue($pet->hasAccess($this->invitedUser));
            $this->assertEquals(SharedPetRole::EDITOR, $pet->getUserRole($this->invitedUser));
        }
    }

    public function test_new_pets_added_to_location_are_automatically_shared(): void
    {
        // Compartilha location
        SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::VIEWER,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        // Adiciona novo pet à location
        $newPet = Pet::factory()->create([
            'user_id' => $this->owner->id,
            'location_id' => $this->location->id
        ]);

        // Verifica se o usuário convidado automaticamente tem acesso ao novo pet
        $this->assertTrue($newPet->hasAccess($this->invitedUser));
        $this->assertEquals(SharedPetRole::VIEWER, $newPet->getUserRole($this->invitedUser));
    }

    public function test_revoking_location_access_removes_access_to_all_pets(): void
    {
        // Compartilha location
        $sharedLocation = SharedLocation::create([
            'location_id' => $this->location->id,
            'user_id' => $this->invitedUser->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->owner->id
        ]);

        $pets = Pet::where('location_id', $this->location->id)->get();

        // Verifica que tem acesso antes
        foreach ($pets as $pet) {
            $this->assertTrue($pet->hasAccess($this->invitedUser));
        }

        // Revoga acesso
        $sharedLocation->delete();

        // Recarrega os pets
        $pets = Pet::where('location_id', $this->location->id)->get();

        // Verifica que não tem mais acesso
        foreach ($pets as $pet) {
            $this->assertFalse($pet->hasAccess($this->invitedUser));
            $this->assertNull($pet->getUserRole($this->invitedUser));
        }
    }
}
