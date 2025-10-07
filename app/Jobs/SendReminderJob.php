<?php

namespace App\Jobs;

use App\Models\Reminder;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Services\NotificationService;

class SendReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $uniqueFor = 3600; // 1 hora de idempotência

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Reminder $reminder
    ) {}

    /**
     * Get the unique ID for the job (idempotência).
     */
    public function uniqueId(): string
    {
        return 'reminder-' . $this->reminder->id . '-' . $this->reminder->scheduled_at->timestamp;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Busca todos os usuários que têm acesso ao pet
            $pet = $this->reminder->pet;
            $users = collect();

            // Adiciona o owner
            $users->push($pet->user);

            // Adiciona todos os participantes aceitos (editores e viewers)
            $participants = $pet->sharedWith()
                ->accepted()
                ->with('user')
                ->get();

            foreach ($participants as $sharedPet) {
                $users->push($sharedPet->user);
            }

            // Remove duplicados
            $users = $users->unique('id');

            // Envia notificação para cada usuário
            $notificationService = app(NotificationService::class);
            
            foreach ($users as $user) {
                $notificationService->queue(
                    user: $user,
                    title: "🔔 Lembrete: {$this->reminder->title}",
                    body: $this->reminder->description ?? "Lembrete agendado para {$this->reminder->scheduled_at->format('d/m/Y H:i')}",
                    data: [
                        'type' => 'reminder_due',
                        'reminder_id' => $this->reminder->id,
                        'pet_id' => $this->reminder->pet_id,
                        'scheduled_at' => $this->reminder->scheduled_at->toIso8601String(),
                    ],
                    channel: $this->reminder->channel
                );
                
                Log::info("Notificação de lembrete criada", [
                    'reminder_id' => $this->reminder->id,
                    'user_id' => $user->id,
                    'title' => $this->reminder->title,
                ]);
            }

            // Se for recorrente e não está concluído, cria próxima ocorrência
            if ($this->reminder->status->isActive() && 
                $this->reminder->repeat_rule && 
                $this->reminder->repeat_rule->isRecurring()) {
                
                $this->reminder->calculateNextOccurrence();
            }

            Log::info("Lembrete processado com sucesso", [
                'reminder_id' => $this->reminder->id,
                'users_notified' => $users->count(),
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao enviar lembrete", [
                'reminder_id' => $this->reminder->id,
                'error' => $e->getMessage(),
            ]);

            // Re-lança a exceção para que o job seja reprocessado
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Falha permanente ao enviar lembrete", [
            'reminder_id' => $this->reminder->id,
            'error' => $exception->getMessage(),
        ]);

        // TODO: Mover para dead-letter queue ou tabela de falhas
    }
}

