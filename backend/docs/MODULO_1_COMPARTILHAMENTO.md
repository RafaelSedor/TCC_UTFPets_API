# Módulo 1 — Compartilhamento de Pets com Papéis

## Objetivo

Permitir colaboração entre usuários com diferentes papéis de acesso aos pets:
- **Owner**: Controle total (único por pet)
- **Editor**: Pode criar/editar refeições, visualizar pet
- **Viewer**: Apenas leitura (pet e refeições)

Esta arquitetura foi escolhida para permitir flexibilidade no gerenciamento colaborativo de pets, especialmente útil em cenários como famílias, clínicas veterinárias ou pet-sitters compartilhando responsabilidades.

## Arquitetura Implementada

### Sistema de Papéis Baseado em Enums

Utilizou-se **PHP 8.2 Enums** para garantir type-safety e prevenir valores inválidos:

```php
enum SharedPetRole: string {
    case OWNER = 'owner';
    case EDITOR = 'editor';
    case VIEWER = 'viewer';
}

enum InvitationStatus: string {
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case REVOKED = 'revoked';
}
```

**Justificativa**: Enums garantem validação em nível de tipo, reduzindo erros de runtime e melhorando a manutenibilidade do código.

### Service Layer para Lógica de Permissões

Implementou-se `AccessService` para centralizar toda lógica de permissões:

```php
class AccessService {
    public function canViewPet(User $user, Pet $pet): bool
    public function canEditPet(User $user, Pet $pet): bool
    public function canManageSharing(User $user, Pet $pet): bool
    public function canEditMeals(User $user, Pet $pet): bool
}
```

**Justificativa**: Centralizar a lógica de permissões em um serviço facilita manutenção, testes e reutilização. Evita duplicação de código nas Policies e Controllers.

### Event-Driven Architecture

O sistema dispara eventos para cada ação de compartilhamento:

- `SharedPetInvited` - Quando convite é criado
- `SharedPetAccepted` - Quando convite é aceito
- `SharedPetRoleChanged` - Quando papel é alterado
- `SharedPetRemoved` - Quando acesso é revogado

**Justificativa**: Desacopla a lógica de notificações da lógica de negócio. Permite adicionar novos listeners (email, push notifications) sem modificar o código existente, seguindo o princípio Open/Closed do SOLID.

### Matriz de Permissões

| Ação | Owner | Editor | Viewer |
|------|-------|--------|--------|
| Visualizar pet | ✅ | ✅ | ✅ |
| Editar pet | ✅ | ❌ | ❌ |
| Deletar pet | ✅ | ❌ | ❌ |
| Criar refeição | ✅ | ✅ | ❌ |
| Editar refeição | ✅ | ✅ | ❌ |
| Deletar refeição | ✅ | ✅ | ❌ |
| Gerenciar compartilhamento | ✅ | ❌ | ❌ |

**Justificativa**: O modelo de três papéis equilibra flexibilidade e segurança. Owner mantém controle total, Editor pode auxiliar no cuidado diário (alimentação), e Viewer permite consulta sem riscos de modificação acidental.

## Decisões Técnicas

### UUID para Compartilhamentos

Utiliza-se UUID em vez de auto-increment para IDs de `shared_pets`:

**Justificativa**: UUIDs previnem enumeration attacks e facilitam sincronização futura entre múltiplos ambientes/databases sem conflitos de IDs.

### Owner Único

O owner original (criador do pet) nunca perde esse papel - não pode ser transferido:

**Justificativa**: Garante que sempre exista um responsável final pelo pet. Previne cenários onde todos os usuários se removem e o pet fica "órfão" no sistema.

### Convites vs. Acesso Direto

O sistema usa convites (pending) que devem ser aceitos, em vez de adicionar usuários diretamente:

**Justificativa**: Respeita a privacidade do usuário - ninguém é adicionado sem consentimento. Previne spam e adiciona transparência ao processo.

### Integração com Laravel Policies

O `AccessService` é consumido pelas Policies do Laravel (`PetPolicy`, `MealPolicy`):

**Justificativa**: Aproveita o sistema nativo de autorização do Laravel, permitindo uso de `@can` em Blade e `$this->authorize()` em controllers, mantendo consistência com o framework.

## API RESTful

Endpoints sob `/api/v1/pets/{pet}/share`:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/share` | Lista participantes |
| POST | `/share` | Cria convite |
| POST | `/share/{user}/accept` | Aceita convite |
| PATCH | `/share/{user}` | Altera papel |
| DELETE | `/share/{user}` | Revoga acesso |

**Justificativa**: A estrutura RESTful nested (pets/{pet}/share) reflete a hierarquia real: compartilhamentos pertencem a um pet específico. Facilita entendimento e uso da API.

## Testes e Qualidade

**14 testes automatizados** cobrem todos os casos de uso e permissões:
- Criação de convites (por user_id e email)
- Aceitação e recusa
- Mudança de papéis
- Revogação de acesso
- Verificação de permissões por papel
- Validações de negócio

**Justificativa**: Testes automatizados garantem que mudanças futuras não quebrem as regras de permissão, críticas para a segurança do sistema.

## Arquivos Relacionados

### Criados
- `database/migrations/2025_10_06_181528_create_shared_pets_table.php`
- `app/Models/SharedPet.php`
- `app/Enums/SharedPetRole.php`
- `app/Enums/InvitationStatus.php`
- `app/Services/AccessService.php`
- `app/Http/Controllers/SharedPetController.php`
- `app/Events/SharedPet*.php` (4 eventos)
- `tests/Feature/SharedPetTest.php`

### Modificados
- `app/Models/Pet.php` - Relacionamento `sharedWith()`
- `app/Policies/PetPolicy.php` - Integração com AccessService
- `app/Policies/MealPolicy.php` - Integração com AccessService
- `routes/api.php` - 5 novas rotas
