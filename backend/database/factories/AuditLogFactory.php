<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditLog>
 */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'action' => fake()->randomElement(['created', 'updated', 'deleted', 'accessed', 'login', 'logout']),
            'entity_type' => fake()->randomElement(['User', 'Pet', 'Meal', 'Reminder', 'Notification']),
            'entity_id' => (string)fake()->numberBetween(1, 1000),
            'old_values' => fake()->boolean(50) ? ['name' => fake()->name(), 'email' => fake()->email()] : null,
            'new_values' => fake()->boolean(70) ? ['name' => fake()->name(), 'email' => fake()->email()] : null,
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}

