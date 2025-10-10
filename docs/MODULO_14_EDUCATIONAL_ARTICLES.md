# MÓDULO 14 — Educational Articles (HU011)

## Objetivo

Disponibilizar uma seção educativa com conteúdo de nutrição e segurança alimentar de pets, permitindo:
- Acesso público à listagem e visualização de artigos publicados
- Busca por termos e filtro por tags
- CRUD completo restrito a administradores
- Sistema de publicação com controle de rascunhos

---

## Estrutura do Banco de Dados

### Tabela: `educational_articles`

```sql
CREATE TABLE educational_articles (
    id UUID PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    body LONGTEXT NOT NULL,
    tags JSON NULL,
    published_at TIMESTAMP NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_slug (slug),
    INDEX idx_published_at (published_at),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

**Campos:**
- `id`: UUID do artigo
- `title`: Título único do artigo (8-120 caracteres)
- `slug`: URL amigável gerada automaticamente do título
- `summary`: Resumo do artigo (máximo 300 caracteres)
- `body`: Conteúdo completo em HTML/Markdown
- `tags`: Array JSON de tags (máximo 10)
- `published_at`: Data/hora de publicação (NULL = rascunho)
- `created_by`: UUID do admin que criou o artigo
- `deleted_at`: Soft delete

---

## Model: EducationalArticle

### Relacionamentos
- `creator()`: BelongsTo User (quem criou o artigo)

### Scopes

#### `published()`
Retorna apenas artigos publicados (published_at não nulo e <= now).

```php
EducationalArticle::published()->get();
```

#### `search($searchTerm)`
Busca por termo no title, summary ou body.

```php
EducationalArticle::search('nutrição')->get();
```

#### `withTags($tags)`
Filtra artigos que contenham pelo menos uma das tags especificadas.

```php
EducationalArticle::withTags(['Cães', 'Nutrição'])->get();
```

### Exemplo de Uso

```php
$articles = EducationalArticle::query()
    ->published()
    ->search('alimentos proibidos')
    ->withTags(['Cães'])
    ->orderByDesc('published_at')
    ->paginate(15);
```

---

## Service: SlugService

Serviço utilitário para geração de slugs únicos.

### `SlugService::uniqueFor($modelClass, $text, $ignoreId = null)`

Gera um slug único baseado no texto fornecido, incrementando contador se necessário.

**Parâmetros:**
- `$modelClass`: Classe do model (ex: `EducationalArticle::class`)
- `$text`: Texto para gerar o slug
- `$ignoreId`: ID a ignorar na verificação de unicidade (útil em updates)

**Exemplo:**
```php
$slug = SlugService::uniqueFor(EducationalArticle::class, 'Nutrição Balanceada');
// Retorna: "nutricao-balanceada"

// Se já existir, retorna: "nutricao-balanceada-2"
```

---

## Validação e Segurança

### Validações de Criação (StoreEducationalArticleRequest)

- `title`: obrigatório, 8-120 caracteres, único
- `summary`: obrigatório, máximo 300 caracteres
- `body`: obrigatório, conteúdo HTML
- `tags`: opcional, array de até 10 strings (máximo 50 caracteres cada)
- `published_at`: opcional, data >= (hoje - 1 dia)

### Validações de Atualização (UpdateEducationalArticleRequest)

Todos os campos opcionais, mesmas regras da criação, com adição de:
- `regenerate_slug`: boolean (se true, regenera o slug a partir do título)

### Sanitização de HTML

O sistema implementa as seguintes medidas de segurança:

1. **Bloqueio de tags `<script>`**: Qualquer tentativa de incluir tags script retorna erro 422
2. **Whitelist de tags HTML permitidas**:
   - Formatação: `<p>`, `<strong>`, `<em>`, `<br>`
   - Listas: `<ul>`, `<ol>`, `<li>`
   - Links: `<a>`
   - Títulos: `<h1>`, `<h2>`, `<h3>`, `<h4>`
   - Outros: `<blockquote>`, `<code>`, `<pre>`, `<img>`

3. **Strip de tags não permitidas**: Tags fora da whitelist são automaticamente removidas

---

## Endpoints da API

### Endpoints Públicos (sem autenticação)

#### GET `/educational-articles`
Lista artigos educacionais publicados.

**Query Parameters:**
- `search` (opcional): busca por termo
- `tags[]` (opcional): filtra por tags (pode passar múltiplas)
- `page` (opcional): número da página (padrão: 1)
- `per_page` (opcional): itens por página (padrão: 15, máximo: 50)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Alimentos Proibidos para Cães",
      "slug": "alimentos-proibidos-para-caes",
      "summary": "Descubra quais alimentos são tóxicos...",
      "tags": ["Cães", "Segurança Alimentar"],
      "published_at": "2025-10-05T14:30:00.000000Z",
      "created_at": "2025-10-05T10:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

#### GET `/educational-articles/{slug}`
Exibe detalhes de um artigo publicado.

**Resposta 200:**
```json
{
  "id": "uuid",
  "title": "Alimentos Proibidos para Cães",
  "slug": "alimentos-proibidos-para-caes",
  "summary": "Descubra quais alimentos são tóxicos...",
  "body": "<h2>Introdução</h2><p>Muitos tutores...</p>",
  "tags": ["Cães", "Segurança Alimentar"],
  "published_at": "2025-10-05T14:30:00.000000Z",
  "created_at": "2025-10-05T10:00:00.000000Z",
  "updated_at": "2025-10-05T10:00:00.000000Z",
  "creator": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@utfpets.com"
  }
}
```

**Resposta 404:**
```json
{
  "message": "Artigo não encontrado."
}
```

---

### Endpoints Admin (requer autenticação + is_admin=true)

#### POST `/v1/admin/educational-articles`
Cria um novo artigo educacional.

**Request Body:**
```json
{
  "title": "Nutrição Balanceada para Gatos",
  "summary": "Aprenda sobre as necessidades nutricionais...",
  "body": "<h2>Introdução</h2><p>Gatos são carnívoros...</p>",
  "tags": ["Gatos", "Nutrição", "Saúde"],
  "published_at": "2025-10-08T10:00:00Z"  // null = rascunho
}
```

**Resposta 201:**
```json
{
  "message": "Artigo educacional criado com sucesso.",
  "data": {
    "id": "uuid",
    "title": "Nutrição Balanceada para Gatos",
    "slug": "nutricao-balanceada-para-gatos",
    "summary": "Aprenda sobre as necessidades...",
    "body": "<h2>Introdução</h2>...",
    "tags": ["Gatos", "Nutrição", "Saúde"],
    "published_at": "2025-10-08T10:00:00.000000Z",
    "created_by": "uuid",
    "created_at": "2025-10-08T09:00:00.000000Z"
  }
}
```

#### PATCH `/v1/admin/educational-articles/{id}`
Atualiza um artigo existente.

**Request Body (todos opcionais):**
```json
{
  "title": "Novo Título",
  "summary": "Novo resumo",
  "body": "<p>Novo conteúdo</p>",
  "tags": ["Tag1", "Tag2"],
  "published_at": "2025-10-08T12:00:00Z",
  "regenerate_slug": false  // true para regenerar slug
}
```

**Comportamento do Slug:**
- Por padrão, o slug é mantido mesmo se o título mudar
- Passar `regenerate_slug: true` força a regeneração do slug baseado no novo título
- Isso garante estabilidade de URLs, mas permite atualização quando necessário

**Resposta 200:**
```json
{
  "message": "Artigo educacional atualizado com sucesso.",
  "data": { /* artigo atualizado */ }
}
```

#### DELETE `/v1/admin/educational-articles/{id}`
Remove um artigo (soft delete).

**Resposta 200:**
```json
{
  "message": "Artigo educacional removido com sucesso."
}
```

#### POST `/v1/admin/educational-articles/{id}/publish`
Publica um artigo (define `published_at` para now).

**Resposta 200:**
```json
{
  "message": "Artigo publicado com sucesso.",
  "data": {
    "id": "uuid",
    "title": "Título do Artigo",
    "published_at": "2025-10-08T15:30:00.000000Z"
  }
}
```

---

## Policy: EducationalArticlePolicy

### Permissões

| Ação | Público | Usuário Autenticado | Admin |
|------|---------|-------------------|-------|
| viewAny (lista) | ✅ | ✅ | ✅ |
| view (detalhe) | ✅ | ✅ | ✅ |
| create | ❌ | ❌ | ✅ |
| update | ❌ | ❌ | ✅ |
| delete | ❌ | ❌ | ✅ |
| publish | ❌ | ❌ | ✅ |

**Nota:** Endpoints públicos não requerem autenticação, mas o controller garante que apenas artigos publicados sejam retornados.

---

## Respostas de Erro Padronizadas

### 401 - Não Autenticado
```json
{
  "message": "Unauthenticated."
}
```

### 403 - Forbidden (não é admin)
```json
{
  "message": "This action is unauthorized."
}
```

### 404 - Artigo Não Encontrado
```json
{
  "message": "Artigo não encontrado."
}
```

### 422 - Erro de Validação
```json
{
  "message": "O título é obrigatório.",
  "errors": {
    "title": ["O título é obrigatório."],
    "body": ["O conteúdo não pode conter tags <script>."]
  }
}
```

---

## Seeds

O sistema inclui seeders que criam artigos de exemplo:

### EducationalArticleSeeder

Cria automaticamente:
- **5 artigos publicados** sobre temas variados:
  1. Alimentos Proibidos para Cães
  2. Nutrição Balanceada para Gatos
  3. Como Prevenir a Obesidade em Pets
  4. Suplementos Vitamínicos: Quando São Necessários
  5. Alimentos Naturais Seguros para Compartilhar

- **2 artigos rascunhos** (não publicados):
  1. Dietas Especiais para Pets com Alergias
  2. A Importância da Hidratação

**Executar seeds:**
```bash
php artisan db:seed --class=EducationalArticleSeeder
```

---

## Testes

### Testes Públicos

```bash
# Lista artigos publicados
php artisan test --filter=public_can_list_published_articles

# Busca e filtros
php artisan test --filter=public_can_search_articles
php artisan test --filter=public_can_filter_articles_by_tags

# Visualização
php artisan test --filter=public_can_view_published_article_by_slug
php artisan test --filter=public_cannot_view_draft_article
```

### Testes Admin

```bash
# CRUD
php artisan test --filter=admin_can_create_article
php artisan test --filter=admin_can_update_article
php artisan test --filter=admin_can_delete_article

# Publicação
php artisan test --filter=admin_can_publish_draft_article

# Validações
php artisan test --filter=create_validates_title_length
php artisan test --filter=create_blocks_script_tags_in_body

# Autorização
php artisan test --filter=regular_user_cannot_create_article
```

### Executar Todos os Testes do Módulo

```bash
php artisan test tests/Feature/EducationalArticleTest.php
```

---

## Exemplos de Uso

### Buscar Artigos sobre Cães

```bash
curl "http://localhost:8080/api/educational-articles?tags[]=Cães&per_page=10"
```

### Buscar por Termo

```bash
curl "http://localhost:8080/api/educational-articles?search=nutrição"
```

### Combinar Busca e Tags

```bash
curl "http://localhost:8080/api/educational-articles?search=alimentação&tags[]=Cães&tags[]=Saúde"
```

### Admin: Criar Artigo Rascunho

```bash
curl -X POST http://localhost:8080/api/v1/admin/educational-articles \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu Novo Artigo sobre Pets",
    "summary": "Um resumo informativo",
    "body": "<h2>Introdução</h2><p>Conteúdo do artigo...</p>",
    "tags": ["Cães", "Saúde"]
  }'
```

### Admin: Publicar Artigo

```bash
curl -X POST http://localhost:8080/api/v1/admin/educational-articles/{id}/publish \
  -H "Authorization: Bearer {token}"
```

### Admin: Atualizar Título e Regenerar Slug

```bash
curl -X PATCH http://localhost:8080/api/v1/admin/educational-articles/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título Completamente Novo",
    "regenerate_slug": true
  }'
```

---

## Critérios de Aceite ✅

- [x] Listagem pública retorna apenas artigos com `published_at` não nulo
- [x] Busca por termo funciona no title/summary/body
- [x] Filtro por tags retorna artigos que contenham pelo menos uma das tags
- [x] Slugs são únicos e gerados automaticamente
- [x] Slugs permanecem estáveis após updates (exceto se `regenerate_slug=true`)
- [x] Admin pode criar, editar, publicar e deletar artigos
- [x] Usuários regulares não podem acessar endpoints admin
- [x] Tags `<script>` são bloqueadas
- [x] Apenas tags HTML da whitelist são permitidas
- [x] Paginação funciona corretamente (máximo 50 por página)
- [x] Artigos ordenados por `published_at` desc, depois `created_at` desc
- [x] Soft delete implementado
- [x] Seeds criam 5 artigos publicados + 2 rascunhos
- [x] Testes cobrem todos os cenários (público e admin)
- [x] Documentação Swagger/OpenAPI completa

---

## Integração com Outros Módulos

### Auditoria (Módulo 5)
Para adicionar auditoria aos artigos educacionais:

1. Adicione o trait `Auditable` ao model:
```php
use App\Traits\Auditable;

class EducationalArticle extends Model
{
    use Auditable;
    // ...
}
```

2. Todas as operações de CRUD serão automaticamente logadas em `audit_logs`.

### Notificações (Módulo 3)
Você pode criar notificações quando novos artigos são publicados:

```php
// Em um listener ou observer
Notification::create([
    'user_id' => $user->id,
    'title' => 'Novo Artigo Publicado',
    'body' => "Confira: {$article->title}",
    'data' => ['article_id' => $article->id],
    'channel' => 'db',
]);
```

---

## Melhorias Futuras

- Sistema de comentários em artigos
- Curtidas/reações
- Sistema de recomendação baseado em pets do usuário
- Exportação de artigos para PDF
- Sistema de categorias além de tags
- Versionamento de artigos
- Agendamento de publicação
- Analytics de visualizações
- Sistema de revisão/aprovação

---

## Troubleshooting

### Problema: Slug duplicado ao criar artigo

**Solução:** O sistema incrementa automaticamente o slug. Verifique se o `SlugService` está sendo usado corretamente.

### Problema: Tags script não sendo bloqueadas

**Solução:** Verifique se o método `prepareForValidation()` está sendo executado nos Request classes.

### Problema: Artigos rascunhos aparecendo na listagem pública

**Solução:** Certifique-se de usar o scope `published()` em queries públicas:
```php
EducationalArticle::published()->get();
```

### Problema: 403 ao tentar criar artigo como admin

**Solução:** Verifique se:
1. O usuário tem `is_admin = true` no banco
2. A Policy está registrada em `AuthServiceProvider`
3. O token JWT é válido

---

## Arquivos do Módulo

```
app/
├── Http/
│   ├── Controllers/
│   │   └── EducationalArticleController.php
│   └── Requests/
│       ├── StoreEducationalArticleRequest.php
│       └── UpdateEducationalArticleRequest.php
├── Models/
│   └── EducationalArticle.php
├── Policies/
│   └── EducationalArticlePolicy.php
└── Services/
    └── SlugService.php

database/
├── factories/
│   └── EducationalArticleFactory.php
├── migrations/
│   └── 2025_10_08_000005_create_educational_articles_table.php
└── seeders/
    └── EducationalArticleSeeder.php

tests/
└── Feature/
    └── EducationalArticleTest.php

routes/
└── api.php (rotas adicionadas)

docs/
└── MODULO_14_EDUCATIONAL_ARTICLES.md

public/
└── api-docs.json (documentação Swagger atualizada)
```

---

## Conclusão

O Módulo 14 fornece uma plataforma completa para gerenciamento e distribuição de conteúdo educacional sobre pets. Com endpoints públicos para consulta e área administrativa completa, o sistema permite que tutores de pets tenham acesso a informações confiáveis sobre nutrição e segurança alimentar, enquanto admins mantêm controle total sobre o conteúdo publicado.
