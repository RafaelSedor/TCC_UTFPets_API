<?php

namespace App\Enums;

enum ReminderStatus: string
{
    case ACTIVE = 'active';
    case PAUSED = 'paused';
    case DONE = 'done';

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function isPaused(): bool
    {
        return $this === self::PAUSED;
    }

    public function isDone(): bool
    {
        return $this === self::DONE;
    }
}

