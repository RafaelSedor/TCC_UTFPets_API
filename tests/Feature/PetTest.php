<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PetTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->token = Auth::login($this->user) ?? '';
    }

    public function test_user_can_list_pets(): void
    {
        Pet::factory()->count(3)->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/v1/pets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data' => [
                    '*' => [
                        'id',
                        'user_id',
                        'name',
                        'species',
                        'breed',
                        'birth_date',
                        'weight',
                        'photo',
                        'notes',
                        'created_at',
                        'updated_at'
                    ]
                ],
                'first_page_url',
                'from',
                'last_page',
                'last_page_url',
                'links',
                'next_page_url',
                'path',
                'per_page',
                'prev_page_url',
                'to',
                'total'
            ])
            ->assertJsonPath('total', 3);
    }

    public function test_user_can_create_pet(): void
    {
        Storage::fake('local');
        $file = UploadedFile::fake()->image('pet.jpg');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/v1/pets', [
            'name' => 'Rex',
            'species' => 'Cachorro',
            'breed' => 'Labrador',
            'birth_date' => '2020-01-01',
            'weight' => 25.5,
            'photo' => $file,
            'notes' => 'Cachorro muito dócil'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('pet.name', 'Rex')
            ->assertJsonPath('pet.species', 'Cachorro')
            ->assertJsonPath('pet.breed', 'Labrador')
            ->assertJsonPath('pet.weight', 25.5)
            ->assertJsonPath('pet.notes', 'Cachorro muito dócil');

        $this->assertDatabaseHas('pets', [
            'name' => 'Rex',
            'user_id' => $this->user->id
        ]);
    }

    public function test_user_can_view_pet(): void
    {
        $pet = Pet::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/pets/{$pet->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $pet->id,
                'user_id' => $this->user->id,
                'name' => $pet->name
            ]);
    }

    public function test_user_can_update_pet(): void
    {
        $pet = Pet::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/pets/{$pet->id}", [
            'name' => 'Updated Name',
            'weight' => 30.5
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('pet.id', $pet->id)
            ->assertJsonPath('pet.name', 'Updated Name')
            ->assertJsonPath('pet.weight', 30.5);

        $this->assertDatabaseHas('pets', [
            'id' => $pet->id,
            'name' => 'Updated Name',
            'weight' => 30.5
        ]);
    }

    public function test_user_can_delete_pet(): void
    {
        $pet = Pet::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/pets/{$pet->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('pets', [
            'id' => $pet->id
        ]);
    }

    public function test_user_cannot_access_others_pets(): void
    {
        $otherUser = User::factory()->create();
        $pet = Pet::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/pets/{$pet->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_update_pet_with_image(): void
    {
        Storage::fake('local');
        $pet = Pet::factory()->create([
            'user_id' => $this->user->id,
            'photo' => 'old_photo.jpg'
        ]);
        $file = UploadedFile::fake()->image('new_pet.jpg');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->post(
            "/api/v1/pets/{$pet->id}",
            [
                'name' => 'Pet com nova foto',
                'photo' => $file
            ]
        );

        $response->assertStatus(200)
            ->assertJsonPath('pet.id', $pet->id)
            ->assertJsonPath('pet.name', 'Pet com nova foto')
            ->assertJsonPath('pet.photo', fn($value) => $value !== 'old_photo.jpg' && !empty($value));
    }
} 