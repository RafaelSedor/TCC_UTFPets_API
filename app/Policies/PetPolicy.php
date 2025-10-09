<?php

namespace App\Policies;

use App\Models\Pet;
use App\Models\User;
use App\Services\AccessService;

/*
|--------------------------------------------------------------------------
| Módulo 11 - Autorização com Policies
| Esta policy controla o acesso aos pets, considerando também
| compartilhamentos com diferentes papéis (owner, editor, viewer).
*/

class PetPolicy
{
    protected AccessService $accessService;

    public function __construct(AccessService $accessService)
    {
        $this->accessService = $accessService;
    }

    public function viewAny(User $user): bool
    {
        return true; // Usuário autenticado pode ver sua lista de pets
    }

    public function view(User $user, Pet $pet): bool
    {
        return $this->accessService->canViewPet($user, $pet);
    }

    public function create(User $user): bool
    {
        return true; // Usuário autenticado pode criar pets
    }

    public function update(User $user, Pet $pet): bool
    {
        return $this->accessService->canEditPet($user, $pet);
    }

    public function delete(User $user, Pet $pet): bool
    {
        return $this->accessService->canDeletePet($user, $pet);
    }

    /**
     * Determina se o usuário pode gerenciar compartilhamentos
     */
    public function manageSharing(User $user, Pet $pet): bool
    {
        return $this->accessService->canManageSharing($user, $pet);
    }
} 