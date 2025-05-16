<?php

namespace App\Virtual\Models;

/**
 * @OA\Schema(
 *     title="Pet",
 *     description="Modelo de Pet",
 *     @OA\Xml(name="Pet")
 * )
 */
class Pet
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
    private $user_id;

    /**
     * @OA\Property(example="Rex")
     * @var string
     */
    private $name;

    /**
     * @OA\Property(example="Cachorro")
     * @var string
     */
    private $species;

    /**
     * @OA\Property(example="Labrador")
     * @var string|null
     */
    private $breed;

    /**
     * @OA\Property(format="date", example="2020-01-01")
     * @var string|null
     */
    private $birth_date;

    /**
     * @OA\Property(format="float", example="25.5")
     * @var float|null
     */
    private $weight;

    /**
     * @OA\Property(example="https://res.cloudinary.com/demo/image/upload/v1/pets/dog.jpg")
     * @var string|null
     */
    private $photo;

    /**
     * @OA\Property(example="Cachorro muito dócil")
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