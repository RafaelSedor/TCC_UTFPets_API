<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    protected $model = Location::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->randomElement(['Casa', 'Apartamento', 'Fazenda', 'Sítio', 'Escritório', 'Chácara']) . ' ' . fake()->numberBetween(1, 999),
            'description' => fake()->boolean(70) ? fake()->sentence() : null,
            'timezone' => 'America/Sao_Paulo',
        ];
    }
}

