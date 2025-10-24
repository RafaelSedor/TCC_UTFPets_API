<?php

namespace App\Listeners;

use App\Events\SharedPetInvited;
use App\Events\SharedPetAccepted;
use App\Events\SharedPetRoleChanged;
use App\Events\SharedPetRemoved;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendSharedPetNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Handle SharedPetInvited event.
     */
    public function handleInvited(SharedPetInvited $event): void
    {
        $sharedPet = $event->sharedPet;
        $inviter = $event->inviter;

        $this->notificationService->queue(
            user: $sharedPet->user,
            title: "👋 Novo convite para compartilhar pet",
            body: "{$inviter->name} convidou você para ser {$sharedPet->role->value} do pet {$sharedPet->pet->name}",
            data: [
                'type' => 'shared_pet_invited',
                'shared_pet_id' => $sharedPet->id,
                'pet_id' => $sharedPet->pet_id,
                'inviter_id' => $inviter->id,
                'role' => $sharedPet->role->value,
            ]
        );
    }

    /**
     * Handle SharedPetAccepted event.
     */
    public function handleAccepted(SharedPetAccepted $event): void
    {
        $sharedPet = $event->sharedPet;
        $accepter = $event->user;
        $owner = $sharedPet->pet->user;

        $this->notificationService->queue(
            user: $owner,
            title: "✅ Convite aceito",
            body: "{$accepter->name} aceitou o convite para ser {$sharedPet->role->value} do pet {$sharedPet->pet->name}",
            data: [
                'type' => 'shared_pet_accepted',
                'shared_pet_id' => $sharedPet->id,
                'pet_id' => $sharedPet->pet_id,
                'accepter_id' => $accepter->id,
                'role' => $sharedPet->role->value,
            ]
        );
    }

    /**
     * Handle SharedPetRoleChanged event.
     */
    public function handleRoleChanged(SharedPetRoleChanged $event): void
    {
        $sharedPet = $event->sharedPet;

        $this->notificationService->queue(
            user: $sharedPet->user,
            title: "🔄 Papel alterado",
            body: "Seu papel no pet {$sharedPet->pet->name} foi alterado de {$event->oldRole->value} para {$event->newRole->value}",
            data: [
                'type' => 'shared_pet_role_changed',
                'shared_pet_id' => $sharedPet->id,
                'pet_id' => $sharedPet->pet_id,
                'old_role' => $event->oldRole->value,
                'new_role' => $event->newRole->value,
            ]
        );
    }

    /**
     * Handle SharedPetRemoved event.
     */
    public function handleRemoved(SharedPetRemoved $event): void
    {
        $sharedPet = $event->sharedPet;

        $this->notificationService->queue(
            user: $sharedPet->user,
            title: "❌ Acesso revogado",
            body: "Seu acesso ao pet {$sharedPet->pet->name} foi revogado",
            data: [
                'type' => 'shared_pet_removed',
                'pet_id' => $sharedPet->pet_id,
            ]
        );
    }
}

