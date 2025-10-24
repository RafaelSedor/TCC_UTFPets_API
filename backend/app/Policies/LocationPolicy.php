<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;

class LocationPolicy
{
    /**
     * Determine if the user can view any locations.
     */
    public function viewAny(User $user): bool
    {
        return true; // Usuário pode ver suas próprias locations
    }

    /**
     * Determine if the user can view the location.
     */
    public function view(User $user, Location $location): bool
    {
        return $location->user_id === $user->id;
    }

    /**
     * Determine if the user can create locations.
     */
    public function create(User $user): bool
    {
        return true; // Qualquer usuário autenticado pode criar locations
    }

    /**
     * Determine if the user can update the location.
     */
    public function update(User $user, Location $location): bool
    {
        return $location->user_id === $user->id;
    }

    /**
     * Determine if the user can delete the location.
     */
    public function delete(User $user, Location $location): bool
    {
        return $location->user_id === $user->id;
    }
}

