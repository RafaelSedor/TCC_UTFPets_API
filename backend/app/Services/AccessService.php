<?php

namespace App\Services;

use App\Enums\SharedPetRole;
use App\Models\Pet;
use App\Models\User;

/**
 * Serviço centralizado para gerenciamento de permissões de acesso
 * aos pets compartilhados.
 */
class AccessService
{
    /**
     * Verifica se o usuário pode visualizar o pet
     */
    public function canViewPet(User $user, Pet $pet): bool
    {
        $role = $this->getUserRole($user, $pet);
        return $role !== null && $role->canViewPet();
    }

    /**
     * Verifica se o usuário pode gerenciar compartilhamento
     */
    public function canManageSharing(User $user, Pet $pet): bool
    {
        $role = $this->getUserRole($user, $pet);
        return $role !== null && $role->canManageSharing();
    }

    /**
     * Verifica se o usuário pode editar refeições
     */
    public function canEditMeals(User $user, Pet $pet): bool
    {
        $role = $this->getUserRole($user, $pet);
        return $role !== null && $role->canEditMeals();
    }

    /**
     * Verifica se o usuário pode editar o pet
     */
    public function canEditPet(User $user, Pet $pet): bool
    {
        $role = $this->getUserRole($user, $pet);
        return $role !== null && $role->canEditPet();
    }

    /**
     * Verifica se o usuário pode deletar o pet
     */
    public function canDeletePet(User $user, Pet $pet): bool
    {
        $role = $this->getUserRole($user, $pet);
        return $role !== null && $role->canDeletePet();
    }

    /**
     * Retorna o papel do usuário no pet
     */
    public function getUserRole(User $user, Pet $pet): ?SharedPetRole
    {
        return $pet->getUserRole($user);
    }

    /**
     * Verifica se o usuário é o dono original do pet
     */
    public function isOwner(User $user, Pet $pet): bool
    {
        return $pet->user_id === $user->id;
    }

    /**
     * Verifica se há pelo menos um owner no pet
     */
    public function hasOwner(Pet $pet): bool
    {
        return $pet->user_id !== null;
    }
}

