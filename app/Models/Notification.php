<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Notification extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'body',
        'data',
        'channel',
        'status',
    ];

    protected $casts = [
        'data' => 'array',
        'channel' => NotificationChannel::class,
        'status' => NotificationStatus::class,
    ];

    /**
     * Relacionamento com User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para notificações enfileiradas
     */
    public function scopeQueued(Builder $query): void
    {
        $query->where('status', NotificationStatus::QUEUED);
    }

    /**
     * Scope para notificações enviadas
     */
    public function scopeSent(Builder $query): void
    {
        $query->where('status', NotificationStatus::SENT);
    }

    /**
     * Scope para notificações lidas
     */
    public function scopeRead(Builder $query): void
    {
        $query->where('status', NotificationStatus::READ);
    }

    /**
     * Scope para notificações não lidas
     */
    public function scopeUnread(Builder $query): void
    {
        $query->where('status', NotificationStatus::SENT);
    }

    /**
     * Scope para notificações falhadas
     */
    public function scopeFailed(Builder $query): void
    {
        $query->where('status', NotificationStatus::FAILED);
    }

    /**
     * Marca a notificação como lida
     */
    public function markAsRead(): bool
    {
        return $this->update(['status' => NotificationStatus::READ]);
    }

    /**
     * Marca a notificação como enviada
     */
    public function markAsSent(): bool
    {
        return $this->update(['status' => NotificationStatus::SENT]);
    }

    /**
     * Marca a notificação como falhada
     */
    public function markAsFailed(): bool
    {
        return $this->update(['status' => NotificationStatus::FAILED]);
    }
}

