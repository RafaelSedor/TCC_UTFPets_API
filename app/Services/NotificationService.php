<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Jobs\DeliverNotificationJob;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Enfileira uma notificação para ser enviada
     */
    public function queue(
        User $user,
        string $title,
        string $body,
        array $data = [],
        NotificationChannel|string $channel = 'db'
    ): Notification {
        
        // Converte string para enum se necessário
        if (is_string($channel)) {
            $channel = NotificationChannel::from($channel);
        }

        // Cria a notificação com status queued
        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'channel' => $channel,
            'status' => NotificationStatus::QUEUED,
        ]);

        // Enfileira o job para processar a entrega
        DeliverNotificationJob::dispatch($notification);

        Log::info("Notificação enfileirada", [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'channel' => $channel->value,
        ]);

        return $notification;
    }

    /**
     * Enfileira notificações para múltiplos usuários
     */
    public function queueToMany(
        array $users,
        string $title,
        string $body,
        array $data = [],
        NotificationChannel|string $channel = 'db'
    ): int {
        $count = 0;

        foreach ($users as $user) {
            $this->queue($user, $title, $body, $data, $channel);
            $count++;
        }

        return $count;
    }

    /**
     * Marca uma notificação como lida
     */
    public function markAsRead(Notification $notification): bool
    {
        return $notification->markAsRead();
    }

    /**
     * Marca todas as notificações de um usuário como lidas
     */
    public function markAllAsRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->unread()
            ->update(['status' => NotificationStatus::READ]);
    }

    /**
     * Conta notificações não lidas de um usuário
     */
    public function countUnread(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->unread()
            ->count();
    }

    /**
     * Deleta notificações antigas (limpeza)
     */
    public function deleteOld(int $daysOld = 30): int
    {
        return Notification::where('created_at', '<', now()->subDays($daysOld))
            ->where('status', NotificationStatus::READ)
            ->delete();
    }
}

