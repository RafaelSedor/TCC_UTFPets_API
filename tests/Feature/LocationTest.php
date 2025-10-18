<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class LocationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->token = Auth::login($this->user) ?? '';
    }

    public function test_user_can_list_locations(): void
    {
        // O UserObserver cria 1 location padrão automaticamente ao criar o usuário
        // Então criamos apenas 2 locations adicionais para ter um total de 3
        Location::factory()->count(2)->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/v1/locations');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_user_can_create_location(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/v1/locations', [
            'name' => 'Casa',
            'description' => 'Minha casa',
            'timezone' => 'America/Sao_Paulo'
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'message' => 'Local criado com sucesso'
            ]);

        $this->assertDatabaseHas('locations', [
            'user_id' => $this->user->id,
            'name' => 'Casa',
            'description' => 'Minha casa'
        ]);
    }

    public function test_user_cannot_create_duplicate_location_name(): void
    {
        Location::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Casa'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/v1/locations', [
            'name' => 'Casa',
            'description' => 'Outra casa'
        ]);

        $response->assertStatus(500); // Violação de unique constraint
    }

    public function test_user_can_view_location(): void
    {
        $location = Location::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $location->id)
            ->assertJsonPath('name', $location->name);
    }

    public function test_user_cannot_view_others_location(): void
    {
        $otherUser = User::factory()->create();
        $location = Location::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_update_location(): void
    {
        $location = Location::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/v1/locations/{$location->id}", [
            'name' => 'Casa Atualizada',
            'description' => 'Nova descrição'
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Local atualizado com sucesso'
            ]);

        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'name' => 'Casa Atualizada',
            'description' => 'Nova descrição'
        ]);
    }

    public function test_user_cannot_update_others_location(): void
    {
        $otherUser = User::factory()->create();
        $location = Location::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/v1/locations/{$location->id}", [
            'name' => 'Tentativa de Atualização'
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_delete_empty_location(): void
    {
        $location = Location::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('locations', [
            'id' => $location->id
        ]);
    }

    public function test_user_cannot_delete_location_with_pets(): void
    {
        $location = Location::factory()->create(['user_id' => $this->user->id]);
        Pet::factory()->create([
            'user_id' => $this->user->id,
            'location_id' => $location->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'error' => 'Não é possível remover um local com pets vinculados. Remova ou transfira os pets primeiro.'
            ]);

        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'deleted_at' => null
        ]);
    }

    public function test_user_cannot_delete_others_location(): void
    {
        $otherUser = User::factory()->create();
        $location = Location::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(403);
    }

    public function test_pet_can_be_assigned_to_location(): void
    {
        $location = Location::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/v1/pets', [
            'name' => 'Buddy',
            'species' => 'Cachorro',
            'breed' => 'Golden Retriever',
            'birth_date' => '2020-01-01',
            'weight' => 30,
            'location_id' => $location->id
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('pets', [
            'name' => 'Buddy',
            'location_id' => $location->id
        ]);
    }

    public function test_pet_cannot_be_assigned_to_others_location(): void
    {
        $otherUser = User::factory()->create();
        $location = Location::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/v1/pets', [
            'name' => 'Buddy',
            'species' => 'Cachorro',
            'breed' => 'Golden Retriever',
            'birth_date' => '2020-01-01',
            'weight' => 30,
            'location_id' => $location->id
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['location_id']);
    }

    public function test_user_can_filter_pets_by_location(): void
    {
        $location1 = Location::factory()->create(['user_id' => $this->user->id, 'name' => 'Casa']);
        $location2 = Location::factory()->create(['user_id' => $this->user->id, 'name' => 'Fazenda']);

        Pet::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'location_id' => $location1->id
        ]);

        Pet::factory()->create([
            'user_id' => $this->user->id,
            'location_id' => $location2->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/pets?location_id={$location1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_location_includes_pets_count(): void
    {
        $location = Location::factory()->create(['user_id' => $this->user->id]);
        Pet::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'location_id' => $location->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(200)
            ->assertJsonPath('pets_count', 5)
            ->assertJsonCount(5, 'pets');
    }
}

