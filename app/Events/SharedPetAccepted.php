<?php

namespace App\Events;

use App\Models\SharedPet;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SharedPetAccepted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public SharedPet $sharedPet;

    /**
     * Create a new event instance.
     */
    public function __construct(SharedPet $sharedPet)
    {
        $this->sharedPet = $sharedPet;
    }
}

