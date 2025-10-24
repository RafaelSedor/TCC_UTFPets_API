<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case DB = 'db';
    case EMAIL = 'email';
    case PUSH = 'push';

    public function isInApp(): bool
    {
        return $this === self::DB;
    }

    public function isDb(): bool
    {
        return $this === self::DB;
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
