<?php

namespace App\Virtual\Models;

/**
 * @OA\Schema(
 *     title="Meal",
 *     description="Modelo de Refeição",
 *     @OA\Xml(name="Meal")
 * )
 */
class Meal
{
    /**
     * @OA\Property(format="int64")
     * @var integer
     */
    private $id;

    /**
     * @OA\Property(format="int64")
     * @var integer
     */
    private $pet_id;

    /**
     * @OA\Property(example="Ração Premium")
     * @var string
     */
    private $food_type;

    /**
     * @OA\Property(format="float", example="100.5")
     * @var float
     */
    private $quantity;

    /**
     * @OA\Property(example="g")
     * @var string
     */
    private $unit;

    /**
     * @OA\Property(format="datetime", example="2024-03-21 08:00:00")
     * @var string
     */
    private $scheduled_for;

    /**
     * @OA\Property(format="datetime", example="2024-03-21 08:05:00")
     * @var string|null
     */
    private $consumed_at;

    /**
     * @OA\Property(example="Refeição da manhã")
     * @var string|null
     */
    private $notes;

    /**
     * @OA\Property(format="datetime", example="2024-03-20 10:00:00")
     * @var string
     */
    private $created_at;

    /**
     * @OA\Property(format="datetime", example="2024-03-20 10:00:00")
     * @var string
     */
    private $updated_at;

    /**
     * @OA\Property(format="datetime", example="2024-03-20 10:00:00")
     * @var string|null
     */
    private $deleted_at;
} 