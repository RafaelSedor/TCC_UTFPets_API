<?php

namespace Database\Factories;

use App\Models\Pet;
use App\Enums\ReminderStatus;
use App\Enums\RepeatRule;
use App\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Reminder>
 */
class ReminderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pet_id' => Pet::factory(),
            'title' => fake()->randomElement([
                'Ração manhã',
                'Ração tarde',
                'Ração noite',
                'Medicação',
                'Banho',
                'Veterinário',
                'Vacina',
            ]),
            'description' => fake()->optional()->sentence(),
            'scheduled_at' => fake()->dateTimeBetween('now', '+30 days'),
            'repeat_rule' => fake()->randomElement(RepeatRule::cases()),
            'status' => fake()->randomElement(ReminderStatus::cases()),
            'channel' => NotificationChannel::DB,
        ];
    }

    /**
     * Indicate that the reminder is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReminderStatus::ACTIVE,
        ]);
    }

    /**
     * Indicate that the reminder is paused.
     */
    public function paused(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReminderStatus::PAUSED,
        ]);
    }

    /**
     * Indicate that the reminder is done.
     */
    public function done(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReminderStatus::DONE,
        ]);
    }

    /**
     * Indicate that the reminder repeats daily.
     */
    public function daily(): static
    {
        return $this->state(fn (array $attributes) => [
            'repeat_rule' => RepeatRule::DAILY,
        ]);
    }

    /**
     * Indicate that the reminder repeats weekly.
     */
    public function weekly(): static
    {
        return $this->state(fn (array $attributes) => [
            'repeat_rule' => RepeatRule::WEEKLY,
        ]);
    }

    /**
     * Indicate that the reminder does not repeat.
     */
    public function once(): static
    {
        return $this->state(fn (array $attributes) => [
            'repeat_rule' => RepeatRule::NONE,
        ]);
    }
}

