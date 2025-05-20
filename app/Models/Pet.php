<?php

namespace App\Models;

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
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'species',
        'breed',
        'birth_date',
        'weight',
        'photo',
        'notes',
        'user_id'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'weight' => 'float'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function meals(): HasMany
    {
        return $this->hasMany(Meal::class);
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