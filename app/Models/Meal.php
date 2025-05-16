<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/*
|--------------------------------------------------------------------------
| Módulo 09 - Migrações e Relacionamentos
| Este modelo define o relacionamento com Pet e implementa soft deletes
| para exclusão lógica dos registros.
*/

class Meal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pet_id',
        'food_type',
        'quantity',
        'unit',
        'scheduled_for',
        'consumed_at',
        'notes'
    ];

    protected $casts = [
        'quantity' => 'float',
        'scheduled_for' => 'datetime',
        'consumed_at' => 'datetime'
    ];

    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }
} 