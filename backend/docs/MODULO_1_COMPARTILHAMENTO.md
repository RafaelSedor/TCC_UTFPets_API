# 📋 Módulo 1 — Compartilhamento de Pets com Papéis

## ✅ Status: **IMPLEMENTADO E TESTADO**

### 🎯 Objetivo
Permitir colaboração entre usuários com diferentes papéis de acesso aos pets:
- **Owner**: Controle total (único por pet)
- **Editor**: Pode criar/editar refeições, visualizar pet
- **Viewer**: Apenas leitura (pet e refeições)

---

## 📊 Estrutura Implementada

### 1. **Banco de Dados**

#### Tabela `shared_pets`
```sql
- id (UUID, Primary Key)
- pet_id (Foreign Key → pets)
- user_id (Foreign Key → users)
- role (ENUM: owner|editor|viewer)
- invitation_status (ENUM: pending|accepted|revoked)
- invited_by (Foreign Key → users)
- created_at, updated_at
- UNIQUE (pet_id, user_id)
- Índices em: user_id, role, invitation_status
```

**Migration**: `2025_10_06_181528_create_shared_pets_table.php`

---

### 2. **Modelos**

#### `SharedPet` (app/Models/SharedPet.php)
- ✅ Relacionamentos: `pet()`, `user()`, `invitedBy()`
- ✅ Scopes: `accepted()`, `pending()`
- ✅ Casts para Enums (SharedPetRole, InvitationStatus)

#### `Pet` (app/Models/Pet.php) - Atualizado
- ✅ `sharedWith()`: Relacionamento HasMany
- ✅ `participants()`: Compartilhamentos aceitos
- ✅ `isSharedWith(User)`: Verifica compartilhamento
- ✅ `getUserRole(User)`: Retorna papel do usuário

---

### 3. **Enums**

#### `SharedPetRole` (app/Enums/SharedPetRole.php)
```php
enum SharedPetRole: string
{
    case OWNER = 'owner';
    case EDITOR = 'editor';
    case VIEWER = 'viewer';
}
```

#### `InvitationStatus` (app/Enums/InvitationStatus.php)
```php
enum InvitationStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case REVOKED = 'revoked';
}
```

---

### 4. **Serviços**

#### `AccessService` (app/Services/AccessService.php)
Centraliza lógica de permissões:
- ✅ `canViewPet(User, Pet)` - Owner, Editor ou Viewer
- ✅ `canEditPet(User, Pet)` - Apenas Owner
- ✅ `canDeletePet(User, Pet)` - Apenas Owner
- ✅ `canManageSharing(User, Pet)` - Apenas Owner
- ✅ `canEditMeals(User, Pet)` - Owner ou Editor

---

### 5. **Policies Atualizadas**

#### `PetPolicy` (app/Policies/PetPolicy.php)
- ✅ Usa `AccessService` para verificar permissões
- ✅ Novo método: `manageSharing()`
- ✅ Considera compartilhamentos em todas as ações

#### `MealPolicy` (app/Policies/MealPolicy.php)
- ✅ Usa `AccessService` para verificar permissões
- ✅ Permite owner e editor gerenciar meals
- ✅ Viewer só pode visualizar

---

### 6. **Endpoints REST**

Todos sob `/api/v1/pets/{pet}/share`:

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/share` | Lista participantes | view pet |
| POST | `/share` | Cria convite | owner |
| POST | `/share/{user}/accept` | Aceita convite | convidado |
| PATCH | `/share/{user}` | Altera papel | owner |
| DELETE | `/share/{user}` | Revoga acesso | owner |

---

### 7. **Validações**

#### `SharePetRequest`
- ✅ Requer `user_id` OU `email`
- ✅ `role` obrigatório (editor|viewer, não permite owner)
- ✅ Valida existência de usuário

#### `UpdateSharedPetRoleRequest`
- ✅ `role` obrigatório (editor|viewer)
- ✅ Não permite alterar para owner

---

### 8. **Eventos**

Todos implementados em `app/Events/`:
- ✅ `SharedPetInvited` - Quando convite é criado
- ✅ `SharedPetAccepted` - Quando convite é aceito
- ✅ `SharedPetRoleChanged` - Quando papel é alterado
- ✅ `SharedPetRemoved` - Quando acesso é revogado

**Uso futuro**: Integração com sistema de notificações

---

### 9. **Testes**

#### `SharedPetTest` (tests/Feature/SharedPetTest.php)
**✅ 14 testes, 22 assertions, 100% passando**

Cobertura:
1. ✅ Owner pode convidar usuário
2. ✅ Pode convidar por email
3. ✅ Não permite convite duplicado
4. ✅ Usuário pode aceitar convite
5. ✅ Apenas convidado pode aceitar
6. ✅ Owner pode alterar papel
7. ✅ Não-owner não pode alterar papel
8. ✅ Owner pode revogar acesso
9. ✅ Editor pode criar refeições
10. ✅ Viewer não pode criar refeições
11. ✅ Viewer pode visualizar pet
12. ✅ Editor não pode deletar pet
13. ✅ Apenas owner pode gerenciar compartilhamento
14. ✅ Lista todos os participantes

---

### 10. **Documentação Swagger**

#### Arquivo OpenAPI: `public/api-docs.json`
- ✅ Documentação completa de todos os endpoints
- ✅ Schemas detalhados (Pet, Meal, SharedPet)
- ✅ Exemplos de valores para testes
- ✅ Descrição de permissões por papel

#### Endpoints Documentados
- ✅ GET /v1/pets/{pet}/share - Listar participantes
- ✅ POST /v1/pets/{pet}/share - Criar convite
- ✅ POST /v1/pets/{pet}/share/{user}/accept - Aceitar convite
- ✅ PATCH /v1/pets/{pet}/share/{user} - Alterar papel
- ✅ DELETE /v1/pets/{pet}/share/{user} - Revogar acesso

#### Swagger UI Externo (Docker)
- ✅ Container separado para Swagger UI
- ✅ Disponível em: http://localhost:8081/swagger
- ✅ Sem problemas de CORS (arquivo montado via volume)

---

## 🔐 Regras de Negócio

### Permissões por Papel

| Ação | Owner | Editor | Viewer |
|------|-------|--------|--------|
| Visualizar pet | ✅ | ✅ | ✅ |
| Editar pet | ✅ | ❌ | ❌ |
| Deletar pet | ✅ | ❌ | ❌ |
| Criar refeição | ✅ | ✅ | ❌ |
| Editar refeição | ✅ | ✅ | ❌ |
| Deletar refeição | ✅ | ✅ | ❌ |
| Marcar como consumido | ✅ | ✅ | ❌ |
| Gerenciar compartilhamento | ✅ | ❌ | ❌ |
| Alterar papéis | ✅ | ❌ | ❌ |

### Regras Especiais
- ✅ **Owner único**: O `user_id` do pet é sempre o owner original
- ✅ **Não pode convidar a si mesmo**
- ✅ **Não pode criar segundo owner**
- ✅ **Apenas convidado pode aceitar**
- ✅ **Convites duplicados retornam 422**
- ✅ **Convites revogados podem ser reenviados**

---

## 📝 Exemplos de Uso

### 1. Criar Convite
```bash
POST /api/v1/pets/1/share
Authorization: Bearer {owner_token}

{
  "user_id": 2,
  "role": "editor"
}

# OU por email
{
  "email": "joao@example.com",
  "role": "viewer"
}
```

**Resposta (201)**:
```json
{
  "message": "Convite enviado com sucesso.",
  "data": {
    "id": "0199bac3-a83f-7050-86ee-ef0f1b7f6ecd",
    "user_id": 2,
    "user_name": "João Silva",
    "user_email": "joao@example.com",
    "role": "editor",
    "invitation_status": "pending",
    "invited_by": {
      "id": 1,
      "name": "Maria Silva"
    },
    "created_at": "2025-10-06T18:15:00.000000Z"
  }
}
```

### 2. Aceitar Convite
```bash
POST /api/v1/pets/1/share/2/accept
Authorization: Bearer {invited_user_token}
```

**Resposta (200)**:
```json
{
  "message": "Convite aceito com sucesso.",
  "data": { ... }
}
```

### 3. Listar Participantes
```bash
GET /api/v1/pets/1/share
Authorization: Bearer {token}
```

**Resposta (200)**:
```json
{
  "data": [
    {
      "user_id": 2,
      "role": "editor",
      "invitation_status": "accepted",
      ...
    }
  ],
  "meta": {
    "total": 1
  }
}
```

---

## 🚀 Próximas Integrações

### Notificações (Módulo Futuro)
Os eventos já estão implementados e prontos para:
- Enviar email ao convidar usuário
- Notificar owner quando convite é aceito
- Alertar quando papel é alterado
- Informar quando acesso é revogado

### Auditoria (Módulo Futuro)
- Histórico de mudanças de papéis
- Log de acessos ao pet compartilhado

---

## 📈 Métricas

- **Arquivos criados**: 11
  - 1 Migration (shared_pets)
  - 1 Model (SharedPet)
  - 2 Enums (SharedPetRole, InvitationStatus)
  - 1 Service (AccessService)
  - 1 Controller (SharedPetController)
  - 2 Form Requests (SharePetRequest, UpdateSharedPetRoleRequest)
  - 4 Events (Invited, Accepted, RoleChanged, Removed)
  - 1 Feature Test (SharedPetTest)
- **Arquivos modificados**: 5
  - Pet.php (model)
  - PetPolicy.php
  - MealPolicy.php
  - MealController.php
  - api.php (routes)
- **Testes**: 31 total (154 assertions, 100% passando)
  - AuthTest: 5 testes
  - MealTest: 6 testes
  - PetTest: 6 testes
  - SharedPetTest: 14 testes
- **Endpoints**: 5 novos
- **Cobertura**: Completa (convites, aceitação, papéis, permissões)

---

## 🔄 Como Usar em Produção

### 1. Executar Migration
```bash
php artisan migrate --force
```

### 2. Acessar Documentação
- Swagger UI: `http://localhost:8081/swagger` (desenvolvimento)
- Arquivo OpenAPI: `public/api-docs.json`
- Seção: **Pet Sharing**

### 3. Testar Localmente
```bash
# Windows
.\scripts\db-setup.ps1 test

# Linux/Mac
./scripts/db-setup.sh test
```

---

## ✅ Critérios de Aceite

| Critério | Status |
|----------|--------|
| Papéis efetivos nas policies | ✅ Implementado |
| Endpoints funcionando | ✅ 100% |
| Convidar/aceitar/remover/alterar papel | ✅ Testado |
| Owner único por pet | ✅ Garantido |
| Validações de negócio | ✅ Completas |
| Eventos disparados | ✅ Implementados |
| Documentação Swagger | ✅ Completa |
| Testes automatizados | ✅ 14 testes passando |

---

## 🎓 Arquivos Relacionados

### Criados
- `database/migrations/2025_10_06_181528_create_shared_pets_table.php`
- `app/Models/SharedPet.php`
- `app/Enums/SharedPetRole.php`
- `app/Enums/InvitationStatus.php`
- `app/Services/AccessService.php`
- `app/Http/Controllers/SharedPetController.php`
- `app/Http/Requests/SharePetRequest.php`
- `app/Http/Requests/UpdateSharedPetRoleRequest.php`
- `app/Events/SharedPetInvited.php`
- `app/Events/SharedPetAccepted.php`
- `app/Events/SharedPetRoleChanged.php`
- `app/Events/SharedPetRemoved.php`
- `tests/Feature/SharedPetTest.php`
- `public/api-docs.json` (documentação OpenAPI completa)

### Modificados
- `app/Models/Pet.php` (adicionados métodos de compartilhamento)
- `app/Policies/PetPolicy.php` (integração com AccessService)
- `app/Policies/MealPolicy.php` (integração com AccessService)
- `app/Http/Controllers/MealController.php` (verificação de permissões)
- `routes/api.php` (5 novas rotas de compartilhamento)
- `docker-compose.yml` (adicionado serviço swagger-ui)

---

## 🔥 Destaques Técnicos

1. **Arquitetura Limpa**: Service Layer separa lógica de negócio
2. **Type Safety**: Enums PHP 8.2 para roles e status
3. **Eventos**: Preparado para notificações futuras
4. **Validações Robustas**: Form Requests com mensagens customizadas
5. **Testes Completos**: 100% de cobertura dos casos de uso
6. **Documentação**: Swagger completo e atualizado
7. **UUID**: IDs únicos para compartilhamentos
8. **Policies Integradas**: Authorization com Laravel Gates

---

## 📚 Documentação da API

Acesse a documentação completa em:
- **Swagger UI**: http://localhost:8081/swagger
- **Arquivo JSON**: http://localhost:8080/api-docs.json
- **Seção**: Pet Sharing

Todos os endpoints incluem:
- Descrição detalhada com exemplos prontos
- Parâmetros obrigatórios/opcionais com valores de teste
- Exemplos de request/response
- Códigos de status HTTP
- Schemas completos (Pet, Meal, SharedPet)

---

## ✨ Melhorias Implementadas

1. **Flexibilidade de Convite**: Por user_id OU email
2. **Reenvio de Convites Revogados**: Convites revogados podem ser reativados
3. **Validação de Duplicidade**: Previne convites duplicados
4. **Eventos Granulares**: 4 eventos distintos para rastreamento
5. **Mensagens Claras**: Respostas descritivas em português
6. **Performance**: Índices otimizados para queries frequentes

---

## 🎉 Resultado Final

**31 testes passando (154 assertions)**

- AuthTest: 5 testes (autenticação JWT)
- MealTest: 6 testes (gerenciamento de refeições)
- PetTest: 6 testes (gerenciamento de pets)
- SharedPetTest: 14 testes (compartilhamento de pets)

**Tempo de execução**: ~32s
**Taxa de sucesso**: 100%

---

## 🚀 Pronto para Produção!

O módulo está completamente funcional, testado e documentado.
Todos os critérios de aceite foram atendidos.

