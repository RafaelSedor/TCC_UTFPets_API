<?php

namespace App\Models;

use App\Enums\SharedPetRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'timezone',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Relacionamento com User (dono do local)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relacionamento com Pets (pets neste local)
     */
    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class);
    }

    /**
     * Scope para filtrar locations de um usuário específico
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Verifica se o local pertence ao usuário
     */
    public function belongsToUser(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    /**
     * Relacionamento com compartilhamentos (SharedLocation)
     */
    public function sharedWith(): HasMany
    {
        return $this->hasMany(SharedLocation::class);
    }

    /**
     * Retorna todos os participantes com acesso aceito à location
     */
    public function participants()
    {
        return $this->sharedWith()->accepted();
    }

    /**
     * Verifica se a location é compartilhada com o usuário
     */
    public function isSharedWith(User $user): bool
    {
        return $this->sharedWith()
            ->where('user_id', $user->id)
            ->accepted()
            ->exists();
    }

    /**
     * Retorna o papel do usuário na location
     */
    public function getUserRole(User $user): ?SharedPetRole
    {
        // Se é o dono original da location
        if ($this->user_id === $user->id) {
            return SharedPetRole::OWNER;
        }

        // Se a location é compartilhada com o usuário
        $shared = $this->sharedWith()
            ->where('user_id', $user->id)
            ->accepted()
            ->first();

        return $shared ? $shared->role : null;
    }

    /**
     * Verifica se o usuário tem acesso à location (dono ou compartilhado)
     */
    public function hasAccess(User $user): bool
    {
        return $this->belongsToUser($user) || $this->isSharedWith($user);
    }
}

