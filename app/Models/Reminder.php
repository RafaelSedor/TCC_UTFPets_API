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
        'job_id',
        'days_of_week',
        'timezone_override',
        'snooze_minutes_default',
        'active_window_start',
        'active_window_end',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'status' => ReminderStatus::class,
        'repeat_rule' => RepeatRule::class,
        'channel' => NotificationChannel::class,
        'days_of_week' => 'array',
        'snooze_minutes_default' => 'integer',
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
        // Valida o limite máximo de snooze (1440 minutos = 24 horas)
        if ($minutes > 1440) {
            return false;
        }

        return $this->update([
            'scheduled_at' => $this->scheduled_at->addMinutes($minutes),
        ]);
    }
    
    /**
     * Retorna o timezone efetivo (override ou do usuário)
     */
    public function getEffectiveTimezone(): string
    {
        if ($this->timezone_override) {
            return $this->timezone_override;
        }
        
        // Fallback: usar timezone do usuário através do pet
        return $this->pet->user->timezone ?? config('app.timezone');
    }
    
    /**
     * Verifica se um horário está dentro da janela ativa
     */
    public function isWithinActiveWindow(\DateTimeInterface $datetime): bool
    {
        // Se não há janela definida, sempre retorna true
        if (!$this->active_window_start || !$this->active_window_end) {
            return true;
        }
        
        $time = $datetime->format('H:i:s');
        return $time >= $this->active_window_start && $time <= $this->active_window_end;
    }
    
    /**
     * Verifica se um dia da semana está permitido
     */
    public function isDayOfWeekAllowed(\DateTimeInterface $datetime): bool
    {
        // Se não há restrição de dias, sempre retorna true
        if (!$this->days_of_week || empty($this->days_of_week)) {
            return true;
        }
        
        $dayOfWeek = strtoupper($datetime->format('D')); // MON, TUE, WED, etc
        return in_array($dayOfWeek, $this->days_of_week);
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

