# Módulo 3 — Notificações (Histórico e Leitura)

## Objetivo

Implementar um sistema completo de notificações para registrar e gerenciar eventos do sistema, incluindo lembretes, convites de compartilhamento e mudanças de papéis.

**Principais Recursos:**
- Histórico completo de notificações
- Controle de leitura (read/unread)
- Integração com todos os módulos
- Performance otimizada com paginação

## Arquitetura Implementada

### Sistema de Status com Enums

```php
enum NotificationStatus: string {
    case QUEUED = 'queued';   // Na fila para envio
    case SENT = 'sent';       // Enviada com sucesso
    case FAILED = 'failed';   // Falha no envio
    case READ = 'read';       // Lida pelo usuário
}

enum NotificationChannel: string {
    case DB = 'db';           // In-app (banco de dados)
    case EMAIL = 'email';     // Email
    case PUSH = 'push';       // Push notification
}
```

**Justificativa**: A separação de status permite rastrear o ciclo de vida completo da notificação. `QUEUED` → `SENT` → `READ` oferece visibilidade sobre o processamento e permite retry de notificações falhadas.

### Service Layer para Criação

Centraliza criação de notificações no `NotificationService`:

```php
class NotificationService {
    public function queue(
        User $user,
        string $title,
        string $body,
        array $data = [],
        NotificationChannel $channel = NotificationChannel::DB
    ): Notification
}
```

**Justificativa**: Centralizar a criação garante consistência no formato e facilita adicionar lógica comum (rate limiting, validações, logging). Outros módulos não precisam conhecer detalhes de implementação.

### Event-Driven Integration

Listeners conectam eventos de outros módulos às notificações:

```php
class SendSharedPetNotification implements ShouldQueue {
    public function handle(SharedPetInvited $event) {
        $this->notificationService->queue(
            $event->shared->user,
            "Convite para visualizar pet",
            "Você foi convidado para visualizar {$event->shared->pet->name}",
            ['pet_id' => $event->shared->pet_id, 'type' => 'pet_invite']
        );
    }
}
```

**Justificativa**: Desacoplamento total. O módulo de compartilhamento não conhece notificações - apenas dispara eventos. Isso permite adicionar/remover listeners sem modificar código existente (Open/Closed Principle).

### Campo `data` em JSONB

A tabela `notifications` possui campo `data` do tipo JSONB (PostgreSQL):

**Justificativa**: Permite armazenar contexto adicional de forma flexível (pet_id, reminder_id, etc.) sem criar colunas específicas. JSONB permite queries e índices sobre o JSON, mantendo performance.

### Job Assíncrono para Entrega

`DeliverNotificationJob` processa o envio de notificações:

**Justificativa**: Separar criação (síncrona) de entrega (assíncrona) garante que a API responda rápido. Se o envio de email falhar, não impacta a experiência do usuário na ação principal.

## Decisões Técnicas

### Paginação com Defaults Específicos

- Notificações: 20 itens por página (interação frequente)
- Audit Logs: 50 itens por página (análise em massa)

**Justificativa**: Notificações são consultadas frequentemente em pequenos lotes (ver últimas). Logs de auditoria são analisados em volume maior durante investigações.

### Endpoint `unread-count` Separado

API oferece `/notifications/unread-count` além de `/notifications`:

**Justificativa**: O contador é usado frequentemente (badge no header) e não precisa dos dados completos. Endpoint separado evita tráfego desnecessário e permite cache agressivo.

### Marcar Como Lida (Individual e Em Massa)

Dois endpoints:
- `PATCH /notifications/{id}/read` - Individual
- `POST /notifications/mark-all-read` - Em massa

**Justificativa**: Usuários precisam marcar uma notificação ao clicar nela (individual) e também "limpar tudo" (massa). Ambos os padrões de uso são comuns.

### Filtro por Status

A API permite filtrar por `queued`, `sent`, `failed`, `read`:

**Justificativa**: Debugging e auditoria requerem filtros específicos. Admins podem querer ver notificações falhadas para investigar problemas.

### Isolamento por Usuário

Todas as queries incluem automaticamente `WHERE user_id = auth()->id()`:

**Justificativa**: Garante que usuários nunca vejam notificações de outros, mesmo se houver bug na aplicação. Defesa em profundidade (defense in depth).

## Integração com Outros Módulos

### Lembretes (Módulo 2)

`SendReminderJob` cria notificações para todos os participantes do pet:

```php
foreach ($pet->participants as $user) {
    NotificationService::queue(
        $user,
        "🔔 Lembrete: {$reminder->title}",
        "É hora de cuidar do {$pet->name}!",
        ['reminder_id' => $reminder->id, 'pet_id' => $pet->id]
    );
}
```

### Compartilhamento (Módulo 1)

Eventos `SharedPet*` disparam notificações automáticas:
- **SharedPetInvited**: Notifica convidado
- **SharedPetAccepted**: Notifica owner
- **SharedPetRoleChanged**: Notifica usuário afetado
- **SharedPetRemoved**: Notifica usuário removido

**Justificativa**: Transparência total. Todas as ações de compartilhamento geram notificações, mantendo usuários informados sobre mudanças de acesso.

## API RESTful

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/notifications` | Lista notificações (com filtros e paginação) |
| GET | `/notifications/unread-count` | Conta não lidas |
| PATCH | `/notifications/{id}/read` | Marca como lida |
| POST | `/notifications/mark-all-read` | Marca todas como lidas |

**Justificativa**: Estrutura simples e intuitiva. Segue convenções REST e cobre todos os casos de uso comuns.

## Índices de Performance

```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

**Justificativa**:
- `user_id`: Todas as queries filtram por usuário
- `status`: Filtros comuns (unread = sent)
- `created_at`: Ordenação padrão (mais recentes primeiro)

## Testes e Qualidade

**9 testes automatizados** cobrem:
- Listagem com paginação
- Filtros por status
- Marcar como lida (individual e massa)
- Contador de não lidas
- Segurança (isolamento de usuários)
- NotificationService
- Integração com eventos

**Justificativa**: Notificações são críticas para a experiência do usuário. Testes garantem que integrações com outros módulos funcionem corretamente.

## Arquivos Relacionados

### Criados
- `database/migrations/*_create_notifications_table.php`
- `app/Models/Notification.php`
- `app/Enums/NotificationStatus.php`
- `app/Enums/NotificationChannel.php`
- `app/Services/NotificationService.php`
- `app/Jobs/DeliverNotificationJob.php`
- `app/Listeners/SendSharedPetNotification.php`
- `app/Http/Controllers/NotificationController.php`
- `tests/Feature/NotificationTest.php`

### Modificados
- `routes/api.php` - 4 novas rotas
- `app/Providers/EventServiceProvider.php` - Listeners registrados
