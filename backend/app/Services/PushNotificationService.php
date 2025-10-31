<?php

namespace App\Services;

use App\Models\User;
use App\Models\PushSubscription;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushNotificationService
{
    protected WebPush $webPush;

    public function __construct()
    {
        $auth = [
            'VAPID' => [
                'subject' => config('services.vapid.subject', 'mailto:noreply@utfpets.com'),
                'publicKey' => config('services.vapid.public_key'),
                'privateKey' => config('services.vapid.private_key'),
            ],
        ];

        $this->webPush = new WebPush($auth);
    }

    /**
     * Envia uma notificação push para um usuário específico
     *
     * @param User $user
     * @param array $payload
     * @return array Resultados do envio
     */
    public function sendToUser(User $user, array $payload): array
    {
        $subscriptions = $user->pushSubscriptions;

        if ($subscriptions->isEmpty()) {
            return [
                'success' => false,
                'message' => 'User has no push subscriptions',
                'sent' => 0,
                'failed' => 0,
            ];
        }

        $results = [
            'sent' => 0,
            'failed' => 0,
            'expired' => [],
        ];

        foreach ($subscriptions as $subscription) {
            try {
                $webPushSubscription = Subscription::create($subscription->toWebPushFormat());

                $result = $this->webPush->queueNotification(
                    $webPushSubscription,
                    json_encode($payload)
                );

                if ($result) {
                    $results['sent']++;
                } else {
                    $results['failed']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                \Log::error('Push notification error', [
                    'user_id' => $user->id,
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Flush e processa resultados
        foreach ($this->webPush->flush() as $report) {
            if (!$report->isSuccess()) {
                // Se subscription expirou (410 Gone), remover do banco
                if ($report->getResponse() && $report->getResponse()->getStatusCode() === 410) {
                    $endpoint = $report->getEndpoint();
                    $expiredSubscription = $subscriptions->first(function ($sub) use ($endpoint) {
                        return $sub->endpoint === $endpoint;
                    });

                    if ($expiredSubscription) {
                        $expiredSubscription->delete();
                        $results['expired'][] = $expiredSubscription->id;
                    }
                }
            }
        }

        $results['success'] = $results['sent'] > 0;
        $results['message'] = $results['sent'] > 0
            ? "Sent {$results['sent']} push notifications"
            : 'No push notifications sent';

        return $results;
    }

    /**
     * Envia notificação push para múltiplos usuários
     *
     * @param \Illuminate\Support\Collection $users
     * @param array $payload
     * @return array
     */
    public function sendToUsers($users, array $payload): array
    {
        $totalResults = [
            'success' => true,
            'sent' => 0,
            'failed' => 0,
            'expired' => [],
        ];

        foreach ($users as $user) {
            $result = $this->sendToUser($user, $payload);
            $totalResults['sent'] += $result['sent'];
            $totalResults['failed'] += $result['failed'];
            $totalResults['expired'] = array_merge($totalResults['expired'], $result['expired'] ?? []);
        }

        $totalResults['success'] = $totalResults['sent'] > 0;
        $totalResults['message'] = "Sent {$totalResults['sent']} push notifications to {$users->count()} users";

        return $totalResults;
    }

    /**
     * Cria um payload padrão para notificação
     *
     * @param string $title
     * @param string $body
     * @param array $data
     * @return array
     */
    public static function createPayload(string $title, string $body, array $data = []): array
    {
        return [
            'notification' => [
                'title' => $title,
                'body' => $body,
                'icon' => '/assets/icons/icon-192x192.png',
                'badge' => '/assets/icons/icon-72x72.png',
                'vibrate' => [200, 100, 200],
                'requireInteraction' => false,
            ],
            'data' => array_merge([
                'timestamp' => now()->toIso8601String(),
                'url' => '/',
            ], $data),
        ];
    }
}
