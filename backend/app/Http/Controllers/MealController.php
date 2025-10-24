<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\Meal;
use App\Http\Requests\MealRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller as BaseController;

/*
|--------------------------------------------------------------------------
| Módulo 04 - Roteamento e Ciclo de Vida de uma Request
| Módulo 11 - Autorização com Policies
| Este controller gerencia as refeições dos pets, utilizando form requests
| para validação e policies para autorização.
*/


class MealController extends BaseController
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->authorizeResource(Meal::class, 'meal');
    }

    /**
     * Lista todas as refeições de um pet
     */
    public function index(Pet $pet): JsonResponse
    {
        $this->authorize('viewAny', [Meal::class, $pet]);
        $meals = $pet->meals()->orderBy('scheduled_for')->get();
        return response()->json($meals);
    }

    /**
     * Cria uma nova refeição para um pet
     */
    public function store(MealRequest $request, Pet $pet): JsonResponse
    {
        // Verifica se o usuário tem permissão para editar meals deste pet
        $accessService = app(\App\Services\AccessService::class);
        if (!$accessService->canEditMeals(auth()->user(), $pet)) {
            abort(403, 'Você não tem permissão para criar refeições para este pet.');
        }
        
        $meal = $pet->meals()->create($request->validated());
        return response()->json($meal, 201);
    }

    /**
     * Retorna os detalhes de uma refeição
     */
    public function show(Pet $pet, Meal $meal): JsonResponse
    {
        $this->authorize('view', $meal);
        return response()->json($meal);
    }

    /**
     * Atualiza uma refeição
     */
    public function update(MealRequest $request, Pet $pet, Meal $meal): JsonResponse
    {
        $this->authorize('update', $meal);

        try {
            $data = $request->validated();
            $meal->update($data);
            $meal->refresh();
            
            return response()->json([
                'message' => 'Refeição atualizada com sucesso',
                'meal' => $meal
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar refeição',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove uma refeição
     */
    public function destroy(Pet $pet, Meal $meal): JsonResponse
    {
        $meal->delete();
        return response()->json(null, 204);
    }

    /**
     * Marca uma refeição como consumida
     */
    public function consume(Pet $pet, Meal $meal): JsonResponse
    {
        $this->authorize('consume', $meal);

        if ($meal->consumed_at) {
            return response()->json([
                'message' => 'Esta refeição já foi consumida'
            ], 422);
        }

        $meal->update(['consumed_at' => now()]);
        return response()->json($meal);
    }
}
