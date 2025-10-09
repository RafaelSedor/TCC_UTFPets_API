<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Audit extends Model
{
    const UPDATED_AT = null; // Audits não têm updated_at

    protected $fillable = [
        'user_id',
        'action',
        'entity',
        'entity_id',
        'payload',
        'ip',
        'user_agent',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Relacionamento com User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para filtrar por ação
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope para filtrar por entidade
     */
    public function scopeByEntity($query, $entity)
    {
        return $query->where('entity', $entity);
    }

    /**
     * Scope para filtrar por usuário
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para filtrar por período
     */
    public function scopeDateRange($query, $from, $to)
    {
        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }
        return $query;
    }
}

