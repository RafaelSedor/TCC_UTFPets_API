<?php

namespace App\Models;

use App\Enums\SharedPetRole;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/*
|--------------------------------------------------------------------------
| Módulo 09 - Migrações e Relacionamentos
| Este modelo define os relacionamentos com User e Meals, além de implementar
| soft deletes para exclusão lógica dos registros.
*/

class Pet extends Model
{
    use HasFactory, SoftDeletes; // , Auditable;

    protected $fillable = [
        'name',
        'species',
        'breed',
        'birth_date',
        'weight',
        'photo',
        'notes',
        'user_id',
        'location_id'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'weight' => 'float'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function meals(): HasMany
    {
        return $this->hasMany(Meal::class);
    }

    /**
     * Relacionamento com compartilhamentos
     */
    public function sharedWith(): HasMany
    {
        return $this->hasMany(SharedPet::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }

    /**
     * Retorna todos os participantes (incluindo compartilhamentos aceitos)
     */
    public function participants()
    {
        return $this->sharedWith()->accepted();
    }

    /**
     * Verifica se o pet é compartilhado com o usuário
     */
    public function isSharedWith(User $user): bool
    {
        return $this->sharedWith()
            ->where('user_id', $user->id)
            ->accepted()
            ->exists();
    }

    /**
     * Retorna o papel do usuário no pet
     */
    public function getUserRole(User $user): ?SharedPetRole
    {
        // Se é o dono original
        if ($this->user_id === $user->id) {
            return SharedPetRole::OWNER;
        }

        // Se é compartilhado
        $shared = $this->sharedWith()
            ->where('user_id', $user->id)
            ->accepted()
            ->first();

        return $shared ? $shared->role : null;
    }

    /**
     * Extrai o publicId da foto do pet para uso com Cloudinary.
     */
    public function getCloudinaryPublicId(): ?string
    {
        if (!$this->photo) {
            return null;
        }
        // Remove a URL base e extensão, se houver
        $path = parse_url($this->photo, PHP_URL_PATH);
        $filename = pathinfo($path, PATHINFO_FILENAME);
        // Se a foto estiver em subpastas, Cloudinary espera o caminho relativo
        $dirname = trim(pathinfo($path, PATHINFO_DIRNAME), '/');
        return $dirname ? $dirname . '/' . $filename : $filename;
    }
} 