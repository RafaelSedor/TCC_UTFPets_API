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

/**
 * @OA\Tag(
 *     name="Meals",
 *     description="Gerenciamento de refeições dos pets"
 * )
 */

class MealController extends BaseController
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->authorizeResource(Meal::class, 'meal');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/pets/{pet_id}/meals",
     *     tags={"Meals"},
     *     summary="Lista todas as refeições de um pet",
     *     description="Retorna uma lista de todas as refeições agendadas para um pet específico, ordenadas por data",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pet_id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de refeições",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Meal")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Pet não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Pet não encontrado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function index(Pet $pet): JsonResponse
    {
        $this->authorize('viewAny', [Meal::class, $pet]);
        $meals = $pet->meals()->orderBy('scheduled_for')->get();
        return response()->json($meals);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/pets/{pet_id}/meals",
     *     tags={"Meals"},
     *     summary="Cria uma nova refeição para um pet",
     *     description="Agenda uma nova refeição para um pet específico",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pet_id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"food_type","quantity","unit","scheduled_for"},
     *             @OA\Property(property="food_type", type="string", description="Tipo de alimento", example="Ração Premium"),
     *             @OA\Property(property="quantity", type="number", format="float", description="Quantidade do alimento", example=100),
     *             @OA\Property(property="unit", type="string", description="Unidade de medida", example="g"),
     *             @OA\Property(property="scheduled_for", type="string", format="date-time", description="Data e hora agendada", example="2025-05-17T08:00:00Z"),
     *             @OA\Property(property="notes", type="string", description="Observações sobre a refeição", example="Refeição matinal", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Refeição criada com sucesso",
     *         @OA\JsonContent(ref="#/components/schemas/Meal")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erros de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object",
     *                 @OA\Property(property="food_type", type="array", @OA\Items(type="string", example="O tipo de alimento é obrigatório")),
     *                 @OA\Property(property="quantity", type="array", @OA\Items(type="string", example="A quantidade é obrigatória")),
     *                 @OA\Property(property="unit", type="array", @OA\Items(type="string", example="A unidade de medida é obrigatória")),
     *                 @OA\Property(property="scheduled_for", type="array", @OA\Items(type="string", example="A data e hora são obrigatórias"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Pet não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Pet não encontrado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function store(MealRequest $request, Pet $pet): JsonResponse
    {
        $this->authorize('create', [Meal::class, $pet]);
        $meal = $pet->meals()->create($request->validated());
        return response()->json($meal, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/pets/{pet_id}/meals/{meal_id}",
     *     tags={"Meals"},
     *     summary="Retorna os detalhes de uma refeição",
     *     description="Retorna informações detalhadas de uma refeição específica",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pet_id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="meal_id",
     *         in="path",
     *         required=true,
     *         description="ID da refeição",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes da refeição",
     *         @OA\JsonContent(ref="#/components/schemas/Meal")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Refeição não encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Refeição não encontrada")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function show(Pet $pet, Meal $meal): JsonResponse
    {
        $this->authorize('view', $meal);
        return response()->json($meal);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/pets/{pet_id}/meals/{meal_id}",
     *     tags={"Meals"},
     *     summary="Atualiza uma refeição",
     *     description="Atualiza as informações de uma refeição existente",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pet_id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="meal_id",
     *         in="path",
     *         required=true,
     *         description="ID da refeição",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"food_type","quantity","unit","scheduled_for"},
     *             @OA\Property(property="food_type", type="string", description="Tipo de alimento", example="Ração Premium"),
     *             @OA\Property(property="quantity", type="number", format="float", description="Quantidade do alimento", example=90),
     *             @OA\Property(property="unit", type="string", description="Unidade de medida", example="g"),
     *             @OA\Property(property="scheduled_for", type="string", format="date-time", description="Data e hora agendada", example="2025-05-17T08:00:00Z"),
     *             @OA\Property(property="notes", type="string", description="Observações sobre a refeição", example="Alteração de quantidade", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Refeição atualizada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Refeição atualizada com sucesso"),
     *             @OA\Property(property="meal", ref="#/components/schemas/Meal")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erros de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object",
     *                 @OA\Property(property="food_type", type="array", @OA\Items(type="string", example="O tipo de alimento é obrigatório")),
     *                 @OA\Property(property="quantity", type="array", @OA\Items(type="string", example="A quantidade é obrigatória")),
     *                 @OA\Property(property="unit", type="array", @OA\Items(type="string", example="A unidade de medida é obrigatória")),
     *                 @OA\Property(property="scheduled_for", type="array", @OA\Items(type="string", example="A data e hora são obrigatórias"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Refeição não encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Refeição não encontrada")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
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
     * @OA\Delete(
     *     path="/api/v1/pets/{pet_id}/meals/{meal_id}",
     *     tags={"Meals"},
     *     summary="Remove uma refeição",
     *     description="Remove uma refeição existente (soft delete)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pet_id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="meal_id",
     *         in="path",
     *         required=true,
     *         description="ID da refeição",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Refeição removida com sucesso"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Refeição não encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Refeição não encontrada")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function destroy(Pet $pet, Meal $meal): JsonResponse
    {
        $meal->delete();
        return response()->json(null, 204);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/pets/{pet_id}/meals/{meal_id}/consume",
     *     tags={"Meals"},
     *     summary="Marca uma refeição como consumida",
     *     description="Registra que uma refeição foi consumida pelo pet",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pet_id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="meal_id",
     *         in="path",
     *         required=true,
     *         description="ID da refeição",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Refeição marcada como consumida",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Refeição marcada como consumida"),
     *             @OA\Property(property="meal", ref="#/components/schemas/Meal")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Refeição já consumida",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Esta refeição já foi consumida")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Refeição não encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Refeição não encontrada")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
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
