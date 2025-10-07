<?php

namespace App\Enums;

enum InvitationStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case REVOKED = 'revoked';

    public function isPending(): bool
    {
        return $this === self::PENDING;
    }

    public function isAccepted(): bool
    {
        return $this === self::ACCEPTED;
    }

    public function isRevoked(): bool
    {
        return $this === self::REVOKED;
    }
}

