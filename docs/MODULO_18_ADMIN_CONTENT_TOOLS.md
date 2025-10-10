# MÓDULO 18 — Admin Content Tools (Quality-of-life)

## Objetivo

Fornecer ferramentas administrativas simples via API para apoiar gestão de conteúdo e operações da plataforma, melhorando a experiência de administradores.

---

## Endpoints

### 1. GET `/v1/admin/stats/overview`

Visão geral de estatísticas da plataforma.

**Autenticação:** Requer is_admin=true

**Resposta 200:**
```json
{
  "users": {
    "total": 1250,
    "admins": 3
  },
  "pets": {
    "total": 2890
  },
  "reminders": {
    "active": 567
  },
  "educational_articles": {
    "published": 45,
    "drafts": 12
  }
}
```

**Descrição dos Campos:**
- `users.total`: Total de usuários registrados
- `users.admins`: Total de usuários com is_admin=true
- `pets.total`: Total de pets cadastrados
- `reminders.active`: Total de lembretes com status='active'
- `educational_articles.published`: Artigos com published_at não nulo e <= now
- `educational_articles.drafts`: Artigos com published_at null ou > now

**Casos de Uso:**
- Dashboard admin
- Métricas rápidas da plataforma
- Monitoramento de crescimento

---

### 2. GET `/v1/admin/educational-articles/drafts`

Lista artigos educacionais em rascunho (não publicados).

**Autenticação:** Requer is_admin=true

**Query Parameters:**
- `page` (opcional): Número da página (default: 1)
- `per_page` (opcional): Itens por página (default: 15, max: 50)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Artigo em Rascunho",
      "slug": "artigo-em-rascunho",
      "summary": "Resumo do artigo...",
      "tags": ["Tag1", "Tag2"],
      "published_at": null,
      "created_at": "2025-10-08T10:00:00.000000Z",
      "updated_at": "2025-10-08T12:30:00.000000Z",
      "creator": {
        "id": "uuid",
        "name": "Admin User",
        "email": "admin@utfpets.com"
      }
    }
  ],
  "links": {...},
  "meta": {...}
}
```

**Comportamento:**
- Retorna artigos onde `published_at IS NULL` ou `published_at > NOW()`
- Ordenados por `updated_at DESC` (mais recentemente editados primeiro)
- Inclui informações do criador (eager loading)

**Casos de Uso:**
- Gerenciar artigos em progresso
- Revisar conteúdo antes de publicar
- Encontrar rascunhos antigos

---

### 3. POST `/v1/admin/educational-articles/{id}/duplicate`

Duplica um artigo educacional, criando uma cópia como rascunho.

**Autenticação:** Requer is_admin=true

**Parâmetros:**
- `id` (path): UUID do artigo a ser duplicado

**Resposta 201:**
```json
{
  "message": "Artigo duplicado com sucesso.",
  "data": {
    "id": "new-uuid",
    "title": "Título Original (Cópia)",
    "slug": "titulo-original-copia",
    "summary": "Mesmo resumo do original",
    "body": "Mesmo conteúdo do original",
    "tags": ["Tag1", "Tag2"],
    "published_at": null,
    "created_by": "current-admin-uuid",
    "created_at": "2025-10-08T15:00:00.000000Z",
    "updated_at": "2025-10-08T15:00:00.000000Z",
    "creator": {
      "id": "current-admin-uuid",
      "name": "Admin User",
      "email": "admin@utfpets.com"
    }
  }
}
```

**Comportamento:**
1. Copia todos os campos do artigo original (summary, body, tags)
2. Cria novo título: `"{título original} (Cópia)"`
3. Se título já existe, adiciona contador: `"{título original} (Cópia 2)"`
4. Gera novo slug único baseado no novo título
5. **Sempre cria como rascunho** (published_at = null)
6. Define `created_by` como o admin atual (não copia do original)

**Casos de Uso:**
- Criar variação de artigo existente
- Reutilizar estrutura de artigo
- Traduzir/adaptar conteúdo
- Criar séries de artigos similares

**Resposta 404:**
```json
{
  "message": "Model not found."
}
```

**Resposta 403:**
```json
{
  "message": "This action is unauthorized."
}
```

---

## Exemplos de Uso

### 1. Verificar Estatísticas da Plataforma

```bash
curl -X GET "http://localhost:8080/api/v1/admin/stats/overview" \
  -H "Authorization: Bearer {admin-token}"
```

**Resposta:**
```json
{
  "users": {"total": 1250, "admins": 3},
  "pets": {"total": 2890},
  "reminders": {"active": 567},
  "educational_articles": {"published": 45, "drafts": 12}
}
```

---

### 2. Listar Rascunhos de Artigos

```bash
curl -X GET "http://localhost:8080/api/v1/admin/educational-articles/drafts?per_page=10" \
  -H "Authorization: Bearer {admin-token}"
```

**Use Case:** Admin quer revisar todos os artigos em progresso para decidir quais publicar.

---

### 3. Duplicar Artigo para Criar Variação

```bash
curl -X POST "http://localhost:8080/api/v1/admin/educational-articles/abc123/duplicate" \
  -H "Authorization: Bearer {admin-token}"
```

**Cenário:** Admin tem artigo "Nutrição para Cães" e quer criar "Nutrição para Gatos" baseado nele.

**Fluxo:**
1. Duplica o artigo (retorna cópia como rascunho)
2. Edita título, summary e body da cópia
3. Publica quando pronto

---

## Auditoria

Todas as ações são registradas automaticamente:

### `view_overview_stats`
```json
{
  "action": "view_overview_stats",
  "entity_type": "Admin",
  "user_id": "admin-uuid",
  "metadata": {
    "users": {"total": 1250, "admins": 3},
    "pets": {"total": 2890},
    ...
  }
}
```

### Duplicação de Artigo
A duplicação cria um novo artigo, então é auditada como `created`:
```json
{
  "action": "created",
  "entity_type": "EducationalArticle",
  "entity_id": "new-article-uuid",
  "user_id": "admin-uuid"
}
```

---

## Casos de Erro

### 401 - Não Autenticado
```json
{
  "message": "Unauthenticated."
}
```

### 403 - Não é Admin
```json
{
  "message": "This action is unauthorized."
}
```

### 404 - Artigo Não Encontrado (duplicate)
```json
{
  "message": "Model not found."
}
```

---

## Integração com Outros Módulos

### Módulo 4 - Admin
Os novos endpoints estendem funcionalidades administrativas existentes.

### Módulo 5 - Auditoria
Todas as ações são automaticamente auditadas via `AuditService`.

### Módulo 14 - Educational Articles
- `drafts` e `duplicate` são extensões do CRUD de artigos
- Usam a mesma Policy (EducationalArticlePolicy)

---

## Testes

### Teste: Overview Stats

```php
/** @test */
public function admin_can_view_overview_stats(): void
{
    $admin = User::factory()->create(['is_admin' => true]);
    
    // Cria dados de teste
    User::factory()->count(10)->create();
    Pet::factory()->count(25)->create();
    Reminder::factory()->count(5)->active()->create();
    EducationalArticle::factory()->count(3)->published()->create();
    EducationalArticle::factory()->count(2)->draft()->create();
    
    $response = $this->actingAs($admin)
        ->getJson('/v1/admin/stats/overview');
    
    $response->assertStatus(200)
        ->assertJson([
            'users' => ['total' => 11, 'admins' => 1],
            'pets' => ['total' => 25],
            'reminders' => ['active' => 5],
            'educational_articles' => [
                'published' => 3,
                'drafts' => 2
            ]
        ]);
}

/** @test */
public function regular_user_cannot_view_overview_stats(): void
{
    $user = User::factory()->create(['is_admin' => false]);
    
    $response = $this->actingAs($user)
        ->getJson('/v1/admin/stats/overview');
    
    $response->assertStatus(403);
}
```

### Teste: Drafts

```php
/** @test */
public function admin_can_list_drafts(): void
{
    $admin = User::factory()->create(['is_admin' => true]);
    
    // Cria artigos publicados e rascunhos
    EducationalArticle::factory()->count(3)->published()->create();
    EducationalArticle::factory()->count(2)->draft()->create();
    
    $response = $this->actingAs($admin)
        ->getJson('/v1/admin/educational-articles/drafts');
    
    $response->assertStatus(200)
        ->assertJsonCount(2, 'data');
}
```

### Teste: Duplicate

```php
/** @test */
public function admin_can_duplicate_article(): void
{
    $admin = User::factory()->create(['is_admin' => true]);
    $article = EducationalArticle::factory()->create([
        'title' => 'Artigo Original',
        'summary' => 'Resumo original',
        'body' => 'Conteúdo original',
        'tags' => ['Tag1'],
        'published_at' => now(),
    ]);
    
    $response = $this->actingAs($admin)
        ->postJson("/v1/admin/educational-articles/{$article->id}/duplicate");
    
    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'data' => ['id', 'title', 'slug', 'summary', 'body', 'tags']
        ]);
    
    $duplicated = EducationalArticle::where('title', 'Artigo Original (Cópia)')->first();
    
    $this->assertNotNull($duplicated);
    $this->assertEquals($article->summary, $duplicated->summary);
    $this->assertEquals($article->body, $duplicated->body);
    $this->assertEquals($article->tags, $duplicated->tags);
    $this->assertNull($duplicated->published_at); // Rascunho
    $this->assertEquals($admin->id, $duplicated->created_by);
}

/** @test */
public function duplicate_handles_title_conflicts(): void
{
    $admin = User::factory()->create(['is_admin' => true]);
    $article = EducationalArticle::factory()->create([
        'title' => 'Artigo Original'
    ]);
    
    // Cria primeira cópia
    $this->actingAs($admin)
        ->postJson("/v1/admin/educational-articles/{$article->id}/duplicate");
    
    // Cria segunda cópia
    $response = $this->actingAs($admin)
        ->postJson("/v1/admin/educational-articles/{$article->id}/duplicate");
    
    $response->assertStatus(201);
    
    $secondCopy = EducationalArticle::where('title', 'Artigo Original (Cópia 2)')->first();
    $this->assertNotNull($secondCopy);
}
```

---

## Melhorias Futuras

- [ ] Endpoint para estatísticas detalhadas por período
- [ ] Bulk operations (publicar múltiplos rascunhos)
- [ ] Exportar estatísticas em CSV/PDF
- [ ] Comparação de períodos (crescimento mês a mês)
- [ ] Alertas quando há muitos rascunhos antigos
- [ ] Template system para duplicação com modificações
- [ ] Duplicar com tradução automática (integração IA)
- [ ] Visualização de diferenças entre original e cópia

---

## Critérios de Aceite ✅

- [x] Endpoint `/admin/stats/overview` retorna contagens corretas
- [x] Endpoint `/admin/educational-articles/drafts` lista apenas rascunhos
- [x] Endpoint `/admin/educational-articles/{id}/duplicate` cria cópia funcional
- [x] Duplicação sempre cria como rascunho (published_at = null)
- [x] Duplicação gera slug único
- [x] Duplicação trata conflitos de título
- [x] Apenas admins podem acessar endpoints
- [x] Documentação Swagger inline completa
- [x] Auditoria automática das ações

---

## Arquivos do Módulo

```
app/Http/Controllers/
├── AdminController.php (método overview adicionado)
└── EducationalArticleController.php (métodos drafts e duplicate adicionados)

routes/
└── api.php (3 novas rotas)

docs/
└── MODULO_18_ADMIN_CONTENT_TOOLS.md
```

---

## Conclusão

O Módulo 18 fornece ferramentas essenciais para administradores gerenciarem a plataforma de forma eficiente. As funcionalidades de estatísticas, gerenciamento de rascunhos e duplicação de artigos melhoram significativamente a produtividade administrativa.
