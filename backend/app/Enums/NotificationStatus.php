<?php

namespace App\Enums;

enum NotificationStatus: string
{
    case QUEUED = 'queued';
    case SENT = 'sent';
    case FAILED = 'failed';
    case READ = 'read';

    public function isQueued(): bool
    {
        return $this === self::QUEUED;
    }

    public function isSent(): bool
    {
        return $this === self::SENT;
    }

    public function isFailed(): bool
    {
        return $this === self::FAILED;
    }

    public function isRead(): bool
    {
        return $this === self::READ;
    }

    public function isUnread(): bool
    {
        return $this === self::SENT;
    }
}

