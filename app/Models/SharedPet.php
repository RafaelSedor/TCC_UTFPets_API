<?php

namespace App\Models;

use App\Enums\InvitationStatus;
use App\Enums\SharedPetRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SharedPet extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'pet_id',
        'user_id',
        'role',
        'invitation_status',
        'invited_by',
    ];

    protected $casts = [
        'role' => SharedPetRole::class,
        'invitation_status' => InvitationStatus::class,
    ];

    /**
     * Relacionamento com Pet
     */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    /**
     * Relacionamento com User (participante)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relacionamento com User (convidador)
     */
    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Scope para buscar apenas convites aceitos
     */
    public function scopeAccepted($query)
    {
        return $query->where('invitation_status', InvitationStatus::ACCEPTED);
    }

    /**
     * Scope para buscar apenas convites pendentes
     */
    public function scopePending($query)
    {
        return $query->where('invitation_status', InvitationStatus::PENDING);
    }

    /**
     * Scope para buscar por papel
     */
    public function scopeByRole($query, SharedPetRole $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Aceita o convite
     */
    public function accept(): bool
    {
        $this->invitation_status = InvitationStatus::ACCEPTED;
        return $this->save();
    }

    /**
     * Revoga o acesso
     */
    public function revoke(): bool
    {
        $this->invitation_status = InvitationStatus::REVOKED;
        return $this->save();
    }

    /**
     * Verifica se o usuário pode aceitar o convite
     */
    public function canBeAcceptedBy(User $user): bool
    {
        return $this->user_id === $user->id 
            && $this->invitation_status === InvitationStatus::PENDING;
    }
}

