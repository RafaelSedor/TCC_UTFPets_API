# Módulo 6 — Migração para UUID (compatível)

## 📋 Visão Geral

O **Módulo 6** implementa uma estratégia de migração gradual de chaves primárias de `BIGINT` para `UUID`, mantendo total compatibilidade com a aplicação existente. Este módulo garante que nenhuma funcionalidade seja quebrada durante a transição.

## 🎯 Objetivos

- **Migração Segura**: Transição sem downtime ou quebra de funcionalidade
- **Compatibilidade**: Manter ambas as chaves durante a transição
- **Escalabilidade**: Preparar para sistemas distribuídos
- **Segurança**: IDs não sequenciais e não previsíveis

## 🏗️ Estratégia de Migração (Etapas)

### **Etapa 1: Adicionar Colunas UUID Paralelas**

```sql
ALTER TABLE users ADD COLUMN uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE pets ADD COLUMN uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE meals ADD COLUMN uuid UUID DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX idx_users_uuid ON users(uuid);
CREATE UNIQUE INDEX idx_pets_uuid ON pets(uuid);
CREATE UNIQUE INDEX idx_meals_uuid ON meals(uuid);
```

### **Etapa 2: Popular UUIDs Existentes**

```php
php artisan uuid:populate users
php artisan uuid:populate pets
php artisan uuid:populate meals
```

### **Etapa 3: Adicionar FKs UUID Paralelas**

```sql
ALTER TABLE pets ADD COLUMN user_uuid UUID;
ALTER TABLE meals ADD COLUMN pet_uuid UUID;

UPDATE pets SET user_uuid = (SELECT uuid FROM users WHERE users.id = pets.user_id);
UPDATE meals SET pet_uuid = (SELECT uuid FROM pets WHERE pets.id = meals.pet_id);
```

### **Etapa 4: Ajustar Models**

```php
class Pet extends Model
{
    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_uuid', 'uuid');
    }
}
```

### **Etapa 5: Remover Chaves Antigas (Pós-validação)**

```sql
-- Após validar em produção por pelo menos 1 semana
ALTER TABLE pets DROP CONSTRAINT pets_user_id_foreign;
ALTER TABLE meals DROP CONSTRAINT meals_pet_id_foreign;

ALTER TABLE pets DROP COLUMN user_id;
ALTER TABLE meals DROP COLUMN pet_id;

ALTER TABLE users DROP COLUMN id;
ALTER TABLE pets DROP COLUMN id;
ALTER TABLE meals DROP COLUMN id;
```

## 📊 Status Atual

### **✅ Implementado**
- `shared_pets` table - **Já usa UUID**
- `reminders` table - **Já usa UUID**
- `notifications` table - **Já usa UUID**
- `audit_logs` table - **Já usa UUID**
- `audits` table - **Já usa UUID**

### **⏳ Pendente**
- `users` table - **Ainda usa BIGINT**
- `pets` table - **Ainda usa BIGINT**
- `meals` table - **Ainda usa BIGINT**

## 🔧 Comando Artisan

### **PopulateUuidsCommand**

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PopulateUuidsCommand extends Command
{
    protected $signature = 'uuid:populate {table}';
    protected $description = 'Popula UUIDs em tabela especificada';

    public function handle()
    {
        $table = $this->argument('table');
        
        $count = DB::table($table)
            ->whereNull('uuid')
            ->update(['uuid' => DB::raw('gen_random_uuid()')]);

        $this->info("✅ {$count} registros atualizados em {$table}");
    }
}
```

## 🎯 Critérios de Aceite

### **✅ Durante Transição**
- [x] Nenhuma rota quebra
- [x] Novos registros já usam UUID (shared_pets, reminders, notifications)
- [x] Testes continuam passando
- [x] API mantém compatibilidade

### **⏳ Após Migração Completa**
- [ ] Todas as tabelas usam UUID como PK
- [ ] Relacionamentos usam UUID nas FKs
- [ ] Performance mantida ou melhorada
- [ ] Documentação atualizada

## 📈 Benefícios

### **Segurança**
- ✅ IDs não previsíveis
- ✅ Dificulta enumeração
- ✅ Melhor para APIs públicas

### **Escalabilidade**
- ✅ Permite sistemas distribuídos
- ✅ Merges sem conflitos
- ✅ Replicação facilitada

### **Compliance**
- ✅ Padrão industry-standard
- ✅ Compatível com microservices
- ✅ Facilita integrações

## 🚧 Notas de Implementação

**Status Atual**: O sistema está em **migração parcial para UUID**:

- **Tabelas novas (Módulos 1-5)**: Já usam UUID desde a criação
- **Tabelas legadas (users, pets, meals)**: Ainda usam BIGINT

**Próximos Passos**:
1. Adicionar colunas `uuid` paralelas
2. Popular com `gen_random_uuid()`
3. Atualizar aplicação para usar UUID
4. Remover colunas antigas após validação

**Recomendação**: Executar migração em janela de manutenção ou gradualmente com feature flags.

## 📚 Documentação Relacionada

- [Módulo 4 - Admin](MODULO_4_ADMIN.md)
- [Módulo 5 - Auditoria](MODULO_5_AUDITORIA.md)
- [README Principal](../README.md)

---

## 🏆 Status: **EM PROGRESSO**

**Tabelas novas com UUID** ✅  
**Comando de população criado** ✅  
**Trait preparado** ✅  
**Migração gradual planejada** ✅

