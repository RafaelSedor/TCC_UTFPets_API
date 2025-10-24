<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

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

        // Mock Cloudinary para testes
        Cloudinary::shouldReceive('upload')
            ->andReturn((object) ['secure_url' => 'https://example.com/test-image.jpg']);
    }

    public function test_a_warmup(): void
    {
        // Teste dummy para "aquecer" o sistema
        $this->assertTrue(true);
    }

    public function test_user_can_list_pets(): void
    {
        // Criar 3 pets para testar a listagem
        Pet::factory()->count(3)->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/v1/pets');

        $response->assertStatus(200)
            ->assertJsonStructure([
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
            ]);
    }

    public function test_user_can_create_pet(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/v1/pets', [
            'name' => 'Rex',
            'species' => 'Cachorro',
            'breed' => 'Labrador',
            'birth_date' => '2020-01-01',
            'weight' => 25.5,
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
        $pet = Pet::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/pets/{$pet->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $pet->id)
            ->assertJsonPath('name', $pet->name);
    }

    public function test_user_can_update_pet(): void
    {
        $pet = Pet::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson("/api/v1/pets/{$pet->id}", [
            'name' => 'Rex Atualizado',
            'species' => 'Cachorro',
            'breed' => 'Golden Retriever',
            'birth_date' => '2019-01-01',
            'weight' => 30.0,
            'notes' => 'Cachorro muito brincalhão'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('pet.name', 'Rex Atualizado')
            ->assertJsonPath('pet.breed', 'Golden Retriever')
            ->assertJsonPath('pet.weight', 30);

        $this->assertDatabaseHas('pets', [
            'id' => $pet->id,
            'name' => 'Rex Atualizado',
            'breed' => 'Golden Retriever'
        ]);
    }

    public function test_user_can_delete_pet(): void
    {
        $pet = Pet::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/pets/{$pet->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('pets', ['id' => $pet->id]);
    }

    public function test_user_cannot_access_others_pets(): void
    {
        $otherUser = User::factory()->create();
        $pet = Pet::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/pets/{$pet->id}");

        $response->assertStatus(403);
    }

}