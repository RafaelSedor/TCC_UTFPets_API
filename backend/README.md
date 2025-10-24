# UTFPets API - Backend

> API RESTful para gerenciamento colaborativo de pets e suas refeições

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2-purple)](https://php.net)
[![Tests](https://img.shields.io/badge/tests-180+-brightgreen)](/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-green)](/)

## Sobre

Este é o backend da aplicação UTFPets, desenvolvido em **Laravel 12.x**. Faz parte de um **monorepo** que também inclui o [frontend Angular](../frontend/).

Para documentação completa do projeto, consulte o [README principal](../README.md).

## Principais Funcionalidades

- **Autenticação JWT**: Sistema completo de registro e autenticação
- **Gerenciamento de Pets**: CRUD completo com soft delete e upload de fotos
- **Controle de Refeições**: Registro e acompanhamento detalhado
- **Compartilhamento Flexível**:
  - Por Location: Compartilhe uma location inteira e todos os seus pets
  - Por Pet Individual: Compartilhe pets específicos quando necessário
  - Sistema colaborativo com 3 papéis (owner/editor/viewer)
- **Lembretes Inteligentes**: Agendamento com recorrência e timezone
- **Sistema de Notificações**: Histórico completo com controle de leitura
- **Painel Administrativo**: Gestão de usuários, pets e auditoria
- **Push Notifications**: Integração com Firebase Cloud Messaging

## Tecnologias

- **Laravel 12.x** - Framework PHP
- **PostgreSQL** - Banco de dados relacional (Cloud SQL em produção)
- **Docker** - Containerização
- **JWT** - Autenticação stateless
- **Cloudinary** - Armazenamento de imagens
- **Firebase Cloud Messaging** - Push notifications
- **PHPUnit** - Testes automatizados (180+ testes)

## Início Rápido

### Desenvolvimento Local

```bash
# Da raiz do monorepo
cd backend

# Copiar .env
cp .env.example .env

# Editar .env com suas credenciais
# DB_CONNECTION=pgsql
# DB_HOST=postgres
# CLOUDINARY_URL=...
# JWT_SECRET=...

# Voltar para raiz
cd ..

# Iniciar containers
docker-compose -f docker-compose.local.yml up -d

# Executar migrations
docker-compose exec backend php artisan migrate --seed

# Acessar API
# http://localhost:8080
```

### Estrutura do Backend

```
backend/
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
├── Dockerfile                 # Imagem Docker
├── composer.json              # Dependências PHP
└── phpunit.xml                # Config de testes
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
- `GET /api/v1/locations/{location}/share` - Lista participantes
- `POST /api/v1/locations/{location}/share` - Compartilha location
- `PATCH /api/v1/locations/{location}/share/{user}` - Altera papel
- `DELETE /api/v1/locations/{location}/share/{user}` - Revoga acesso

### Compartilhamento de Pets Individuais
- `GET /api/v1/pets/{pet}/share` - Lista participantes do pet
- `POST /api/v1/pets/{pet}/share` - Compartilha pet específico
- `POST /api/v1/pets/{pet}/share/{user}/accept` - Aceita convite
- `PATCH /api/v1/pets/{pet}/share/{user}` - Altera papel

**Ver todos os endpoints**: https://api.utfpets.online/swagger

## Sistema de Permissões

| Ação | Owner | Editor | Viewer |
|------|-------|--------|--------|
| Visualizar pet | ✅ | ✅ | ✅ |
| Editar pet | ✅ | ❌ | ❌ |
| Deletar pet | ✅ | ❌ | ❌ |
| Criar/Editar refeição | ✅ | ✅ | ❌ |
| Gerenciar compartilhamento | ✅ | ❌ | ❌ |

## Testes

### Executar todos os testes

```bash
# Da raiz do monorepo
docker-compose exec backend php artisan test

# Com coverage
docker-compose exec backend php artisan test --coverage
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

## Comandos Úteis

### Artisan

```bash
# Limpar cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear

# Migrations
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan migrate:fresh --seed

# Tinker (REPL)
docker-compose exec backend php artisan tinker

# Criar controller
docker-compose exec backend php artisan make:controller NomeController

# Criar model
docker-compose exec backend php artisan make:model Nome -mf
```

### Composer

```bash
# Instalar dependências
docker-compose exec backend composer install

# Atualizar dependências
docker-compose exec backend composer update

# Adicionar pacote
docker-compose exec backend composer require vendor/package
```

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

## Documentação

- [Índice Completo](docs/INDEX.md)
- [Compartilhamento de Pets](docs/MODULO_1_COMPARTILHAMENTO.md)
- [Lembretes](docs/MODULO_2_LEMBRETES.md)
- [Notificações](docs/MODULO_3_NOTIFICACOES.md)
- [Painel Admin](docs/MODULO_4_ADMIN.md)
- [Deploy na Google Cloud](docs/DEPLOY.md)

## Variáveis de Ambiente

Ver [.env.example](.env.example) para lista completa.

Principais:

```env
# Application
APP_KEY=base64:...
APP_URL=https://api.utfpets.online

# Database (Cloud SQL)
CLOUD_SQL_CONNECTION_NAME=tccutfpets:southamerica-east1:tcc
DB_CONNECTION=pgsql
DB_HOST=cloud-sql-proxy
DB_DATABASE=utfpets

# JWT
JWT_SECRET=...
JWT_TTL=60

# Cloudinary
CLOUDINARY_URL=cloudinary://...
```

## Segurança

- **HTTPS only** em produção
- **JWT tokens** com expiração
- **CORS** configurado para frontend específico
- **SQL Injection** prevenido via Eloquent
- **XSS** sanitização automática
- **CSRF** tokens nas rotas web
- **Rate limiting** em endpoints sensíveis
- **Security headers** via middleware

## Deploy

Ver [docs/DEPLOY.md](docs/DEPLOY.md) para instruções completas.

Resumo:
1. Push para `master` trigger CI/CD
2. GitHub Actions executa testes
3. Deploy automático para GCP VM
4. Migrations executadas
5. Cache otimizado

## Troubleshooting

### Container não inicia

```bash
docker-compose logs backend
```

### Erro de permissões

```bash
sudo chown -R 1000:1000 storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Migrations falhando

```bash
# Verificar conexão com banco
docker-compose exec backend php artisan tinker
>>> DB::connection()->getPdo();
```

## Autor

**Rafael Sedor Oliveira Deda**
Trabalho de Conclusão de Curso (TCC) - UTFPR
Tecnologia em Análise e Desenvolvimento de Sistemas

## Licença

Este projeto é de código aberto sob a licença MIT.

---

**Documentação completa do monorepo**: [../README.md](../README.md)
