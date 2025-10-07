<?php

namespace Database\Factories;

use App\Models\User;
use App\Enums\NotificationStatus;
use App\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->randomElement([
                '🔔 Lembrete: Ração manhã',
                '👋 Novo convite para compartilhar pet',
                '✅ Convite aceito',
                '🔄 Papel alterado',
                '⏰ Hora da medicação',
            ]),
            'body' => fake()->sentence(),
            'data' => [
                'type' => fake()->randomElement(['reminder_due', 'shared_pet_invited', 'shared_pet_accepted']),
                'pet_id' => fake()->numberBetween(1, 100),
            ],
            'channel' => NotificationChannel::DB, // Por padrão, usa DB (in-app)
            'status' => fake()->randomElement(NotificationStatus::cases()),
        ];
    }

    /**
     * Indicate that the notification is queued.
     */
    public function queued(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::QUEUED,
        ]);
    }

    /**
     * Indicate that the notification is sent.
     */
    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::SENT,
        ]);
    }

    /**
     * Indicate that the notification is read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::READ,
        ]);
    }

    /**
     * Indicate that the notification is failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => NotificationStatus::FAILED,
        ]);
    }

    /**
     * Indicate that the notification is in-app.
     */
    public function inApp(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => NotificationChannel::IN_APP,
        ]);
    }
}

