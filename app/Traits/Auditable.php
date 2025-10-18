<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Log;

trait Auditable
{
    /**
     * Boot do trait - registra observers
     */
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            $model->auditEvent('created', $model->toArray());
        });

        static::updated(function ($model) {
            $changes = $model->getChanges();
            $original = $model->getOriginal();
            
            $diff = [
                'before' => array_intersect_key($original, $changes),
                'after' => $changes,
            ];
            
            $model->auditEvent('updated', $diff);
        });

        static::deleted(function ($model) {
            $model->auditEvent('deleted', $model->toArray());
        });
    }

    /**
     * Registra um evento de auditoria
     */
    protected function auditEvent(string $event, array $payload = [])
    {
        $entityName = $this->getEntityName();
        $action = "{$entityName}.{$event}";

        // Remove campos sensíveis do payload
        $sanitizedPayload = $this->sanitizePayload($payload);

        // Cria registro no banco
        $audit = AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => $entityName,
            'entity_id' => (string)$this->getKey(),
            'new_values' => $sanitizedPayload,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);

        // Registra no arquivo de log
        Log::channel('audit')->info($action, [
            'audit_id' => $audit->id,
            'user_id' => $audit->user_id,
            'entity' => $entityName,
            'entity_id' => $this->getKey(),
            'ip' => $audit->ip,
            'payload' => $sanitizedPayload,
        ]);

        return $audit;
    }

    /**
     * Registra evento customizado de auditoria
     */
    public function auditCustomEvent(string $event, array $payload = [])
    {
        $entityName = $this->getEntityName();
        $action = "{$entityName}.{$event}";

        $sanitizedPayload = $this->sanitizePayload($payload);

        $audit = AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => $entityName,
            'entity_id' => (string)$this->getKey(),
            'new_values' => $sanitizedPayload,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);

        Log::channel('audit')->info($action, [
            'audit_id' => $audit->id,
            'user_id' => $audit->user_id,
            'entity' => $entityName,
            'entity_id' => $this->getKey(),
            'ip' => $audit->ip,
            'payload' => $sanitizedPayload,
        ]);

        return $audit;
    }

    /**
     * Obtém o nome da entidade
     */
    protected function getEntityName(): string
    {
        return strtolower(class_basename($this));
    }

    /**
     * Remove campos sensíveis do payload
     */
    protected function sanitizePayload(array $payload): array
    {
        $sensitiveFields = ['password', 'remember_token', 'api_token'];
        
        foreach ($sensitiveFields as $field) {
            unset($payload[$field]);
            if (isset($payload['before'])) {
                unset($payload['before'][$field]);
            }
            if (isset($payload['after'])) {
                unset($payload['after'][$field]);
            }
        }

        return $payload;
    }
}

