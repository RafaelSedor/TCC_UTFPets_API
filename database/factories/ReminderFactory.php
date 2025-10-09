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
            'status' => ReminderStatus::ACTIVE, // Sempre começa como active
            'channel' => fake()->randomElement([NotificationChannel::PUSH, NotificationChannel::EMAIL]),
            'days_of_week' => null, // Default null para evitar problemas
            'timezone_override' => null,
            'snooze_minutes_default' => 0,
            'active_window_start' => null,
            'active_window_end' => null,
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
     * Indicate that the reminder is completed (alias for done).
     */
    public function completed(): static
    {
        return $this->done();
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
    
    /**
     * Reminder with specific days of week (weekdays).
     */
    public function weekdays(): static
    {
        return $this->state(fn (array $attributes) => [
            'days_of_week' => ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        ]);
    }
    
    /**
     * Reminder with active window (business hours).
     */
    public function businessHours(): static
    {
        return $this->state(fn (array $attributes) => [
            'active_window_start' => '08:00',
            'active_window_end' => '18:00',
        ]);
    }
    
    /**
     * Reminder with push channel.
     */
    public function push(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => NotificationChannel::PUSH,
        ]);
    }
    
    /**
     * Reminder with email channel.
     */
    public function email(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => NotificationChannel::EMAIL,
        ]);
    }
}

