<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use App\Enums\ReminderStatus;
use App\Enums\RepeatRule;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Reminder extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'pet_id',
        'title',
        'description',
        'scheduled_at',
        'repeat_rule',
        'status',
        'channel',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'status' => ReminderStatus::class,
        'repeat_rule' => RepeatRule::class,
        'channel' => NotificationChannel::class,
    ];

    /**
     * Relacionamento com Pet
     */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    /**
     * Scope para lembretes ativos
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', ReminderStatus::ACTIVE);
    }

    /**
     * Scope para lembretes pausados
     */
    public function scopePaused(Builder $query): void
    {
        $query->where('status', ReminderStatus::PAUSED);
    }

    /**
     * Scope para lembretes concluídos
     */
    public function scopeDone(Builder $query): void
    {
        $query->where('status', ReminderStatus::DONE);
    }

    /**
     * Scope para lembretes pendentes (devido dentro de X minutos)
     */
    public function scopePending(Builder $query, int $minutesAhead = 5): void
    {
        $query->active()
            ->where('scheduled_at', '<=', now()->addMinutes($minutesAhead));
    }

    /**
     * Adia o lembrete por X minutos
     */
    public function snooze(int $minutes): bool
    {
        return $this->update([
            'scheduled_at' => $this->scheduled_at->addMinutes($minutes),
        ]);
    }

    /**
     * Marca o lembrete como concluído
     */
    public function complete(): bool
    {
        return $this->update(['status' => ReminderStatus::DONE]);
    }

    /**
     * Calcula a próxima ocorrência para lembretes recorrentes
     */
    public function calculateNextOccurrence(): ?self
    {
        if (!$this->repeat_rule || $this->repeat_rule === RepeatRule::NONE) {
            return null;
        }

        $nextScheduledAt = $this->repeat_rule->getNextOccurrence($this->scheduled_at);

        if (!$nextScheduledAt) {
            return null;
        }

        // Cria um novo lembrete para a próxima ocorrência
        return self::create([
            'pet_id' => $this->pet_id,
            'title' => $this->title,
            'description' => $this->description,
            'scheduled_at' => $nextScheduledAt,
            'repeat_rule' => $this->repeat_rule,
            'status' => ReminderStatus::ACTIVE,
            'channel' => $this->channel,
        ]);
    }
}

