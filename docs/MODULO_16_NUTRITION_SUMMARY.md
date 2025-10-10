# MÓDULO 16 — Nutrition Summary & Alerts

## Objetivo

Fornecer endpoint de resumo nutricional por pet e período, com métricas simples e alertas heurísticos sobre saúde nutricional do pet.

---

## Endpoint

### GET `/v1/pets/{pet}/nutrition/summary`

Retorna resumo nutricional do pet com agregações de refeições, evolução de peso e alertas automáticos.

**Autenticação:** Requer acesso ao pet (owner, editor ou viewer)

**Query Parameters:**
- `from` (opcional): Data inicial no formato YYYY-MM-DD
- `to` (opcional): Data final no formato YYYY-MM-DD

**Defaults:**
- Se `from` e `to` não fornecidos: últimos 30 dias
- Range máximo: 180 dias
- Se `from > to`: inverte automaticamente

---

## Resposta

### Estrutura Completa

```json
{
  "pet_id": "9d8e7f6a-5b4c-3d2e-1a0b-9c8d7e6f5a4b",
  "range": {
    "from": "2025-09-01",
    "to": "2025-09-30"
  },
  "meals": {
    "total": 45,
    "per_day": [
      {"date": "2025-09-01", "count": 2},
      {"date": "2025-09-02", "count": 1},
      {"date": "2025-09-03", "count": 2}
    ],
    "avg_food_amount": 130.5
  },
  "weight": {
    "first": {
      "date": "2025-09-01",
      "kg": 7.2
    },
    "last": {
      "date": "2025-09-30",
      "kg": 7.5
    },
    "delta_kg": 0.3
  },
  "alerts": [
    {
      "code": "LOW_MEAL_FREQUENCY",
      "severity": "medium",
      "message": "Queda de 30% na frequência de refeições nos últimos 7 dias."
    },
    {
      "code": "FAST_WEIGHT_GAIN",
      "severity": "low",
      "message": "Ganho de 5.2% em 14 dias (0.30 kg)."
    }
  ]
}
```

### Campos

#### `pet_id`
UUID do pet analisado.

#### `range`
- `from`: Data inicial do período analisado
- `to`: Data final do período analisado

#### `meals`
Agregação de refeições:
- `total`: Total de refeições no período
- `per_day`: Array com contagem por dia
- `avg_food_amount`: Média de `food_amount` (null se nenhuma refeição tem esse campo)

#### `weight`
Evolução de peso:
- `first`: Primeiro peso registrado no período (null se não houver)
- `last`: Último peso registrado no período (null se não houver)
- `delta_kg`: Diferença em kg (last - first), null se não houver dados

#### `alerts`
Array de alertas heurísticos (vazio se nenhum alerta):
- `code`: Código único do alerta
- `severity`: `low`, `medium` ou `high`
- `message`: Descrição do alerta em português

---

## Alertas Heurísticos

### 1. LOW_MEAL_FREQUENCY

**Condição:** Queda de frequência de refeições  
**Severidade:** `medium`

**Lógica:**
```
SE:
  - Período >= 8 dias
  - Média dos últimos 7 dias < 70% da média do período completo
ENTÃO:
  - Alerta de baixa frequência
```

**Exemplo:**
- Período: 30 dias, total 60 refeições (média 2/dia)
- Últimos 7 dias: 9 refeições (média 1.3/dia)
- 1.3 < (2 * 0.7) = 1.4 ✓ Alerta!

**Mensagem:**
```
"Queda de 35% na frequência de refeições nos últimos 7 dias."
```

---

### 2. FAST_WEIGHT_GAIN / FAST_WEIGHT_LOSS

**Condição:** Ganho ou perda rápida de peso  
**Severidade:** `low` (variação 5-10%) ou `high` (variação > 10%)

**Lógica:**
```
SE:
  - Há dados de peso (primeiro e último)
  - Intervalo entre pesos <= 14 dias
  - Variação percentual > 5%
ENTÃO:
  - Alerta de mudança rápida
  - Code: FAST_WEIGHT_GAIN (se delta > 0) ou FAST_WEIGHT_LOSS (se delta < 0)
  - Severity: high (> 10%) ou low (<= 10%)
```

**Exemplo 1 (Ganho):**
- Peso inicial: 7.0 kg (dia 1)
- Peso final: 7.4 kg (dia 10)
- Delta: +0.4 kg = +5.7%
- Intervalo: 9 dias <= 14 ✓
- Variação: 5.7% > 5% ✓ Alerta!

**Mensagem:**
```
"Ganho de 5.7% em 9 dias (0.40 kg)."
```

**Exemplo 2 (Perda):**
- Peso inicial: 8.0 kg (dia 1)
- Peso final: 7.1 kg (dia 14)
- Delta: -0.9 kg = -11.25%
- Variação: 11.25% > 10% → severity HIGH

**Mensagem:**
```
"Perda de 11.2% em 14 dias (0.90 kg)."
```

---

## Validações

### Range de Datas

```php
from <= to (invertido automaticamente se necessário)
from e to devem ser datas válidas
range máximo: 180 dias
```

### Erros

**422 - Validation Error:**
```json
{
  "message": "A data inicial deve ser anterior ou igual à data final.",
  "errors": {
    "from": ["A data inicial deve ser anterior ou igual à data final."]
  }
}
```

**422 - Range muito grande:**
```json
{
  "message": "O intervalo máximo permitido é de 180 dias."
}
```

**403 - Forbidden:**
```json
{
  "message": "This action is unauthorized."
}
```

**404 - Not Found:**
```json
{
  "message": "Model not found."
}
```

---

## Casos Especiais

### Pet sem Dados

Se o pet não tem refeições ou pesos no período, retorna estrutura completa com valores zero/null:

```json
{
  "pet_id": "uuid",
  "range": {
    "from": "2025-10-01",
    "to": "2025-10-30"
  },
  "meals": {
    "total": 0,
    "per_day": [],
    "avg_food_amount": null
  },
  "weight": {
    "first": null,
    "last": null,
    "delta_kg": null
  },
  "alerts": []
}
```

**Garantia:** Nunca retorna 500 em ranges vazios. Sempre retorna estrutura completa.

---

## Exemplos de Uso

### 1. Resumo dos Últimos 30 Dias (default)

```bash
curl -X GET "http://localhost:8080/api/v1/pets/{pet_id}/nutrition/summary" \
  -H "Authorization: Bearer {token}"
```

### 2. Período Específico

```bash
curl -X GET "http://localhost:8080/api/v1/pets/{pet_id}/nutrition/summary?from=2025-09-01&to=2025-09-30" \
  -H "Authorization: Bearer {token}"
```

### 3. Último Trimestre

```bash
curl -X GET "http://localhost:8080/api/v1/pets/{pet_id}/nutrition/summary?from=2025-07-01&to=2025-09-30" \
  -H "Authorization: Bearer {token}"
```

---

## Service: NutritionSummaryService

### Métodos Principais

#### `getSummary(Pet $pet, ?Carbon $from, ?Carbon $to): array`

Orquestra a geração do resumo completo.

#### `validateAndNormalizeDateRange(?Carbon $from, ?Carbon $to): array`

Valida e normaliza datas:
- Se null, retorna últimos 30 dias
- Inverte se from > to
- Limita a 180 dias

#### `aggregateMeals(Pet $pet, Carbon $from, Carbon $to): array`

Agrega dados de refeições:
- Total de refeições
- Contagem por dia
- Média de food_amount

#### `aggregateWeight(Pet $pet, Carbon $from, Carbon $to): array`

Coleta dados de peso:
- Primeiro peso do período
- Último peso do período
- Delta em kg

#### `generateAlerts(Pet $pet, Carbon $from, Carbon $to, array $meals, array $weight): array`

Gera alertas baseados em heurísticas:
- Chama `checkLowMealFrequency()`
- Chama `checkFastWeightChange()`

---

## Testes

### Casos de Teste Importantes

```php
/** @test */
public function returns_complete_structure_with_no_data(): void
{
    $pet = Pet::factory()->create();
    
    $response = $this->actingAs($pet->user)
        ->getJson("/v1/pets/{$pet->id}/nutrition/summary");
    
    $response->assertStatus(200)
        ->assertJsonStructure([
            'pet_id',
            'range' => ['from', 'to'],
            'meals' => ['total', 'per_day', 'avg_food_amount'],
            'weight' => ['first', 'last', 'delta_kg'],
            'alerts'
        ])
        ->assertJson([
            'meals' => ['total' => 0],
            'weight' => ['first' => null, 'last' => null],
            'alerts' => []
        ]);
}

/** @test */
public function aggregates_meals_correctly(): void
{
    $pet = Pet::factory()->create();
    
    // Cria 10 refeições em 5 dias
    for ($i = 0; $i < 5; $i++) {
        Meal::factory()->count(2)->create([
            'pet_id' => $pet->id,
            'scheduled_at' => now()->subDays($i),
        ]);
    }
    
    $response = $this->actingAs($pet->user)
        ->getJson("/v1/pets/{$pet->id}/nutrition/summary");
    
    $response->assertStatus(200)
        ->assertJson(['meals' => ['total' => 10]]);
}

/** @test */
public function detects_low_meal_frequency(): void
{
    $pet = Pet::factory()->create();
    
    // 60 refeições nos primeiros 23 dias (média ~2.6/dia)
    for ($i = 7; $i < 30; $i++) {
        Meal::factory()->count(2)->create([
            'pet_id' => $pet->id,
            'scheduled_at' => now()->subDays($i),
        ]);
    }
    
    // 7 refeições nos últimos 7 dias (média 1/dia)
    for ($i = 0; $i < 7; $i++) {
        Meal::factory()->create([
            'pet_id' => $pet->id,
            'scheduled_at' => now()->subDays($i),
        ]);
    }
    
    $response = $this->actingAs($pet->user)
        ->getJson("/v1/pets/{$pet->id}/nutrition/summary?from=". now()->subDays(29)->format('Y-m-d'));
    
    $response->assertStatus(200)
        ->assertJsonFragment(['code' => 'LOW_MEAL_FREQUENCY']);
}

/** @test */
public function detects_fast_weight_gain(): void
{
    $pet = Pet::factory()->create();
    
    PetWeight::factory()->create([
        'pet_id' => $pet->id,
        'weight_kg' => 7.0,
        'weighed_at' => now()->subDays(10),
    ]);
    
    PetWeight::factory()->create([
        'pet_id' => $pet->id,
        'weight_kg' => 7.5, // +7.1% em 10 dias
        'weighed_at' => now(),
    ]);
    
    $response = $this->actingAs($pet->user)
        ->getJson("/v1/pets/{$pet->id}/nutrition/summary");
    
    $response->assertStatus(200)
        ->assertJsonFragment(['code' => 'FAST_WEIGHT_GAIN']);
}

/** @test */
public function respects_date_range_validation(): void
{
    $pet = Pet::factory()->create();
    
    $from = now()->subDays(200);
    $to = now();
    
    $response = $this->actingAs($pet->user)
        ->getJson("/v1/pets/{$pet->id}/nutrition/summary?from={$from->format('Y-m-d')}&to={$to->format('Y-m-d')}");
    
    $response->assertStatus(422)
        ->assertJsonFragment(['message' => 'O intervalo máximo permitido é de 180 dias.']);
}

/** @test */
public function inverts_dates_if_from_greater_than_to(): void
{
    $pet = Pet::factory()->create();
    
    $response = $this->actingAs($pet->user)
        ->getJson("/v1/pets/{$pet->id}/nutrition/summary?from=2025-10-30&to=2025-10-01");
    
    $response->assertStatus(200)
        ->assertJson([
            'range' => [
                'from' => '2025-10-01',
                'to' => '2025-10-30',
            ]
        ]);
}
```

---

## Integração com Outros Módulos

### Módulo de Meals
Consulta todas as refeições do pet no período para agregações.

### Módulo 12 - Pet Weights
Consulta histórico de peso para análise de tendência.

### Módulo 1 - Compartilhamento
Respeita permissões: owner, editor e viewer podem ver o resumo.

---

## Melhorias Futuras

- [ ] Alerta de falta de dados recentes
- [ ] Comparação com pets similares (mesma espécie/raça)
- [ ] Sugestões automáticas de quantidade de comida
- [ ] Previsão de peso futuro baseado em tendência
- [ ] Alerta de padrão irregular (ex: skip de refeições)
- [ ] Gráficos de evolução (retornar dados para charts)
- [ ] Export de relatório em PDF
- [ ] Notificações automáticas de alertas críticos
- [ ] Integração com IA para análise mais avançada
- [ ] Histórico de alertas (salvar em banco)

---

## Troubleshooting

### Problema: avg_food_amount sempre null

**Causa:** Refeições não têm o campo `food_amount` preenchido.

**Solução:** Adicionar `food_amount` ao criar refeições:
```php
Meal::create([
    'pet_id' => $pet->id,
    'food_amount' => 150, // em gramas
    'scheduled_at' => now(),
]);
```

### Problema: Nenhum alerta é gerado

**Possíveis causas:**
1. Período muito curto (< 8 dias para LOW_MEAL_FREQUENCY)
2. Variação de peso < 5%
3. Intervalo entre pesos > 14 dias

**Solução:** Verificar se os dados atendem os critérios das heurísticas.

### Problema: 500 ao buscar resumo

**Causa:** Erro no service ou consultas ao banco.

**Solução:** Verificar logs:
```bash
tail -f storage/logs/laravel.log
```

---

## Critérios de Aceite ✅

- [x] Retorna sempre objeto completo (nunca null)
- [x] Campos numéricos coerentes (total, médias, delta)
- [x] Nenhum 500 em ranges vazios
- [x] Range máximo de 180 dias respeitado
- [x] Fallback para últimos 30 dias quando datas não fornecidas
- [x] Inversão automática de datas se from > to
- [x] Alertas gerados corretamente baseado em heurísticas
- [x] per_day ordenado por data crescente
- [x] avg_food_amount null quando não há dados
- [x] weight null quando não há registros de peso
- [x] alerts vazio quando nenhum critério é atendido

---

## Arquivos do Módulo

```
app/Services/
└── NutritionSummaryService.php

app/Http/Controllers/
└── NutritionSummaryController.php

routes/
└── api.php (nova rota)

docs/
└── MODULO_16_NUTRITION_SUMMARY.md
```

---

## Conclusão

O Módulo 16 fornece insights valiosos sobre a saúde nutricional do pet de forma simples e automática. Os alertas heurísticos ajudam tutores a identificar rapidamente problemas potenciais, permitindo ação preventiva antes que se tornem sérios.
