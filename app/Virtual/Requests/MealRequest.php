<?php

namespace App\Virtual\Requests;

/**
 * @OA\Schema(
 *     title="Meal Request",
 *     description="Requisição para criação/atualização de Refeição",
 *     type="object",
 *     required={"food_type", "quantity", "unit", "scheduled_for"}
 * )
 */
class MealRequest
{
    /**
     * @OA\Property(example="Ração Premium")
     * @var string
     */
    public $food_type;

    /**
     * @OA\Property(format="float", example="100.5")
     * @var float
     */
    public $quantity;

    /**
     * @OA\Property(example="g")
     * @var string
     */
    public $unit;

    /**
     * @OA\Property(format="datetime", example="2024-03-21 08:00:00")
     * @var string
     */
    public $scheduled_for;

    /**
     * @OA\Property(format="datetime", example="2024-03-21 08:05:00")
     * @var string|null
     */
    public $consumed_at;

    /**
     * @OA\Property(example="Refeição da manhã")
     * @var string|null
     */
    public $notes;
} 