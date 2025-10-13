<?php

namespace App\Jobs;

use App\Models\Reminder;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;
    public $backoff = [60, 300, 900, 3600];
    public $timeout = 120;

    public function __construct(public Reminder $reminder) {}

    public function handle(NotificationService $notificationService): void
    {
        $reminder = Reminder::with('pet.user')->find($this->reminder->id);
        if (!$reminder) {
            Log::warning('Lembrete nao encontrado para envio', [
                'reminder_id' => $this->reminder->id,
            ]);
            return;
        }

        // Envia somente se ativo e agendado para agora ou antes
        if (!$reminder->status->isActive() || $reminder->scheduled_at->isFuture()) {
            Log::info('Lembrete nao apto para envio', [
                'reminder_id' => $reminder->id,
                'status' => $reminder->status->value,
                'scheduled_at' => (string) $reminder->scheduled_at,
            ]);
            return;
        }

        try {
            // Enfileira notificação conforme canal configurado no lembrete
            $notificationService->queue(
                user: $reminder->pet->user,
                title: "Lembrete: {$reminder->title}",
                body: $reminder->description ?: ($reminder->pet->name . ' - lembrete devido'),
                data: [
                    'type' => 'reminder_due',
                    'reminder_id' => $reminder->id,
                    'pet_id' => $reminder->pet_id,
                ],
                channel: $reminder->channel
            );

            Log::info('Lembrete enfileirado com sucesso', [
                'reminder_id' => $reminder->id,
                'pet_name' => $reminder->pet->name,
                'user_id' => $reminder->pet->user_id,
            ]);

        } catch (\Throwable $e) {
            Log::error('Erro ao enviar lembrete', [
                'reminder_id' => $reminder->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendReminderJob falhou definitivamente', [
            'reminder_id' => $this->reminder->id ?? null,
            'error' => $exception->getMessage(),
        ]);
    }
}

