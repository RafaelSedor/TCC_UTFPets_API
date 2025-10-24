<?php

namespace App\Enums;

enum SharedPetRole: string
{
    case OWNER = 'owner';
    case EDITOR = 'editor';
    case VIEWER = 'viewer';

    public function canEditMeals(): bool
    {
        return in_array($this, [self::OWNER, self::EDITOR]);
    }

    public function canManageSharing(): bool
    {
        return $this === self::OWNER;
    }

    public function canViewPet(): bool
    {
        return true; // Todos os papéis podem visualizar
    }

    public function canDeletePet(): bool
    {
        return $this === self::OWNER;
    }

    public function canEditPet(): bool
    {
        return $this === self::OWNER;
    }
}

