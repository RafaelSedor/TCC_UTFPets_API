<?php

namespace Database\Factories;

use App\Models\Pet;
use App\Models\User;
use App\Models\SharedPet;
use App\Enums\SharedPetRole;
use App\Enums\InvitationStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SharedPet>
 */
class SharedPetFactory extends Factory
{
    protected $model = SharedPet::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pet_id' => Pet::factory(),
            'user_id' => User::factory(),
            'role' => fake()->randomElement([SharedPetRole::EDITOR, SharedPetRole::VIEWER]),
            'invitation_status' => InvitationStatus::PENDING,
            'invited_by' => User::factory(),
        ];
    }

    /**
     * Estado: convite aceito
     */
    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'invitation_status' => InvitationStatus::ACCEPTED,
        ]);
    }

    /**
     * Estado: convite pendente
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'invitation_status' => InvitationStatus::PENDING,
        ]);
    }

    /**
     * Estado: acesso revogado
     */
    public function revoked(): static
    {
        return $this->state(fn (array $attributes) => [
            'invitation_status' => InvitationStatus::REVOKED,
        ]);
    }

    /**
     * Estado: papel de editor
     */
    public function editor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => SharedPetRole::EDITOR,
        ]);
    }

    /**
     * Estado: papel de viewer
     */
    public function viewer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => SharedPetRole::VIEWER,
        ]);
    }
}

