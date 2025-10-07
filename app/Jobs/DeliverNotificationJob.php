<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Enums\NotificationStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DeliverNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Notification $notification
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Por enquanto, apenas marca como enviado (entrega DB)
            // Futuramente, aqui será implementado:
            // - Envio de email (se channel = email)
            // - Envio de push notification (se channel = push)
            
            if ($this->notification->channel->isInApp()) {
                // Notificação DB já está criada, apenas marca como enviada
                $this->notification->markAsSent();
                
                Log::info("Notificação DB entregue", [
                    'notification_id' => $this->notification->id,
                    'user_id' => $this->notification->user_id,
                    'title' => $this->notification->title,
                ]);
            } 
            elseif ($this->notification->channel->isEmail()) {
                // TODO: Implementar envio de email
                // Mail::to($this->notification->user)->send(...);
                $this->notification->markAsSent();
                
                Log::info("Email enviado (simulado)", [
                    'notification_id' => $this->notification->id,
                    'user_id' => $this->notification->user_id,
                ]);
            }
            elseif ($this->notification->channel->isPush()) {
                // TODO: Implementar push notification (FCM)
                $this->notification->markAsSent();
                
                Log::info("Push notification enviado (simulado)", [
                    'notification_id' => $this->notification->id,
                    'user_id' => $this->notification->user_id,
                ]);
            }

        } catch (\Exception $e) {
            Log::error("Erro ao entregar notificação", [
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage(),
            ]);

            // Marca como falhada
            $this->notification->markAsFailed();

            // Re-lança para retry
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Falha permanente ao entregar notificação", [
            'notification_id' => $this->notification->id,
            'error' => $exception->getMessage(),
        ]);

        $this->notification->markAsFailed();
    }
}

