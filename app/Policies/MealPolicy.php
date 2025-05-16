<?php

namespace App\Policies;

use App\Models\Meal;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Módulo 11 - Autorização com Policies
| Esta policy controla o acesso às refeições, garantindo que usuários só possam
| manipular refeições de seus próprios pets.
*/

class MealPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Usuário autenticado pode ver lista de refeições
    }

    public function view(User $user, Meal $meal): bool
    {
        return $user->id === $meal->pet->user_id;
    }

    public function create(User $user): bool
    {
        return true; // Usuário autenticado pode criar refeições
    }

    public function update(User $user, Meal $meal): bool
    {
        return $user->id === $meal->pet->user_id;
    }

    public function delete(User $user, Meal $meal): bool
    {
        return $user->id === $meal->pet->user_id;
    }

    public function consume(User $user, Meal $meal): bool
    {
        return $user->id === $meal->pet->user_id;
    }
} 