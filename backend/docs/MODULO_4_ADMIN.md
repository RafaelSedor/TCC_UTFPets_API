# Módulo 4 — Admin (Gestão e Auditoria)

## Objetivo

Implementar painel administrativo completo para gestão de usuários, pets e auditoria do sistema.

**Principais Recursos:**
- Gestão de permissões de admin
- Visualização de todos os pets
- Auditoria completa de ações
- Acesso restrito e seguro

## Arquitetura Implementada

### Middleware em Cascata

```php
Route::prefix('admin')
    ->middleware(['jwt.auth', 'admin'])
    ->group(function () {
        // Rotas administrativas
    });
```

**Justificativa**: Duas camadas de segurança garantem que apenas usuários autenticados E administradores acessem as rotas. Se um middleware falhar ou for removido acidentalmente, o outro ainda protege.

### Campo Booleano `is_admin`

Utiliza-se um campo simples `is_admin` em vez de sistema complexo de roles:

**Justificativa**: Para o escopo do TCC, um sistema binário (admin/não-admin) é suficiente e mais simples de entender e manter. Sistemas com múltiplos roles (RBAC completo) adicionariam complexidade desnecessária.

### AuditService Centralizado

Serviço estático para facilitar logging em qualquer ponto do código:

```php
AuditService::logUpdated(
    entityType: 'User',
    entityId: $user->id,
    oldValues: ['is_admin' => false],
    newValues: ['is_admin' => true]
);
```

**Justificativa**: API simples e consistente. Métodos estáticos permitem uso sem injeção de dependência. Captura automaticamente IP, User Agent e usuário autenticado.

### JSONB para `old_values` e `new_values`

A tabela `audit_logs` usa JSONB para armazenar valores antes/depois:

**Justificativa**: Flexibilidade para auditar qualquer tipo de entidade sem criar colunas específicas. JSONB permite queries para encontrar mudanças específicas (ex: "quem alterou email de quem").

### Validação: Não Remover Próprio Acesso

```php
if ($user->id === auth()->id() && !$request->is_admin) {
    return response()->json([
        'error' => 'Você não pode remover seu próprio acesso de admin'
    ], 422);
}
```

**Justificativa**: Previne cenário onde único admin se remove acidentalmente, deixando o sistema sem administradores. É uma proteção contra erro humano.

## Decisões Técnicas

### Soft Delete Não Implementado

Usuários e pets são deletados permanentemente:

**Justificativa**: Para o escopo acadêmico do TCC, hard delete simplifica a arquitetura. Em produção real, soft delete seria recomendado para compliance (LGPD) e recuperação de dados.

### Filtros Simples

Admin pode filtrar usuários por:
- Email (busca parcial)
- Data de criação (intervalo)

Pets por:
- Owner ID

**Justificativa**: Filtros básicos suficientes para demonstrar a funcionalidade sem adicionar complexidade de busca full-text ou ElasticSearch.

### Paginação Diferenciada

- Usuários: 20 itens/página
- Pets: 20 itens/página
- Audit Logs: 50 itens/página

**Justificativa**: Logs de auditoria são analisados em volume maior durante investigações, então páginas maiores reduzem cliques.

### IP Address e User Agent

Registra-se IP e User Agent em cada log:

**Justificativa**: Essencial para auditoria de segurança. Permite identificar acessos suspeitos (múltiplos IPs, user agents inesperados) e rastrear origem de ações.

### `user_id` NULLABLE em `audit_logs`

O campo `user_id` permite NULL com `ON DELETE SET NULL`:

**Justificativa**: Se um usuário for deletado, seus logs de auditoria permanecem para compliance. O campo fica NULL mas mantém-se o registro da ação.

## Segurança e Compliance

### LGPD Considerations

O sistema de auditoria atende requisitos da LGPD:
- **Rastreabilidade**: Quem acessou/modificou dados pessoais
- **Transparência**: Histórico completo disponível
- **Accountability**: Responsabilização de ações
- **Right to be Informed**: Usuários podem solicitar histórico

**Justificativa**: Mesmo sendo um TCC, demonstrar consciência sobre LGPD é importante para um sistema que lida com dados pessoais.

### Prevenção de Enumeration

UUIDs são usados onde possível para prevenir enumeração:

**Justificativa**: IDs sequenciais revelam quantidade de registros e facilitam ataques de força bruta. UUIDs adicionam camada de segurança.

### Rate Limiting

Rotas administrativas herdam rate limiting do JWT middleware:

**Justificativa**: Previne abuse de endpoints administrativos. Admin comprometido não pode fazer milhares de requisições rapidamente.

## AdminUserSeeder

Cria usuário admin padrão para desenvolvimento:

```php
User::create([
    'name' => 'Admin UTFPets',
    'email' => 'admin@utfpets.com',
    'password' => Hash::make('admin123'),
    'is_admin' => true,
]);
```

**Justificativa**: Facilita desenvolvimento e demonstração do TCC sem precisar manipular banco de dados diretamente. **Deve ser alterado em produção**.

## API RESTful

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/users` | Lista usuários com filtros |
| PATCH | `/admin/users/{id}` | Atualiza status de admin |
| GET | `/admin/pets` | Lista todos os pets |
| GET | `/admin/audit-logs` | Lista logs de auditoria |

**Justificativa**: Prefixo `/admin` torna óbvio que são rotas administrativas. Estrutura plana (sem nested resources) simplifica uso.

## Testes e Qualidade

**13 testes automatizados** cobrem:
- Acesso negado para não-admins (403)
- Listagem e filtros
- Toggle de permissões admin
- Validação (não remover próprio acesso)
- Paginação
- Segurança (isolamento)

**Justificativa**: Rotas administrativas são críticas para segurança. Testes garantem que apenas admins acessem e que validações funcionem.

## Arquivos Relacionados

### Criados
- `database/migrations/*_add_is_admin_to_users_table.php`
- `database/migrations/*_create_audit_logs_table.php`
- `app/Models/AuditLog.php`
- `app/Services/AuditService.php`
- `app/Http/Middleware/IsAdmin.php`
- `app/Http/Controllers/AdminController.php`
- `database/seeders/AdminUserSeeder.php`
- `tests/Feature/AdminTest.php`

### Modificados
- `app/Models/User.php` - Campo `is_admin`
- `routes/api.php` - 4 novas rotas administrativas
- `app/Http/Kernel.php` - Middleware registrado
