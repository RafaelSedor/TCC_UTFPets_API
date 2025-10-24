<?php

namespace Database\Factories;

use App\Models\Meal;
use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

class MealFactory extends Factory
{
    protected $model = Meal::class;

    public function definition(): array
    {
        return [
            'pet_id' => Pet::factory(),
            'food_type' => fake()->randomElement(['Ração', 'Ração Úmida', 'Petisco', 'Comida Natural']),
            'quantity' => fake()->randomFloat(2, 50, 500),
            'unit' => 'g',
            'scheduled_for' => fake()->dateTimeBetween('now', '+1 week'),
            'consumed_at' => fake()->optional()->dateTimeBetween('now', '+1 week'),
            'notes' => fake()->optional()->text()
        ];
    }

    public function consumed(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'consumed_at' => now(),
            ];
        });
    }
} 