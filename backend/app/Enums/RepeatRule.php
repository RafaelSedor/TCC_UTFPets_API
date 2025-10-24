<?php

namespace App\Enums;

enum RepeatRule: string
{
    case NONE = 'none';
    case DAILY = 'daily';
    case WEEKLY = 'weekly';
    case CUSTOM = 'custom'; // Para RRULE futura

    public function isRecurring(): bool
    {
        return $this !== self::NONE;
    }

    public function getNextOccurrence(\DateTime $from): ?\DateTime
    {
        if (!$this->isRecurring()) {
            return null;
        }

        $next = clone $from;

        return match($this) {
            self::DAILY => $next->modify('+1 day'),
            self::WEEKLY => $next->modify('+1 week'),
            self::CUSTOM => null, // Implementar parse de RRULE no futuro
            default => null,
        };
    }
}

