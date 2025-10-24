# MÓDULO 15 — Lembretes com Personalização Avançada (HU012)

## Objetivo

Ampliar a customização de lembretes existentes com funcionalidades avançadas:
- Definir dias específicos da semana para lembretes
- Configurar janela ativa (horários permitidos para envio)
- Timezone override por lembrete
- Snooze personalizável
- Escolha de canal de entrega (push/email)
- Endpoint de teste para simular envio

---

## Novos Campos no Banco de Dados

### Migration: `alter_reminders_add_customization`

```sql
ALTER TABLE reminders ADD COLUMN:
- days_of_week JSON NULL              -- Dias permitidos: ['MON','TUE','WED','THU','FRI','SAT','SUN']
- timezone_override VARCHAR(255) NULL -- IANA timezone (ex: 'America/Sao_Paulo')
- snooze_minutes_default SMALLINT UNSIGNED DEFAULT 0  -- Padrão: 0-1440
- active_window_start TIME NULL       -- Início da janela ativa (ex: '08:00')
- active_window_end TIME NULL         -- Fim da janela ativa (ex: '22:00')
- channel ENUM('push','email') DEFAULT 'push'  -- Canal de entrega
```

### Validações

**days_of_week:**
- Nullable array
- Valores permitidos: `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, `SUN`
- Se null/vazio, lembrete funciona todos os dias

**timezone_override:**
- Nullable string
- Deve ser timezone IANA válida
- Se null, usa timezone do usuário

**snooze_minutes_default:**
- Integer de 0 a 1440 (24 horas)
- Define comportamento padrão do snooze

**active_window_start / active_window_end:**
- Format: `H:i` (ex: `08:00`, `22:00`)
- End deve ser posterior a start
- Se ambos null, lembrete funciona 24/7

**channel:**
- Enum: `push` ou `email`
- Default: `push`

---

## Model: Reminder

### Novos Métodos

#### `getEffectiveTimezone(): string`
Retorna o timezone efetivo do lembrete (override ou do usuário).

```php
$reminder->getEffectiveTimezone();
// Retorna: 'America/Sao_Paulo' ou timezone do usuário
```

#### `isWithinActiveWindow(DateTimeInterface $datetime): bool`
Verifica se um horário está dentro da janela ativa.

```php
$datetime = Carbon::parse('2025-10-08 10:00:00');
$reminder->isWithinActiveWindow($datetime);
// Retorna true se estiver entre active_window_start e active_window_end
```

#### `isDayOfWeekAllowed(DateTimeInterface $datetime): bool`
Verifica se o dia da semana é permitido.

```php
$datetime = Carbon::parse('2025-10-08'); // Segunda-feira
$reminder->days_of_week = ['MON', 'WED', 'FRI'];
$reminder->isDayOfWeekAllowed($datetime); // true
```

---

## Endpoints da API

### POST `/v1/reminders/{id}/test`
Envia um teste de lembrete imediatamente (usa fila "low").

**Autenticação:** Requer owner ou editor do pet  
**Resposta 200:**
```json
{
  "message": "Teste de lembrete enfileirado com sucesso.",
  "delivery_id": "uuid",
  "status": "queued",
  "channel": "push"
}
```

**Resposta 403:** Se usuário não tem permissão

---

### POST `/v1/reminders/{id}/snooze`
Adia o lembrete por X minutos.

**Autenticação:** Requer acesso ao pet (qualquer papel)

**Request Body:**
```json
{
  "minutes": 15  // Opcional: 5, 10, 15, 30, 60
}
```
Se omitido, usa `snooze_minutes_default` do lembrete ou 15 (padrão).

**Resposta 200:**
```json
{
  "message": "Lembrete adiado por 15 minutos.",
  "data": {
    "id": "uuid",
    "scheduled_at": "2025-10-08T10:15:00.000000Z",
    ...
  }
}
```

**Resposta 422:** Se minutos > 1440

---

## ReminderSchedulerService

### Método `calculateNextOccurrence(Reminder $reminder): ?Carbon`

Calcula a próxima ocorrência válida considerando:

1. **Timezone**: Usa `timezone_override` ou timezone do usuário
2. **Dias da semana**: Verifica se o dia está em `days_of_week`
3. **Janela ativa**: Garante que está entre `active_window_start` e `active_window_end`

**Algoritmo:**
1. Começa em `scheduled_at` ou now() + 1 minuto
2. Loop até 365 tentativas (evita loop infinito)
3. Para cada tentativa:
   - Verifica se dia da semana é permitido
   - Verifica se horário está na janela ativa
   - Se ambos OK, retorna a data
   - Senão, avança para o próximo dia/horário válido

**Exemplo:**
```php
$reminder->days_of_week = ['MON', 'WED', 'FRI'];
$reminder->active_window_start = '08:00';
$reminder->active_window_end = '18:00';

$service = new ReminderSchedulerService();
$nextOccurrence = $service->calculateNextOccurrence($reminder);
// Retorna próxima segunda/quarta/sexta entre 08:00-18:00
```

---

## Request Validation

### ReminderRequest (Store)

```php
'days_of_week' => 'nullable|array',
'days_of_week.*' => ['string', Rule::in(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])],
'timezone_override' => 'nullable|timezone',
'snooze_minutes_default' => 'nullable|integer|min:0|max:1440',
'active_window_start' => 'nullable|date_format:H:i',
'active_window_end' => 'nullable|date_format:H:i|after:active_window_start',
'channel' => ['nullable', Rule::enum(NotificationChannel::class)],
```

### UpdateReminderRequest

Mesmas regras com `sometimes` no início.

---

## Factory States

```php
// Weekdays only (seg-sex)
Reminder::factory()->weekdays()->create();

// Business hours (08:00-18:00)
Reminder::factory()->businessHours()->create();

// Push notifications
Reminder::factory()->push()->create();

// Email notifications
Reminder::factory()->email()->create();

// Combinações
Reminder::factory()
    ->weekdays()
    ->businessHours()
    ->push()
    ->create();
```

---

## Exemplos de Uso

### 1. Lembrete apenas em dias úteis

```json
POST /v1/pets/{pet}/reminders
{
  "title": "Ração de segunda a sexta",
  "scheduled_at": "2025-10-09T08:00:00Z",
  "repeat_rule": "daily",
  "days_of_week": ["MON", "TUE", "WED", "THU", "FRI"],
  "channel": "push"
}
```

### 2. Lembrete com janela ativa (horário comercial)

```json
POST /v1/pets/{pet}/reminders
{
  "title": "Medicação",
  "scheduled_at": "2025-10-09T09:00:00Z",
  "repeat_rule": "daily",
  "active_window_start": "08:00",
  "active_window_end": "20:00",
  "channel": "push"
}
```

Se `scheduled_at` cair fora da janela, será ajustado automaticamente para a próxima ocorrência válida.

### 3. Lembrete com timezone específico

```json
POST /v1/pets/{pet}/reminders
{
  "title": "Lembrete internacional",
  "scheduled_at": "2025-10-09T12:00:00Z",
  "timezone_override": "Europe/London",
  "channel": "email"
}
```

### 4. Snooze personalizado

```json
POST /v1/reminders/{id}/snooze
{
  "minutes": 30
}
```

### 5. Testar lembrete

```json
POST /v1/reminders/{id}/test
```

Envia notificação de teste imediatamente para o usuário autenticado.

---

## Comportamento de Entrega

### Push Notifications (channel = "push")
- Usa FCM (Firebase Cloud Messaging)
- Requer que usuário tenha dispositivo registrado
- Job: `DeliverNotificationJob`
- Queue: `default` (teste usa `low`)

### Email (channel = "email")
- Envia email simples com título e descrição
- Usa sistema de notificações do Laravel
- Queue: `default`

**Nota:** A lógica de entrega está implementada no `DeliverNotificationJob` que já respeita o canal da notificação.

---

## Casos de Erro

### 409 - Conflict (Janela ativa inválida)
Retornado quando não é possível encontrar próxima ocorrência válida dentro das restrições.

```json
{
  "message": "Não foi possível agendar o lembrete dentro das restrições definidas.",
  "next_possible_occurrence": "2025-10-14T08:00:00Z"
}
```

### 422 - Validation Error

**Timezone inválida:**
```json
{
  "message": "Timezone inválida. Use formato IANA (ex: America/Sao_Paulo).",
  "errors": {
    "timezone_override": ["Timezone inválida..."]
  }
}
```

**Janela ativa inválida:**
```json
{
  "message": "O horário de fim deve ser posterior ao horário de início.",
  "errors": {
    "active_window_end": ["O horário de fim deve ser posterior..."]
  }
}
```

### 404 - Not Found
Reminder não encontrado ou usuário sem permissão.

---

## Critérios de Aceite ✅

- [x] Usuário consegue definir dias da semana específicos
- [x] Usuário consegue definir janela ativa (horário permitido)
- [x] Usuário consegue escolher canal (push/email)
- [x] Usuário consegue acionar teste de lembrete
- [x] Usuário consegue adiar com snooze personalizado
- [x] Próxima execução sempre cai dentro da janela ativa
- [x] Sistema respeita timezone override quando definido
- [x] Snooze respeita limite de 1440 minutos
- [x] Validações impedem configurações inválidas

---

## Cenários de Teste

### Teste 1: Dias da Semana
```php
$reminder = Reminder::factory()->create([
    'days_of_week' => ['MON', 'WED', 'FRI'],
    'scheduled_at' => '2025-10-10 10:00:00', // Sexta
]);

$service = new ReminderSchedulerService();
$next = $service->calculateNextOccurrence($reminder);
// Deve retornar a próxima sexta-feira às 10:00
```

### Teste 2: Janela Ativa
```php
$reminder = Reminder::factory()->create([
    'active_window_start' => '08:00',
    'active_window_end' => '18:00',
    'scheduled_at' => now()->setTime(20, 0), // 20:00 (fora da janela)
]);

$next = $service->calculateNextOccurrence($reminder);
// Deve ajustar para amanhã às 08:00
```

### Teste 3: Timezone Override
```php
$reminder = Reminder::factory()->create([
    'timezone_override' => 'America/New_York',
    'scheduled_at' => '2025-10-10 12:00:00 UTC',
]);

$timezone = $reminder->getEffectiveTimezone();
// Deve retornar 'America/New_York'
```

### Teste 4: Snooze
```php
$response = $this->postJson("/v1/reminders/{$reminder->id}/snooze", [
    'minutes' => 30
]);

$reminder->refresh();
// scheduled_at deve ser + 30 minutos
```

### Teste 5: Test Endpoint
```php
$response = $this->postJson("/v1/reminders/{$reminder->id}/test");

$response->assertStatus(200)
    ->assertJsonStructure(['delivery_id', 'status', 'channel']);
```

---

## Integração com Outros Módulos

### Módulo 2 (Lembretes)
- Estende funcionalidades existentes
- Mantém compatibilidade total com lembretes antigos
- Campos novos são opcionais

### Módulo 8 (Push Notifications)
- Usa FCM para canal "push"
- Requer dispositivo registrado

### Módulo 9 (Queue Hardening)
- Beneficia-se do sistema de retry automático
- Dead letter queue para falhas

---

## Melhorias Futuras

- [ ] Suporte a múltiplas janelas ativas no mesmo dia
- [ ] Snooze até data/hora específica (não apenas minutos)
- [ ] Notificação quando lembrete sai da janela ativa
- [ ] Analytics de taxa de snooze
- [ ] Sugestão automática de melhor horário baseado em histórico
- [ ] Integração com calendário para evitar feriados
- [ ] Priorização de lembretes
- [ ] Agrupamento de notificações

---

## Troubleshooting

### Problema: Lembrete não é enviado no horário esperado

**Possíveis causas:**
1. Lembrete está fora da janela ativa
2. Dia da semana não está permitido
3. Timezone override diferente do esperado

**Solução:** Verificar logs do `ReminderSchedulerService` para ver a próxima ocorrência calculada.

### Problema: Teste não envia notificação

**Possíveis causas:**
1. Usuário não tem dispositivo registrado (para push)
2. Queue worker não está rodando
3. Credenciais FCM inválidas

**Solução:** 
```bash
# Verificar queue
php artisan queue:work

# Verificar logs
tail -f storage/logs/laravel.log
```

### Problema: Validação falha para timezone

**Solução:** Usar timezone IANA válida. Lista completa:
```php
timezone_identifiers_list()
```

---

## Arquivos do Módulo

```
database/migrations/
└── 2025_10_08_000006_alter_reminders_add_customization.php

app/Models/
└── Reminder.php (atualizado)

app/Http/Requests/
├── ReminderRequest.php (atualizado)
└── UpdateReminderRequest.php (atualizado)

app/Http/Controllers/
└── ReminderController.php (novos métodos: test)

app/Services/
└── ReminderSchedulerService.php (atualizado)

database/factories/
└── ReminderFactory.php (novos states)

routes/
└── api.php (nova rota: POST reminders/{id}/test)

docs/
└── MODULO_15_REMINDER_CUSTOMIZATION.md
```

---

## Conclusão

O Módulo 15 transforma o sistema de lembretes em uma solução altamente personalizável e flexível, permitindo que usuários configurem lembretes que se adaptam perfeitamente às suas rotinas e preferências, respeitando horários, dias da semana e fusos horários específicos.
