<?php

namespace App\Jobs;

use App\Events\ReminderDue;
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
    public $backoff = [60, 300, 900, 3600]; // 1min, 5min, 15min, 1h
    public $timeout = 120;

    public function __construct(
        public string $reminderId,
        public string $jobId
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $reminder = Reminder::with('pet.user')->find($this->reminderId);
        
        if (!$reminder) {
            Log::warning('Lembrete não encontrado para envio', [
                'reminder_id' => $this->reminderId,
                'job_id' => $this->jobId
            ]);
            return;
        }

        // Verifica se o lembrete ainda está ativo
        if ($reminder->status !== 'active' || $reminder->scheduled_at->isPast()) {
            Log::info('Lembrete não está mais ativo', [
                'reminder_id' => $this->reminderId,
                'status' => $reminder->status,
                'scheduled_at' => $reminder->scheduled_at
            ]);
            return;
        }

        $title = "🔔 Lembrete: {$reminder->title}";
        $body = "{$reminder->pet->name}: {$reminder->description}";

        try {
            // Dispara evento que aciona o push notification
            event(new ReminderDue($reminder));

            Log::info('Lembrete enviado com sucesso', [
                'reminder_id' => $this->reminderId,
                'pet_name' => $reminder->pet->name,
                'user_id' => $reminder->pet->user_id,
            ]);

            // Marca o lembrete como enviado
            $reminder->update([
                'status' => 'sent',
                'sent_at' => now()
            ]);

        } catch (\Throwable $e) {
            Log::error('Erro ao enviar lembrete', [
                'reminder_id' => $this->reminderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e; // Re-throw para que o job seja marcado como failed
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendReminderJob falhou definitivamente', [
            'reminder_id' => $this->reminderId,
            'job_id' => $this->jobId,
            'error' => $exception->getMessage()
        ]);

        // Opcional: marcar o lembrete como failed
        $reminder = Reminder::find($this->reminderId);
        if ($reminder) {
            $reminder->update([
                'status' => 'failed',
                'failed_at' => now()
            ]);
        }
    }
}