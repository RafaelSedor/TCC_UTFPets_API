# Módulo 2 — Lembretes com Agendamento e Recorrência

## Objetivo

Criar sistema de lembretes para refeições e medicações com suporte a recorrência e processamento em background.

**Principais Recursos:**
- Lembretes únicos e recorrentes (diário, semanal)
- Agendamento com timezone do usuário
- Processamento assíncrono via Jobs
- Ações de snooze (adiar) e complete (concluir)

## Arquitetura Implementada

### Sistema de Recorrência com Enums

Utilizou-se pattern de Enums para representar regras de repetição:

```php
enum RepeatRule: string {
    case NONE = 'none';      // Lembrete único
    case DAILY = 'daily';    // Repetição diária
    case WEEKLY = 'weekly';  // Repetição semanal
    case CUSTOM = 'custom';  // RRULE personalizada (futuro)
}
```

**Justificativa**: Enums permitem adicionar lógica de cálculo da próxima ocorrência diretamente no enum (`getNextOccurrence()`), mantendo a regra de negócio próxima à sua definição. O valor `CUSTOM` prepara o sistema para suportar RFC 5545 (iCalendar RRULE) no futuro.

### Processamento Assíncrono com Jobs

O sistema usa Laravel Scheduler + Queue para processar lembretes:

```php
Schedule::call(function () {
    $reminders = Reminder::active()
        ->pending(5) // Tolerância de 5 minutos
        ->get();

    foreach ($reminders as $reminder) {
        SendReminderJob::dispatch($reminder);
    }
})->everyMinute()->withoutOverlapping();
```

**Justificativa**:
- **Scheduler (cron)**: Verifica lembretes a cada minuto sem bloquear a aplicação
- **Queue (jobs)**: Processa envio de notificações de forma assíncrona
- **Tolerância de 5 minutos**: Previne perda de lembretes por drift de relógio ou delay no scheduler

### Idempotência de Jobs

O `SendReminderJob` usa chave única composta por `reminder_id + scheduled_at`:

```php
public function uniqueId(): string
{
    return $this->reminder->id . '_' . $this->reminder->scheduled_at->timestamp;
}

public $uniqueFor = 3600; // 1 hora
```

**Justificativa**: Garante que o mesmo lembrete não seja processado múltiplas vezes se o job for retriado. A chave inclui `scheduled_at` para permitir que lembretes recorrentes (mesmo ID) tenham múltiplas ocorrências distintas.

### Suporte a Timezone

Adiciona-se campo `timezone` na tabela `users`:

```php
protected $casts = [
    'scheduled_at' => 'datetime',
];
```

**Justificativa**: Laravel automaticamente converte `datetime` casts para UTC no banco e para o timezone da aplicação na leitura. Isso prepara o sistema para futuramente respeitar o timezone individual de cada usuário nas notificações.

### Recorrência Automática

Ao concluir um lembrete recorrente, o sistema cria automaticamente a próxima ocorrência:

```php
public function complete(): void
{
    $this->status = ReminderStatus::DONE;
    $this->save();

    if ($this->repeat_rule->isRecurring()) {
        $this->calculateNextOccurrence();
    }
}
```

**Justificativa**: Automatiza o fluxo de lembretes recorrentes sem intervenção manual. O usuário só precisa concluir, e o sistema agenda a próxima automaticamente.

## Decisões Técnicas

### Snooze Flexível (1-1440 minutos)

O endpoint `/snooze` permite adiar o lembrete por 1 minuto até 24 horas:

**Justificativa**: Oferece flexibilidade ao usuário para reagendar conforme sua rotina, sem limitar a apenas alguns valores pré-definidos.

### Notificação para Todos os Participantes

O job notifica owner + editors + viewers do pet:

**Justificativa**: Em um cenário de compartilhamento (família, clínica), todos os envolvidos devem ser notificados sobre lembretes importantes como medicação.

### Filtros por Status e Data

A API permite filtrar lembretes por `status` (active/paused/done) e intervalo de datas (`from`/`to`):

**Justificativa**: Usuários precisam visualizar lembretes futuros (planning), ativos (atual) e histórico (concluídos). Filtros por data facilitam consulta de períodos específicos.

### Scope `pending(5)` no Model

O scope busca lembretes com `scheduled_at <= now + 5 minutos`:

**Justificativa**: A tolerância de 5 minutos previne perda de lembretes caso o scheduler tenha um pequeno atraso. É um buffer de segurança que não compromete a precisão.

## Permissões Integradas

Reutiliza o `AccessService` do Módulo 1:

| Ação | Owner | Editor | Viewer |
|------|-------|--------|--------|
| Visualizar lembretes | ✅ | ✅ | ✅ |
| Criar lembrete | ✅ | ✅ | ❌ |
| Editar lembrete | ✅ | ✅ | ❌ |
| Deletar lembrete | ✅ | ✅ | ❌ |
| Adiar (snooze) | ✅ | ✅ | ✅ |
| Concluir | ✅ | ✅ | ❌ |

**Justificativa**: Viewer pode adiar lembretes (ação não destrutiva) mas não pode concluir ou modificar, mantendo consistência com o modelo de permissões.

## API RESTful

Endpoints sob `/api/v1`:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/pets/{pet}/reminders` | Lista lembretes (com filtros) |
| POST | `/pets/{pet}/reminders` | Cria lembrete |
| PATCH | `/reminders/{id}` | Atualiza lembrete |
| DELETE | `/reminders/{id}` | Deleta lembrete |
| POST | `/reminders/{id}/snooze` | Adia lembrete |
| POST | `/reminders/{id}/complete` | Marca como concluído |

**Justificativa**: A estrutura nested `pets/{pet}/reminders` para criação reflete que lembretes pertencem a um pet. Operações individuais usam `/reminders/{id}` para evitar path desnecessariamente longo.

## Fluxo de Processamento

```
┌─────────────────────────────────────────────┐
│  Scheduler (a cada minuto)                  │
│  - Busca lembretes active                   │
│  - scheduled_at <= now + 5 min              │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│  SendReminderJob (enfileirado)              │
│  - Idempotência (1h cache)                  │
│  - Chave: reminder_id + scheduled_at        │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│  Processamento                              │
│  1. Busca todos os participantes do pet     │
│  2. Envia notificação para cada usuário     │
│  3. Se recorrente, cria próxima ocorrência  │
└─────────────────────────────────────────────┘
```

## Testes e Qualidade

**14 testes automatizados** cobrem:
- Criação e listagem
- Filtros por status e data
- Permissões por papel
- Snooze e complete
- Recorrência automática
- Validações (data futura, etc)

**Justificativa**: A lógica de recorrência e agendamento é complexa e crítica. Testes garantem que mudanças não quebrem o comportamento esperado.

## Arquivos Relacionados

### Criados
- `database/migrations/*_create_reminders_table.php`
- `database/migrations/*_add_timezone_to_users_table.php`
- `app/Models/Reminder.php`
- `app/Enums/ReminderStatus.php`
- `app/Enums/RepeatRule.php`
- `app/Jobs/SendReminderJob.php`
- `app/Http/Controllers/ReminderController.php`
- `tests/Feature/ReminderTest.php`

### Modificados
- `app/Models/Pet.php` - Relacionamento `reminders()`
- `app/Models/User.php` - Campo `timezone`
- `routes/console.php` - Scheduler configurado
- `routes/api.php` - 7 novas rotas
