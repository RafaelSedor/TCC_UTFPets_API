<?php

namespace App\Events;

use App\Models\SharedPet;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SharedPetInvited
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public SharedPet $sharedPet;
    public User $inviter;

    /**
     * Create a new event instance.
     */
    public function __construct(SharedPet $sharedPet, User $inviter)
    {
        $this->sharedPet = $sharedPet;
        $this->inviter = $inviter;
    }
}
