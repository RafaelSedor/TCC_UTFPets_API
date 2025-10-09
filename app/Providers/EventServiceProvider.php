<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\SharedPetInvited;
use App\Events\SharedPetAccepted;
use App\Events\SharedPetRoleChanged;
use App\Events\SharedPetRemoved;
use App\Listeners\SendSharedPetNotification;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        SharedPetInvited::class => [
            SendSharedPetNotification::class . '@handleInvited',
        ],
        SharedPetAccepted::class => [
            SendSharedPetNotification::class . '@handleAccepted',
        ],
        SharedPetRoleChanged::class => [
            SendSharedPetNotification::class . '@handleRoleChanged',
        ],
        SharedPetRemoved::class => [
            SendSharedPetNotification::class . '@handleRemoved',
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
} 