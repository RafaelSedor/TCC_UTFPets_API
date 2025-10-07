<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case IN_APP = 'in-app';
    case EMAIL = 'email';
    case PUSH = 'push';

    public function isInApp(): bool
    {
        return $this === self::IN_APP;
    }

    public function isEmail(): bool
    {
        return $this === self::EMAIL;
    }

    public function isPush(): bool
    {
        return $this === self::PUSH;
    }
}

