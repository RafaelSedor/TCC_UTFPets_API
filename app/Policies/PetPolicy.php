<?php

namespace App\Policies;

use App\Models\Pet;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Módulo 11 - Autorização com Policies
| Esta policy controla o acesso aos pets, garantindo que usuários só possam
| manipular seus próprios pets.
*/

class PetPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Usuário autenticado pode ver sua lista de pets
    }

    public function view(User $user, Pet $pet): bool
    {
        return $user->id === $pet->user_id;
    }

    public function create(User $user): bool
    {
        return true; // Usuário autenticado pode criar pets
    }

    public function update(User $user, Pet $pet): bool
    {
        return $user->id === $pet->user_id;
    }

    public function delete(User $user, Pet $pet): bool
    {
        return $user->id === $pet->user_id;
    }
} 