<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Pet;
use App\Models\User;
use App\Models\Meal;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MealTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Pet $pet;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->token = $this->getToken($this->user);
        $this->pet = Pet::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_user_can_list_meals(): void
    {
        Meal::factory()->count(3)->create([
            'pet_id' => $this->pet->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/pets/{$this->pet->id}/meals");

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'pet_id',
                    'food_type',
                    'quantity',
                    'unit',
                    'scheduled_for',
                    'consumed_at',
                    'notes',
                    'created_at',
                    'updated_at'
                ]
            ]);
    }

    public function test_user_can_create_meal(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/pets/{$this->pet->id}/meals", [
            'food_type' => 'Ração Premium',
            'quantity' => 100.5,
            'unit' => 'g',
            'scheduled_for' => '2024-03-21T08:00:00.000000Z',
            'notes' => 'Refeição da manhã'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('food_type', 'Ração Premium')
            ->assertJsonPath('quantity', 100.5)
            ->assertJsonPath('unit', 'g')
            ->assertJsonPath('scheduled_for', '2024-03-21T08:00:00.000000Z')
            ->assertJsonPath('notes', 'Refeição da manhã');

        $this->assertDatabaseHas('meals', [
            'pet_id' => $this->pet->id,
            'food_type' => 'Ração Premium'
        ]);
    }

    public function test_user_can_mark_meal_as_consumed(): void
    {
        $meal = Meal::factory()->create([
            'pet_id' => $this->pet->id,
            'consumed_at' => null
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/pets/{$this->pet->id}/meals/{$meal->id}/consume");

        $response->assertStatus(200);
        $this->assertNotNull($meal->fresh()->consumed_at);
    }

    public function test_user_cannot_access_others_pets_meals(): void
    {
        $otherUser = User::factory()->create();
        $otherPet = Pet::factory()->create(['user_id' => $otherUser->id]);
        $meal = Meal::factory()->create(['pet_id' => $otherPet->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/pets/{$otherPet->id}/meals/{$meal->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_update_meal(): void
    {
        $meal = Meal::factory()->create([
            'pet_id' => $this->pet->id,
            'scheduled_for' => '2024-03-21T08:00:00.000000Z'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/pets/{$this->pet->id}/meals/{$meal->id}", [
            'food_type' => 'Ração Atualizada',
            'quantity' => 150.0,
            'unit' => 'g',
            'scheduled_for' => '2024-03-21T08:00:00.000000Z'
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('meals', [
            'id' => $meal->id,
            'food_type' => 'Ração Atualizada',
            'quantity' => 150.0
        ]);
    }

    public function test_user_can_delete_meal(): void
    {
        $meal = Meal::factory()->create([
            'pet_id' => $this->pet->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/pets/{$this->pet->id}/meals/{$meal->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('meals', [
            'id' => $meal->id
        ]);
    }
} 