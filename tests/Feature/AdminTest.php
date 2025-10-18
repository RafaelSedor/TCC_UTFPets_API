<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Illuminate\Support\Facades\Auth;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $regularUser;
    protected string $adminToken;
    protected string $userToken;

    protected function setUp(): void
    {
        parent::setUp();

        // Cria usuário admin
        $this->admin = User::factory()->admin()->create([
            'email' => 'admin@test.com',
        ]);

        // Cria usuário regular
        $this->regularUser = User::factory()->create([
            
            'email' => 'user@test.com',
        ]);

        // Gera tokens JWT
        $this->adminToken = Auth::login($this->admin) ?? '';
        $this->userToken = Auth::login($this->regularUser) ?? '';
    }

    #[Test]
    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->userToken
        ])->getJson('/api/v1/admin/users');

        $response->assertStatus(403)
            ->assertJson(['error' => 'Forbidden. Admin access required.']);
    }

    #[Test]
    public function test_admin_can_list_users(): void
    {
        User::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'created_at']
                ],
                'meta' => ['total', 'per_page', 'current_page', 'last_page']
            ]);

        $this->assertGreaterThanOrEqual(7, $response->json('meta.total')); // 5 + admin + regular user
    }

    #[Test]
    public function test_admin_can_filter_users_by_email(): void
    {
        User::factory()->create(['email' => 'john@example.com']);
        User::factory()->create(['email' => 'jane@example.com']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/v1/admin/users?email=john');

        $response->assertStatus(200);
        
        $emails = collect($response->json('data'))->pluck('email');
        $this->assertTrue($emails->contains('john@example.com'));
        $this->assertFalse($emails->contains('jane@example.com'));
    }

    #[Test]
    public function test_admin_can_filter_users_by_date(): void
    {
        $oldUser = User::factory()->create(['created_at' => now()->subDays(10)]);
        $newUser = User::factory()->create(['created_at' => now()]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/v1/admin/users?created_from=' . now()->subDays(1)->toDateString());

        $response->assertStatus(200);
        
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($newUser->id));
    }

    #[Test]
    public function test_admin_can_toggle_user_admin_status(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->patchJson("/api/v1/admin/users/{$user->id}", [
            'is_admin' => true
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Permissões de admin atualizadas com sucesso',
                'user' => [
                    'id' => $user->id,
                    'is_admin' => true
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_admin' => true
        ]);

        // Verifica se foi criado log de auditoria
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'updated',
            'entity_type' => 'User',
            'entity_id' => (string)$user->id,
        ]);
    }

    #[Test]
    public function test_admin_cannot_remove_own_admin_access(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->patchJson("/api/v1/admin/users/{$this->admin->id}", [
            'is_admin' => false
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Você não pode remover seu próprio acesso de admin'
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->admin->id,
            'is_admin' => true
        ]);
    }

    #[Test]
    public function test_admin_can_list_pets(): void
    {
        $user = User::factory()->create();
        Pet::factory()->count(3)->create(['user_id' => $user->id]);
        Pet::factory()->count(2)->create(['user_id' => $this->regularUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/v1/admin/pets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'species', 'user']
                ],
                'meta' => ['total', 'per_page', 'current_page', 'last_page']
            ]);

        $this->assertEquals(5, $response->json('meta.total'));
    }

    #[Test]
    public function test_admin_can_filter_pets_by_owner(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        Pet::factory()->count(2)->create(['user_id' => $user1->id]);
        Pet::factory()->count(3)->create(['user_id' => $user2->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson("/api/v1/admin/pets?owner_id={$user1->id}");

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('meta.total'));
    }

    #[Test]
    public function test_admin_can_list_audit_logs(): void
    {
        // Cria alguns logs de auditoria
        AuditLog::factory()->count(10)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/v1/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'action', 'entity_type', 'user', 'created_at']
                ],
                'meta' => ['total', 'per_page', 'current_page', 'last_page']
            ]);

        $this->assertGreaterThanOrEqual(10, $response->json('meta.total'));
    }

    #[Test]
    public function test_admin_can_filter_audit_logs_by_action(): void
    {
        AuditLog::factory()->create(['action' => 'created']);
        AuditLog::factory()->create(['action' => 'updated']);
        AuditLog::factory()->create(['action' => 'deleted']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/v1/admin/audit-logs?action=created');

        $response->assertStatus(200);
        
        $actions = collect($response->json('data'))->pluck('action')->unique();
        $this->assertEquals(['created'], $actions->toArray());
    }

    #[Test]
    public function test_admin_can_filter_audit_logs_by_entity_type(): void
    {
        AuditLog::factory()->create(['entity_type' => 'User']);
        AuditLog::factory()->create(['entity_type' => 'Pet']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/v1/admin/audit-logs?entity_type=User');

        $response->assertStatus(200);
        
        $types = collect($response->json('data'))->pluck('entity_type')->unique();
        $this->assertEquals(['User'], $types->toArray());
    }

    #[Test]
    public function test_pagination_works_on_all_admin_endpoints(): void
    {
        User::factory()->count(25)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/v1/admin/users?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.per_page', 10);
    }

    #[Test]
    public function test_unauthenticated_cannot_access_admin_routes(): void
    {
        $response = $this->getJson('/api/v1/admin/users');

        $response->assertStatus(401);
    }
}

