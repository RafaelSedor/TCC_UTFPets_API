<?php

namespace App\Events;

use App\Models\SharedPet;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SharedPetAccepted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public SharedPet $sharedPet;
    public User $user;

    /**
     * Create a new event instance.
     */
    public function __construct(SharedPet $sharedPet, User $user)
    {
        $this->sharedPet = $sharedPet;
        $this->user = $user;
    }
}
