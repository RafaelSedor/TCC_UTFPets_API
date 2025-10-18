<?php

namespace Database\Factories;

use App\Models\Pet;
use App\Models\User;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class PetFactory extends Factory
{
    protected $model = Pet::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'location_id' => null,
            'name' => fake()->firstName(),
            'species' => fake()->randomElement(['Cachorro', 'Gato', 'Pássaro', 'Coelho', 'Hamster']),
            'breed' => fake()->word(),
            'birth_date' => fake()->date(),
            'weight' => fake()->randomFloat(2, 0.1, 100),
            'photo' => fake()->imageUrl(),
            'notes' => fake()->optional()->text()
        ];
    }
} 