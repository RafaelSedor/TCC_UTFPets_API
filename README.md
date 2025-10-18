# UTFPets API

> API RESTful para gerenciamento colaborativo de pets e suas refeições

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2-purple)](https://php.net)
[![Tests](https://img.shields.io/badge/tests-180+-brightgreen)](/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-green)](/)

## Sobre o Projeto

A UTFPets API é uma aplicação backend desenvolvida em Laravel 12.x que oferece uma solução completa para gerenciamento de pets e suas refeições, com foco em **colaboração entre múltiplos usuários**. Desenvolvida como Trabalho de Conclusão de Curso (TCC) na UTFPR.

### Principais Funcionalidades

- **Autenticação JWT**: Sistema completo de registro e autenticação
- **Gerenciamento de Pets**: CRUD completo com soft delete e upload de fotos
- **Controle de Refeições**: Registro e acompanhamento detalhado
- **Compartilhamento Flexível**:
  - **Por Location**: Compartilhe uma location inteira e todos os seus pets de uma vez
  - **Por Pet Individual**: Compartilhe pets específicos quando necessário
  - Sistema colaborativo com 3 papéis (owner/editor/viewer)
- **Lembretes Inteligentes**: Agendamento com recorrência e timezone
- **Sistema de Notificações**: Histórico completo com controle de leitura
- **Painel Administrativo**: Gestão de usuários, pets e auditoria
- **Locations**: Organização hierárquica (User → Location → Pet)
- **Push Notifications**: Integração com Firebase Cloud Messaging
- **Histórico de Peso**: Rastreamento da evolução do peso
- **Exportação de Calendário**: Feed ICS compatível com RFC 5545

## Tecnologias

- **Laravel 12.x** - Framework PHP
- **PostgreSQL** - Banco de dados relacional (local via Docker + Google Cloud SQL em produção)
- **Docker & Docker Compose** - Containerização
- **JWT** - Autenticação stateless
- **Cloudinary** - Armazenamento de imagens
- **Firebase Cloud Messaging** - Push notifications
- **Swagger UI** - Documentação interativa OpenAPI 3.0
- **PHPUnit** - Testes automatizados (180+ testes)

## Início Rápido

### Pré-requisitos

- Docker Desktop (Windows/Mac) ou Docker Engine (Linux)
- Docker Compose v2.0+
- Git
- Conta Cloudinary (para upload de imagens)
- Conta Google Cloud (para banco de produção)

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/TCC_UTFPets_API.git
cd TCC_UTFPets_API
```

2. **Configure o ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Banco de Dados (Google Cloud SQL)
CLOUD_SQL_CONNECTION_NAME=seu-projeto:regiao:instancia
DB_CONNECTION=pgsql
DB_HOST=cloud-sql-proxy
DB_PORT=5432
DB_DATABASE=utfpets
DB_USERNAME=postgres
DB_PASSWORD=sua_senha

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# JWT
JWT_SECRET=sua_jwt_secret

# Firebase (opcional)
FCM_CREDENTIALS_PATH=/var/www/storage/keys/firebase-adminsdk.json
```

3. **Coloque as credenciais do GCP:**
```bash
mkdir -p storage/keys
# Copie o arquivo de credenciais para storage/keys/gcp-service-account.json
```

4. **Inicie os containers:**
```bash
docker-compose up -d
```

5. **Execute as migrações:**
```bash
docker-compose exec app php artisan migrate --force
```

6. **Acesse a documentação interativa:**
```
http://localhost:8081/swagger
```

## Estrutura do Projeto

```
TCC_UTFPets_API/
├── app/
│   ├── Console/Commands/      # Comandos Artisan
│   ├── Enums/                 # PHP 8.2 Enums (7 enums)
│   ├── Events/                # Eventos do sistema
│   ├── Http/
│   │   ├── Controllers/       # Controllers da API
│   │   ├── Middleware/        # CORS, Security Headers, IsAdmin
│   │   └── Requests/          # Form Requests para validação
│   ├── Jobs/                  # Background Jobs
│   ├── Models/                # Eloquent Models
│   ├── Policies/              # Authorization Policies
│   ├── Services/              # Service Layer
│   └── Traits/                # Traits reutilizáveis
├── database/
│   ├── migrations/            # Migrations do banco
│   ├── factories/             # Factories para testes
│   └── seeders/               # Seeders
├── docs/                      # Documentação completa
├── routes/
│   ├── api.php                # Rotas da API
│   └── web.php                # Rotas web
├── tests/
│   └── Feature/               # Testes de feature
├── docker-compose.yml         # Orquestração de containers
└── Dockerfile                 # Imagem da aplicação
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Informações do usuário autenticado

### Pets
- `GET /api/v1/pets` - Lista todos os pets do usuário
- `POST /api/v1/pets` - Cadastra um novo pet
- `GET /api/v1/pets/{id}` - Detalhes de um pet
- `PUT /api/v1/pets/{id}` - Atualiza informações
- `DELETE /api/v1/pets/{id}` - Remove um pet (soft delete)

### Refeições
- `GET /api/v1/pets/{pet}/meals` - Lista refeições
- `POST /api/v1/pets/{pet}/meals` - Registra nova refeição
- `POST /api/v1/pets/{pet}/meals/{id}/consume` - Marca como consumida

### Compartilhamento de Locations
- `GET /api/v1/locations/{location}/share` - Lista participantes da location
- `POST /api/v1/locations/{location}/share` - Compartilha location (todos os pets)
- `POST /api/v1/locations/{location}/share/{user}/accept` - Aceita convite
- `PATCH /api/v1/locations/{location}/share/{user}` - Altera papel
- `DELETE /api/v1/locations/{location}/share/{user}` - Revoga acesso

### Compartilhamento de Pets Individuais
- `GET /api/v1/pets/{pet}/share` - Lista participantes do pet
- `POST /api/v1/pets/{pet}/share` - Compartilha pet específico
- `POST /api/v1/pets/{pet}/share/{user}/accept` - Aceita convite
- `PATCH /api/v1/pets/{pet}/share/{user}` - Altera papel
- `DELETE /api/v1/pets/{pet}/share/{user}` - Revoga acesso

### Lembretes
- `GET /api/v1/pets/{pet}/reminders` - Lista lembretes
- `POST /api/v1/pets/{pet}/reminders` - Cria lembrete
- `POST /api/v1/reminders/{id}/snooze` - Adia lembrete
- `POST /api/v1/reminders/{id}/complete` - Marca como concluído

### Notificações
- `GET /api/v1/notifications` - Lista notificações
- `PATCH /api/v1/notifications/{notification}/read` - Marca como lida
- `POST /api/v1/notifications/mark-all-read` - Marca todas como lidas

### Admin
- `GET /api/v1/admin/users` - Lista usuários
- `GET /api/v1/admin/pets` - Lista pets do sistema
- `GET /api/v1/admin/audit-logs` - Logs de auditoria
- `GET /api/v1/admin/stats/overview` - Estatísticas gerais

**Ver todos os endpoints:** http://localhost:8081/swagger

## Sistema de Permissões

### Tipos de Compartilhamento

**1. Compartilhamento por Location** (Recomendado para múltiplos pets)
- Compartilha automaticamente TODOS os pets da location
- Ideal para famílias, clínicas veterinárias, canis
- Novos pets adicionados à location são automaticamente compartilhados

**2. Compartilhamento por Pet Individual** (Para casos específicos)
- Compartilha apenas um pet específico
- Útil quando não se deseja compartilhar todos os animais da location
- Tem prioridade sobre o compartilhamento de location

### Tabela de Permissões

| Ação | Owner | Editor | Viewer |
|------|-------|--------|--------|
| Visualizar pet | ✅ | ✅ | ✅ |
| Editar pet | ✅ | ❌ | ❌ |
| Deletar pet | ✅ | ❌ | ❌ |
| Criar/Editar refeição | ✅ | ✅ | ❌ |
| Gerenciar compartilhamento | ✅ | ❌ | ❌ |

### Hierarquia de Acesso

**Prioridade de permissões:**
1. **Owner do Pet/Location** (criador original) → Acesso total
2. **Compartilhamento direto do Pet** → Papel específico (editor/viewer)
3. **Compartilhamento da Location** → Papel específico (editor/viewer)
4. **Sem acesso** → Negado

**Regras:**
- Apenas 1 owner por pet/location (o criador original)
- Owner pode convidar outros como editor ou viewer
- Convites ficam pendentes até serem aceitos
- Owner pode alterar papéis e revogar acessos a qualquer momento
- Se um pet é compartilhado individualmente E via location, o compartilhamento individual tem prioridade

## Testes

### Executar todos os testes
```bash
docker-compose exec app php artisan test
```

### Cobertura
- **AuthTest**: 5 testes (registro, login, logout)
- **PetTest**: 6 testes (CRUD completo)
- **MealTest**: 6 testes (CRUD completo)
- **ReminderTest**: 14 testes (agendamento, recorrência)
- **SharedPetTest**: 14 testes (compartilhamento e permissões)
- **NotificationTest**: 9 testes (sistema de notificações)
- **AdminTest**: 13 testes (painel administrativo)
- **LocationTest**: 14 testes (gestão de locais)

**Total: 180+ testes | Core 100% funcional** ✅

## Documentação

### Swagger UI (Interativo)
Acesse: **http://localhost:8081/swagger**

A documentação inclui:
- 52+ endpoints com exemplos prontos
- Sistema de autenticação integrado
- Descrição completa de permissões e validações
- Códigos de erro documentados

### Como testar no Swagger UI
1. Acesse http://localhost:8081/swagger
2. Registre um usuário em `/auth/register`
3. Copie o `token` retornado
4. Clique em **"Authorize"** no topo
5. Cole o token e teste os endpoints

### Documentação Adicional
- [📚 Índice Completo](docs/INDEX.md)
- [Compartilhamento de Pets](docs/MODULO_1_COMPARTILHAMENTO.md)
- [Lembretes](docs/MODULO_2_LEMBRETES.md)
- [Notificações](docs/MODULO_3_NOTIFICACOES.md)
- [Painel Admin](docs/MODULO_4_ADMIN.md)
- [Deploy na Google Cloud](docs/DEPLOY.md)

## Containers e Portas

- **API (Laravel)**: exposto via Nginx
- **Nginx**: http://localhost:80 (produção: https://api.utfpets.online)
- **Cloud SQL Proxy**: localhost:5432 (interno)
- **Swagger UI**: http://localhost:8081/swagger

## Comandos Úteis

### Database
```bash
# Executar migrations
docker-compose exec app php artisan migrate

# Executar migrations fresh com seeds
docker-compose exec app php artisan migrate:fresh --seed

# Limpar cache
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
```

### Queue
```bash
# Processar jobs em background
docker-compose exec app php artisan queue:work

# Retry de dead letters
docker-compose exec app php artisan retry:dead-letters
```

### Logs
```bash
# Logs da aplicação
docker-compose logs app

# Logs do Nginx
docker-compose logs nginx

# Todos os logs
docker-compose logs -f
```

### Containers
```bash
# Status dos containers
docker-compose ps

# Reiniciar containers
docker-compose restart

# Rebuild completo
docker-compose down
docker-compose up --build -d
```

## Troubleshooting

### Container da aplicação parado
```bash
docker-compose up -d app
```

### Problemas com dependências
```bash
docker-compose exec app composer install
```

### Verificar logs de erros
```bash
docker-compose logs app
tail -f storage/logs/laravel.log
```

### Reiniciar tudo
```bash
docker-compose down
docker-compose up --build -d
docker-compose exec app php artisan migrate --force
```

## Deploy em Produção

O projeto está configurado para deploy automático na Google Cloud VM via GitHub Actions.

**Guia completo:** [docs/DEPLOY.md](docs/DEPLOY.md)

**Infraestrutura:**
- Google Compute Engine (VM)
- Google Cloud SQL (PostgreSQL)
- Let's Encrypt (SSL/TLS)
- Docker Compose
- Nginx

## Arquitetura

O projeto segue as melhores práticas do Laravel:

- **MVC Pattern**: Controllers, Models, Views (API)
- **Service Layer**: Lógica de negócio centralizada
- **Form Requests**: Validação de entrada isolada
- **Policies**: Autorização baseada em permissões
- **Events**: Sistema de eventos para ações importantes
- **Repository Pattern**: Eloquent ORM com relacionamentos
- **Middleware**: CORS, JWT, Security Headers
- **PHP 8.2 Enums**: Type-safe para roles e status

## Autor

**Rafael Sedor Oliveira Deda**
Trabalho de Conclusão de Curso (TCC)

## Licença

Este projeto é de código aberto sob a licença MIT.

---

🐾 **UTFPets API - Cuidando dos pets com tecnologia!** 🐾
