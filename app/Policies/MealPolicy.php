<?php

namespace App\Policies;

use App\Models\Meal;
use App\Models\User;
use App\Services\AccessService;

/*
|--------------------------------------------------------------------------
| Módulo 11 - Autorização com Policies
| Esta policy controla o acesso às refeições, considerando também
| compartilhamentos com diferentes papéis (owner e editor podem editar).
*/

class MealPolicy
{
    protected AccessService $accessService;

    public function __construct(AccessService $accessService)
    {
        $this->accessService = $accessService;
    }

    public function viewAny(User $user): bool
    {
        return true; // Usuário autenticado pode ver lista de refeições
    }

    public function view(User $user, Meal $meal): bool
    {
        return $this->accessService->canViewPet($user, $meal->pet);
    }

    public function create(User $user): bool
    {
        return true; // Validação específica será feita no controller
    }

    public function update(User $user, Meal $meal): bool
    {
        return $this->accessService->canEditMeals($user, $meal->pet);
    }

    public function delete(User $user, Meal $meal): bool
    {
        return $this->accessService->canEditMeals($user, $meal->pet);
    }

    public function consume(User $user, Meal $meal): bool
    {
        return $this->accessService->canEditMeals($user, $meal->pet);
    }
} 