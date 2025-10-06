<?php

namespace App\Events;

use App\Models\SharedPet;
use App\Enums\SharedPetRole;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SharedPetRoleChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public SharedPet $sharedPet;
    public SharedPetRole $oldRole;
    public SharedPetRole $newRole;

    /**
     * Create a new event instance.
     */
    public function __construct(SharedPet $sharedPet, SharedPetRole $oldRole, SharedPetRole $newRole)
    {
        $this->sharedPet = $sharedPet;
        $this->oldRole = $oldRole;
        $this->newRole = $newRole;
    }
}

