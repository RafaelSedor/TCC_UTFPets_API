<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Enums\NotificationStatus;
use App\Services\PushNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
                // Envio de email
                try {
                    // Nota: Você precisará criar um Mailable para enviar o email
                    // Por exemplo: Mail::to($this->notification->user->email)
                    //     ->send(new NotificationEmail($this->notification));

                    // Por enquanto, apenas logamos que seria enviado
                    Log::info("Email notification would be sent", [
                        'notification_id' => $this->notification->id,
                        'user_id' => $this->notification->user_id,
                        'user_email' => $this->notification->user->email ?? 'N/A',
                        'title' => $this->notification->title,
                        'body' => $this->notification->body,
                    ]);

                    $this->notification->markAsSent();
                } catch (\Exception $e) {
                    Log::error("Failed to send email notification", [
                        'notification_id' => $this->notification->id,
                        'error' => $e->getMessage(),
                    ]);
                    throw $e;
                }
            }
            elseif ($this->notification->channel->isPush()) {
                // Envio de push notification via Web Push
                try {
                    $pushService = app(PushNotificationService::class);

                    $payload = PushNotificationService::createPayload(
                        $this->notification->title,
                        $this->notification->body,
                        [
                            'notification_id' => $this->notification->id,
                            'type' => $this->notification->type->value ?? 'general',
                            'url' => $this->notification->data['url'] ?? '/',
                        ]
                    );

                    $result = $pushService->sendToUser($this->notification->user, $payload);

                    if ($result['success']) {
                        $this->notification->markAsSent();

                        Log::info("Push notification sent successfully", [
                            'notification_id' => $this->notification->id,
                            'user_id' => $this->notification->user_id,
                            'sent_count' => $result['sent'],
                            'failed_count' => $result['failed'],
                        ]);
                    } else {
                        Log::warning("Push notification could not be sent", [
                            'notification_id' => $this->notification->id,
                            'user_id' => $this->notification->user_id,
                            'message' => $result['message'],
                        ]);

                        // Ainda marca como enviado, pois não há subscriptions ativas
                        $this->notification->markAsSent();
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to send push notification", [
                        'notification_id' => $this->notification->id,
                        'error' => $e->getMessage(),
                    ]);
                    throw $e;
                }
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

