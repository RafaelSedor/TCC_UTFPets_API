<?php

namespace App\Virtual\Requests;

/**
 * @OA\Schema(
 *     title="Pet Request",
 *     description="Requisição para criação/atualização de Pet",
 *     type="object",
 *     required={"name", "species"}
 * )
 */
class PetRequest
{
    /**
     * @OA\Property(example="Rex")
     * @var string
     */
    public $name;

    /**
     * @OA\Property(example="Cachorro")
     * @var string
     */
    public $species;

    /**
     * @OA\Property(example="Labrador")
     * @var string|null
     */
    public $breed;

    /**
     * @OA\Property(format="date", example="2020-01-01")
     * @var string|null
     */
    public $birth_date;

    /**
     * @OA\Property(format="float", example="25.5")
     * @var float|null
     */
    public $weight;

    /**
     * @OA\Property(format="binary")
     * @var string|null
     */
    public $photo;

    /**
     * @OA\Property(example="Cachorro muito dócil")
     * @var string|null
     */
    public $notes;
} 