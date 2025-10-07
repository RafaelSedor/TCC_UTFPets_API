<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Pet;
use App\Models\User;
use App\Models\Reminder;
use App\Models\SharedPet;
use App\Enums\SharedPetRole;
use App\Enums\InvitationStatus;
use App\Enums\ReminderStatus;
use App\Enums\RepeatRule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReminderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $editor;
    private User $viewer;
    private Pet $pet;
    private string $token;
    private string $editorToken;
    private string $viewerToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->editor = User::factory()->create();
        $this->viewer = User::factory()->create();
        $this->pet = Pet::factory()->create(['user_id' => $this->user->id]);

        $this->token = Auth::login($this->user) ?? '';
        $this->editorToken = Auth::login($this->editor) ?? '';
        $this->viewerToken = Auth::login($this->viewer) ?? '';

        // Compartilha o pet com editor e viewer
        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->editor->id,
            'role' => SharedPetRole::EDITOR,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->user->id,
        ]);

        SharedPet::create([
            'pet_id' => $this->pet->id,
            'user_id' => $this->viewer->id,
            'role' => SharedPetRole::VIEWER,
            'invitation_status' => InvitationStatus::ACCEPTED,
            'invited_by' => $this->user->id,
        ]);
    }

    public function test_user_can_list_reminders(): void
    {
        Reminder::factory()->count(3)->create([
            'pet_id' => $this->pet->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/pets/{$this->pet->id}/reminders");

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_owner_can_create_reminder(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/pets/{$this->pet->id}/reminders", [
            'title' => 'Ração manhã',
            'description' => '150g de ração premium',
            'scheduled_at' => now()->addHours(2)->format('Y-m-d H:i:s'),
            'repeat_rule' => 'daily',
            'channel' => 'in-app',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Lembrete criado com sucesso.',
            ])
            ->assertJsonPath('data.title', 'Ração manhã')
            ->assertJsonPath('data.repeat_rule', 'daily');

        $this->assertDatabaseHas('reminders', [
            'pet_id' => $this->pet->id,
            'title' => 'Ração manhã',
        ]);
    }

    public function test_editor_can_create_reminder(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->editorToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/reminders", [
            'title' => 'Medicação noite',
            'scheduled_at' => now()->addHours(8)->format('Y-m-d H:i:s'),
        ]);

        $response->assertStatus(201);
    }

    public function test_viewer_cannot_create_reminder(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->viewerToken
        ])->postJson("/api/v1/pets/{$this->pet->id}/reminders", [
            'title' => 'Teste',
            'scheduled_at' => now()->addHours(1)->format('Y-m-d H:i:s'),
        ]);

        $response->assertStatus(403);
    }

    public function test_can_filter_reminders_by_status(): void
    {
        Reminder::factory()->create([
            'pet_id' => $this->pet->id,
            'status' => ReminderStatus::ACTIVE,
        ]);

        Reminder::factory()->create([
            'pet_id' => $this->pet->id,
            'status' => ReminderStatus::DONE,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/pets/{$this->pet->id}/reminders?status=active");

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_can_filter_reminders_by_date_range(): void
    {
        Reminder::factory()->create([
            'pet_id' => $this->pet->id,
            'scheduled_at' => now()->addDays(1),
        ]);

        Reminder::factory()->create([
            'pet_id' => $this->pet->id,
            'scheduled_at' => now()->addDays(10),
        ]);

        $from = now()->format('Y-m-d H:i:s');
        $to = now()->addDays(5)->format('Y-m-d H:i:s');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/pets/{$this->pet->id}/reminders?from={$from}&to={$to}");

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_can_view_reminder(): void
    {
        $reminder = Reminder::factory()->create([
            'pet_id' => $this->pet->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson("/api/v1/reminders/{$reminder->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $reminder->id);
    }

    public function test_owner_can_update_reminder(): void
    {
        $reminder = Reminder::factory()->create([
            'pet_id' => $this->pet->id,
            'title' => 'Título original',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->patchJson("/api/v1/reminders/{$reminder->id}", [
            'title' => 'Título atualizado',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Título atualizado');
    }

    public function test_viewer_cannot_update_reminder(): void
    {
        $reminder = Reminder::factory()->create([
            'pet_id' => $this->pet->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->viewerToken
        ])->patchJson("/api/v1/reminders/{$reminder->id}", [
            'title' => 'Tentativa de atualização',
        ]);

        $response->assertStatus(403);
    }

    public function test_owner_can_delete_reminder(): void
    {
        $reminder = Reminder::factory()->create([
            'pet_id' => $this->pet->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson("/api/v1/reminders/{$reminder->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('reminders', [
            'id' => $reminder->id,
        ]);
    }

    public function test_can_snooze_reminder(): void
    {
        $originalTime = now()->addHours(1);
        $reminder = Reminder::factory()->create([
            'pet_id' => $this->pet->id,
            'scheduled_at' => $originalTime,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/reminders/{$reminder->id}/snooze", [
            'minutes' => 30,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Lembrete adiado por 30 minutos.',
            ]);

        $this->assertTrue(
            $reminder->fresh()->scheduled_at->greaterThan($originalTime)
        );
    }

    public function test_can_complete_reminder(): void
    {
        $reminder = Reminder::factory()->create([
            'pet_id' => $this->pet->id,
            'status' => ReminderStatus::ACTIVE,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/reminders/{$reminder->id}/complete");

        $response->assertStatus(200);

        $this->assertDatabaseHas('reminders', [
            'id' => $reminder->id,
            'status' => 'done',
        ]);
    }

    public function test_recurring_reminder_creates_next_occurrence_on_complete(): void
    {
        $reminder = Reminder::factory()->create([
            'pet_id' => $this->pet->id,
            'title' => 'Ração diária',
            'scheduled_at' => now()->addHours(1),
            'repeat_rule' => RepeatRule::DAILY,
            'status' => ReminderStatus::ACTIVE,
        ]);

        $originalCount = Reminder::count();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/reminders/{$reminder->id}/complete");

        $response->assertStatus(200);

        // Deve ter criado um novo lembrete para o próximo dia
        $this->assertEquals($originalCount + 1, Reminder::count());

        $nextReminder = Reminder::where('pet_id', $this->pet->id)
            ->where('status', 'active')
            ->where('title', 'Ração diária')
            ->first();

        $this->assertNotNull($nextReminder);
        $this->assertTrue(
            $nextReminder->scheduled_at->greaterThan($reminder->scheduled_at)
        );
    }

    public function test_scheduled_at_must_be_in_future(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson("/api/v1/pets/{$this->pet->id}/reminders", [
            'title' => 'Lembrete passado',
            'scheduled_at' => now()->subHours(1)->format('Y-m-d H:i:s'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scheduled_at']);
    }
}

