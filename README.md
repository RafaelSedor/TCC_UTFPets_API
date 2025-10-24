# UTFPets - Monorepo

> Aplicação web completa para gerenciamento colaborativo de pets e suas refeições

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red)](https://laravel.com)
[![Angular](https://img.shields.io/badge/Angular-17-red)](https://angular.io)
[![PHP](https://img.shields.io/badge/PHP-8.2-purple)](https://php.net)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://typescriptlang.org)
[![Tests](https://img.shields.io/badge/tests-180+-brightgreen)](/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-green)](/)

## Sobre o Projeto

O UTFPets é uma solução completa (frontend + backend) para gerenciamento de pets e suas refeições, com foco em **colaboração entre múltiplos usuários**. Desenvolvido como Trabalho de Conclusão de Curso (TCC) na UTFPR.

### Arquitetura Monorepo

Este projeto adota a abordagem **Monorepo**, onde todo o código-fonte (frontend Angular, backend Laravel e scripts de deploy) encontra-se em um único repositório Git. Essa decisão baseou-se em:

- **Versionamento atômico:** Mudanças em API e interface em commits únicos
- **Dependências compartilhadas:** Tipagens TypeScript geradas dos endpoints Laravel
- **Testes integrados:** Testes E2E com Selenium orquestrando frontend e backend
- **Deploy sincronizado:** Uma única pipeline CI/CD para versões compatíveis

### Principais Funcionalidades

- **Autenticação JWT**: Sistema completo de registro e autenticação
- **Gerenciamento de Pets**: CRUD completo com soft delete e upload de fotos
- **Controle de Refeições**: Registro e acompanhamento detalhado
- **Compartilhamento Flexível**:
  - Por Location: Compartilhe uma location inteira e todos os seus pets
  - Por Pet Individual: Compartilhe pets específicos quando necessário
  - Sistema colaborativo com 3 papéis (owner/editor/viewer)
- **Lembretes Inteligentes**: Agendamento com recorrência e timezone
- **Sistema de Notificações**: Histórico completo com controle de leitura
- **PWA**: Progressive Web App para instalação em dispositivos móveis

## Tecnologias

### Backend
- **Laravel 12.x** - Framework PHP
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação stateless
- **Cloudinary** - Armazenamento de imagens
- **Firebase Cloud Messaging** - Push notifications
- **PHPUnit** - Testes automatizados (180+ testes)

### Frontend
- **Angular 17** - Framework TypeScript com Standalone Components
- **Angular Material** - Componentes UI
- **RxJS** - Programação reativa
- **PWA** - Service Workers e manifest
- **Jasmine/Karma** - Testes unitários

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **Nginx** - Servidor web e proxy reverso
- **Google Cloud Platform**:
  - Compute Engine (VM)
  - Cloud SQL (PostgreSQL)
  - Let's Encrypt (SSL/TLS)
- **GitHub Actions** - CI/CD automatizado

## Estrutura do Projeto

```
TCC_UTFPets/
├── backend/                    # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── tests/
│   ├── docs/
│   ├── Dockerfile
│   └── composer.json
│
├── frontend/                   # Angular PWA
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/      # Módulos por funcionalidade
│   │   │   ├── core/          # Services, Guards, Interceptors
│   │   │   └── shared/        # Componentes reutilizáveis
│   │   ├── assets/
│   │   └── environments/
│   ├── Dockerfile
│   ├── angular.json
│   └── package.json
│
├── tests/                      # Testes E2E Selenium
│   └── e2e/
│
├── nginx/                      # Configurações Nginx
│   ├── utfpets.online.conf    # Frontend
│   └── api.utfpets.online.conf # Backend API
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD unificado
│
├── docker-compose.yml          # Orquestração produção
├── docker-compose.local.yml    # Desenvolvimento local
└── README.md
```

## Início Rápido

### Pré-requisitos

- Docker Desktop (Windows/Mac) ou Docker Engine (Linux)
- Docker Compose v2.0+
- Git
- Conta Cloudinary (para upload de imagens)
- Conta Google Cloud (para banco de produção)

### Instalação Local

1. **Clone o repositório:**
```bash
git clone https://github.com/RafaelSedor/TCC_UTFPets_API.git
cd TCC_UTFPets_API
```

2. **Configure o ambiente backend:**
```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com suas credenciais:
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
```

3. **Configure o ambiente frontend:**
```bash
cp frontend/src/environments/environment.example.ts frontend/src/environments/environment.ts
```

4. **Coloque as credenciais do GCP:**
```bash
mkdir -p backend/storage/keys
# Copie o arquivo de credenciais para backend/storage/keys/gcp-service-account.json
```

5. **Inicie os containers:**
```bash
docker-compose -f docker-compose.local.yml up -d
```

6. **Execute as migrações:**
```bash
docker-compose exec backend php artisan migrate --seed
```

7. **Acesse a aplicação:**
```
Frontend: http://localhost:4200
API: http://localhost:8080
Swagger UI: http://localhost:8081/swagger
```

## Deploy em Produção

O projeto está configurado para deploy automático na Google Cloud VM via GitHub Actions.

### Domínios
- **Frontend:** https://utfpets.online
- **API:** https://api.utfpets.online
- **Swagger UI:** https://api.utfpets.online/swagger

### Infraestrutura GCP
- **VM:** e2-small (Compute Engine) em southamerica-east1
- **Banco de Dados:** Cloud SQL PostgreSQL
- **SSL/TLS:** Let's Encrypt (renovação automática)
- **Containers:** Docker Compose com 5 serviços

Documentação completa: [backend/docs/DEPLOY.md](backend/docs/DEPLOY.md)

## Desenvolvimento

### Backend (Laravel)

```bash
# Executar testes
docker-compose exec backend php artisan test

# Limpar cache
docker-compose exec backend php artisan cache:clear

# Migrations
docker-compose exec backend php artisan migrate

# Tinker (REPL)
docker-compose exec backend php artisan tinker
```

### Frontend (Angular)

```bash
# Entrar no container
cd frontend

# Instalar dependências
npm install

# Servidor de desenvolvimento
npm start

# Build de produção
npm run build:prod

# Testes unitários
npm test

# Testes E2E
npm run e2e
```

### Testes E2E (Selenium)

```bash
# Executar todos os testes E2E
docker-compose -f docker-compose.e2e.yml up --abort-on-container-exit
```

## Endpoints Principais da API

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

### Compartilhamento
- `GET /api/v1/locations/{location}/share` - Lista participantes
- `POST /api/v1/locations/{location}/share` - Compartilha location
- `PATCH /api/v1/locations/{location}/share/{user}` - Altera papel

**Ver todos os endpoints:** https://api.utfpets.online/swagger

## Sistema de Permissões

### Papéis de Usuário

| Ação | Owner | Editor | Viewer |
|------|-------|--------|--------|
| Visualizar pet | ✅ | ✅ | ✅ |
| Editar pet | ✅ | ❌ | ❌ |
| Deletar pet | ✅ | ❌ | ❌ |
| Criar/Editar refeição | ✅ | ✅ | ❌ |
| Gerenciar compartilhamento | ✅ | ❌ | ❌ |

## Documentação

- [Backend API Documentation](backend/docs/INDEX.md)
- [Frontend Development Guide](frontend/README.md)
- [Deployment Guide](backend/docs/DEPLOY.md)
- [Testing Guide](tests/README.md)
- [Architecture Decision Records](docs/ADR.md)

## Metodologia Ágil

O projeto segue **Scrum** com sprints de 2 semanas e **Kanban** para visualização do fluxo de trabalho:

- **Planejamento:** Priorização via método MoSCoW
- **Desenvolvimento:** Entregas incrementais
- **Testes:** Automatizados (unitários, integração, E2E)
- **Review & Retrospectiva:** Ao final de cada sprint

## Testes

- **Backend:** 180+ testes (PHPUnit)
- **Frontend:** Testes unitários (Jasmine/Karma)
- **E2E:** Selenium WebDriver
- **Cobertura:** Core 100% funcional

## Containers e Portas

### Desenvolvimento Local
- **Frontend:** http://localhost:4200
- **API (Laravel):** http://localhost:8080
- **PostgreSQL:** localhost:5432
- **Swagger UI:** http://localhost:8081

### Produção
- **Frontend:** https://utfpets.online
- **API:** https://api.utfpets.online
- **PostgreSQL:** Cloud SQL (privado)
- **Swagger UI:** https://api.utfpets.online/swagger

## Autor

**Rafael Sedor Oliveira Deda**
Trabalho de Conclusão de Curso (TCC) - UTFPR
Tecnologia em Análise e Desenvolvimento de Sistemas

## Licença

Este projeto é de código aberto sob a licença MIT.

---

🐾 **UTFPets - Cuidando dos pets com tecnologia!** 🐾
