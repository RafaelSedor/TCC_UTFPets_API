# Compartilhamento de Locations

## Visão Geral

O sistema UTFPets agora oferece duas formas de compartilhamento:

1. **Compartilhamento por Location** (Novo) - Compartilha automaticamente todos os pets de uma location
2. **Compartilhamento por Pet Individual** (Existente) - Compartilha apenas um pet específico

Esta funcionalidade facilita significativamente o compartilhamento quando um usuário possui múltiplos animais em uma mesma location (residência, clínica, canil, etc).

## Estrutura de Dados

### Tabela: shared_locations

```sql
CREATE TABLE shared_locations (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role ENUM('owner', 'editor', 'viewer'),
    invitation_status ENUM('pending', 'accepted', 'revoked') DEFAULT 'pending',
    invited_by BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(location_id, user_id)
);
```

### Relacionamentos

```
User (Dono)
    └── Location (Casa, Clínica, etc)
        ├── Pet 1
        ├── Pet 2
        └── Pet 3
        └── SharedLocation (compartilhamentos)
            ├── User A (editor)
            └── User B (viewer)
```

## Hierarquia de Permissões

O sistema verifica permissões na seguinte ordem de prioridade:

1. **Owner Original** - Se `pet.user_id === user.id` → `OWNER` (acesso total)
2. **Compartilhamento Direto do Pet** - Se existe `SharedPet` aceito → Papel específico
3. **Compartilhamento da Location** - Se existe `SharedLocation` aceito → Papel específico
4. **Sem Acesso** - Nenhuma das condições anteriores → `null`

### Exemplo de Verificação

```php
// No modelo Pet
public function getUserRole(User $user): ?SharedPetRole
{
    // 1. Owner original
    if ($this->user_id === $user->id) {
        return SharedPetRole::OWNER;
    }

    // 2. Compartilhamento direto do pet (prioridade)
    $sharedPet = $this->sharedWith()
        ->where('user_id', $user->id)
        ->accepted()
        ->first();

    if ($sharedPet) {
        return $sharedPet->role;
    }

    // 3. Compartilhamento via location
    if ($this->location) {
        $locationRole = $this->location->getUserRole($user);
        if ($locationRole) {
            return $locationRole;
        }
    }

    return null; // Sem acesso
}
```

## API Endpoints

### Listar Participantes de uma Location

**Request:**
```http
GET /api/v1/locations/{location_id}/share
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": [
    {
      "user_id": 2,
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "editor",
      "invitation_status": "accepted",
      "invited_by": 1,
      "created_at": "2025-10-18T12:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "pets_count": 3
  }
}
```

### Compartilhar uma Location

**Request:**
```http
POST /api/v1/locations/{location_id}/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "maria@example.com",
  "role": "editor"
}
```

**Response:**
```json
{
  "message": "Convite enviado com sucesso. O usuário terá acesso a 3 pet(s) desta location.",
  "data": {
    "user_id": 3,
    "role": "editor",
    "invitation_status": "pending",
    "invited_by": 1,
    "pets_count": 3
  }
}
```

### Aceitar Convite de Location

**Request:**
```http
POST /api/v1/locations/{location_id}/share/{user_id}/accept
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Convite aceito com sucesso. Você agora tem acesso a 3 pet(s).",
  "data": {
    "user_id": 3,
    "role": "editor",
    "invitation_status": "accepted",
    "pets_count": 3
  }
}
```

### Alterar Papel de um Participante

**Request:**
```http
PATCH /api/v1/locations/{location_id}/share/{user_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "viewer"
}
```

**Response:**
```json
{
  "message": "Papel atualizado com sucesso.",
  "data": {
    "user_id": 3,
    "role": "viewer",
    "previous_role": "editor"
  }
}
```

### Revogar Acesso

**Request:**
```http
DELETE /api/v1/locations/{location_id}/share/{user_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Acesso revogado com sucesso."
}
```

## Casos de Uso

### Caso 1: Família com Múltiplos Pets

**Cenário:** Maria tem 3 cachorros em casa e quer que seu marido João tenha acesso para editar as refeições.

**Solução:**
```http
POST /api/v1/locations/{casa_id}/share
{
  "email": "joao@example.com",
  "role": "editor"
}
```

**Resultado:** João terá acesso de editor aos 3 cachorros automaticamente.

### Caso 2: Clínica Veterinária

**Cenário:** Dr. Carlos tem uma clínica com 20 animais internados. Precisa dar acesso à sua assistente.

**Solução:**
```http
POST /api/v1/locations/{clinica_id}/share
{
  "email": "assistente@clinica.com",
  "role": "editor"
}
```

**Resultado:** A assistente terá acesso aos 20 animais e qualquer novo animal que entrar na clínica.

### Caso 3: Compartilhamento Misto

**Cenário:** Maria compartilhou a location "Casa" (3 pets) com João como `viewer`. Mas quer que ele tenha permissão de `editor` apenas no cachorro "Rex".

**Solução:**
```http
# 1. Compartilhar a location como viewer
POST /api/v1/locations/{casa_id}/share
{
  "email": "joao@example.com",
  "role": "viewer"
}

# 2. Compartilhar o Rex individualmente como editor
POST /api/v1/pets/{rex_id}/share
{
  "email": "joao@example.com",
  "role": "editor"
}
```

**Resultado:**
- Rex: João tem permissão de `editor` (compartilhamento de pet tem prioridade)
- Outros 2 pets: João tem permissão de `viewer` (herda da location)

## Validações

### Regras de Negócio

1. **Owner não pode ser convidado**: O dono da location não pode receber convite para a própria location
2. **Convite único**: Um usuário não pode ter múltiplos convites para a mesma location
3. **Apenas owner pode compartilhar**: Apenas o dono da location pode enviar convites
4. **Papel owner é exclusivo**: Não é possível convidar usuários com papel "owner"
5. **Aceitação individual**: Apenas o usuário convidado pode aceitar seu próprio convite

### Validação de Dados

```php
// ShareLocationRequest
[
    'user_id' => 'required_without:email|integer|exists:users,id',
    'email' => 'required_without:user_id|email|exists:users,email',
    'role' => 'required|enum:SharedPetRole|not_in:owner',
]
```

## Comparação: Location vs Pet Individual

| Aspecto | Compartilhar Location | Compartilhar Pet |
|---------|----------------------|------------------|
| **Quantidade** | Todos os pets da location | 1 pet específico |
| **Novos pets** | Automaticamente incluídos | Não afeta |
| **Uso ideal** | Múltiplos animais | Pet específico |
| **Prioridade** | Menor | Maior |
| **Exemplos** | Família, clínica, canil | Compartilhar só 1 animal |

## Migrações

### Criação da Tabela

```bash
php artisan migrate
```

O sistema criará automaticamente a tabela `shared_locations` com todos os índices e constraints necessários.

### Rollback

```bash
php artisan migrate:rollback
```

Isso removerá a tabela `shared_locations` e todos os compartilhamentos de location.

## Modelos Eloquent

### SharedLocation

```php
// Relacionamentos
$sharedLocation->location  // Location compartilhada
$sharedLocation->user      // Usuário convidado
$sharedLocation->invitedBy // Usuário que enviou o convite

// Scopes
SharedLocation::accepted()  // Apenas aceitos
SharedLocation::pending()   // Apenas pendentes
SharedLocation::byRole($role) // Por papel específico

// Métodos
$sharedLocation->accept()   // Aceita o convite
$sharedLocation->revoke()   // Revoga o acesso
```

### Location

```php
// Relacionamentos
$location->sharedWith()     // Todos os compartilhamentos
$location->participants()   // Apenas aceitos

// Métodos
$location->isSharedWith($user)      // bool
$location->getUserRole($user)       // SharedPetRole|null
$location->hasAccess($user)         // bool
```

### Pet

```php
// Método atualizado
$pet->getUserRole($user)    // Verifica pet → location → null
$pet->hasAccess($user)      // Verifica owner → pet → location
```

## Testes Recomendados

### 1. Compartilhamento Básico

```php
// Criar location com 3 pets
// Compartilhar location com usuário B como editor
// Verificar se B tem acesso aos 3 pets
// Verificar se B tem papel de editor nos 3 pets
```

### 2. Hierarquia de Permissões

```php
// Compartilhar location com B como viewer
// Compartilhar pet individual com B como editor
// Verificar se B tem editor no pet individual
// Verificar se B tem viewer nos outros pets da location
```

### 3. Novos Pets Adicionados

```php
// Compartilhar location com B
// Adicionar novo pet à location
// Verificar se B automaticamente tem acesso ao novo pet
```

### 4. Revogação

```php
// Compartilhar location com B
// Revogar acesso
// Verificar se B perdeu acesso a todos os pets
```

## Segurança

### Autorização

- Apenas owners da location podem gerenciar compartilhamentos
- Usuários só podem aceitar convites destinados a eles
- Soft delete nas locations cascateia para shared_locations

### Validações de Segurança

```php
// No SharedLocationController
if ($location->user_id !== auth()->id()) {
    abort(403, 'Apenas o dono da location pode compartilhá-la.');
}
```

## Performance

### Índices Criados

```sql
INDEX (user_id)
INDEX (role)
INDEX (invitation_status)
UNIQUE (location_id, user_id)
```

### Otimizações

- Eager loading de relacionamentos (`with(['user:id,name,email'])`)
- Scopes para filtrar status
- Cascade delete para limpeza automática

## Próximos Passos

### Melhorias Futuras

1. **Notificações**: Notificar usuário quando recebe convite de location
2. **Eventos**: Disparar eventos para auditoria
3. **Dashboard**: Visualização de todas as locations compartilhadas
4. **Relatórios**: Estatísticas de compartilhamento

---

**Documentação atualizada em:** 18/10/2025
**Versão da API:** 1.0.0
