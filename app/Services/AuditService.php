<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Registra uma ação de auditoria
     *
     * @param string $action created, updated, deleted, accessed, etc
     * @param string $entityType User, Pet, Meal, etc
     * @param string|null $entityId ID da entidade
     * @param array|null $oldValues Valores antigos (para updates)
     * @param array|null $newValues Valores novos
     * @param User|null $user Usuário que realizou a ação (null para sistema)
     * @return AuditLog
     */
    public static function log(
        string $action,
        string $entityType,
        ?string $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $user = null
    ): AuditLog {
        // Se o usuário não for passado, tenta pegar o usuário autenticado
        $userId = $user?->id ?? auth()->id();

        return AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Registra criação de entidade
     */
    public static function logCreated(string $entityType, string $entityId, array $values, ?User $user = null): AuditLog
    {
        return self::log('created', $entityType, $entityId, null, $values, $user);
    }

    /**
     * Registra atualização de entidade
     */
    public static function logUpdated(string $entityType, string $entityId, array $oldValues, array $newValues, ?User $user = null): AuditLog
    {
        return self::log('updated', $entityType, $entityId, $oldValues, $newValues, $user);
    }

    /**
     * Registra deleção de entidade
     */
    public static function logDeleted(string $entityType, string $entityId, array $oldValues, ?User $user = null): AuditLog
    {
        return self::log('deleted', $entityType, $entityId, $oldValues, null, $user);
    }

    /**
     * Registra acesso a entidade
     */
    public static function logAccessed(string $entityType, string $entityId, ?User $user = null): AuditLog
    {
        return self::log('accessed', $entityType, $entityId, null, null, $user);
    }

    /**
     * Registra login de usuário
     */
    public static function logLogin(User $user): AuditLog
    {
        return self::log('login', 'User', (string)$user->id, null, ['email' => $user->email], $user);
    }

    /**
     * Registra logout de usuário
     */
    public static function logLogout(User $user): AuditLog
    {
        return self::log('logout', 'User', (string)$user->id, null, null, $user);
    }
}

