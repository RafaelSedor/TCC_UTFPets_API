<?php

namespace App\Events;

use App\Models\SharedPet;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SharedPetRemoved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public SharedPet $sharedPet;
    public ?User $revoker = null;

    /**
     * Create a new event instance.
     */
    public function __construct(SharedPet $sharedPet, ?User $revoker = null)
    {
        $this->sharedPet = $sharedPet;
        $this->revoker = $revoker;
    }
}
