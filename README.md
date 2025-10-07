# 🐾 UTFPets API

> API RESTful para gerenciamento colaborativo de pets e suas refeições

[![Tests](https://img.shields.io/badge/tests-54%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/assertions-240-blue)]()
[![Laravel](https://img.shields.io/badge/Laravel-12.x-red)]()
[![PHP](https://img.shields.io/badge/PHP-8.2-purple)]()

## 🚀 Início Rápido

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/TCC_UTFPets_API.git
cd TCC_UTFPets_API

# Configure e teste (script automatizado)
.\scripts\db-setup.ps1 test   # Windows
./scripts/db-setup.sh test    # Linux/Mac

# Acesse a documentação
http://localhost:8081/swagger
```

## Sobre o Projeto

A UTFPets API é uma aplicação backend desenvolvida em Laravel 12.x que oferece uma solução completa para o gerenciamento de pets e suas refeições com **sistema de compartilhamento colaborativo**. Esta API foi desenvolvida como parte do Trabalho de Conclusão de Curso (TCC) e tem como objetivo auxiliar tutores de pets a manterem um controle adequado da alimentação de seus animais de estimação, permitindo colaboração entre múltiplos usuários.

### Principais Funcionalidades

- 🔐 **Autenticação de Usuários**: Sistema completo de registro e autenticação usando JWT
- 🐾 **Gerenciamento de Pets**: Cadastro, atualização, listagem e remoção de pets (com soft delete)
- 🍽️ **Controle de Refeições**: Registro e acompanhamento das refeições de cada pet
- 📸 **Upload de Imagens**: Integração com Cloudinary para armazenamento de fotos dos pets
- 📊 **Histórico Alimentar**: Acompanhamento do histórico de alimentação de cada pet
- 👥 **Compartilhamento de Pets**: Sistema de colaboração com diferentes papéis de acesso
  - **Owner**: Controle total do pet
  - **Editor**: Pode criar e editar refeições
  - **Viewer**: Apenas visualização
- 🔔 **Sistema de Eventos**: Eventos para notificações futuras (convites, mudanças de papel, etc.)
- ⏰ **Lembretes Inteligentes**: Agendamento de refeições/medicações com recorrência e timezone
- 📱 **Sistema de Notificações**: Histórico completo com controle de leitura e integração automática ⭐ NOVO

### Público-Alvo

- Tutores de pets que desejam um controle mais rigoroso da alimentação de seus animais
- Clínicas veterinárias que precisam acompanhar a dieta de seus pacientes
- Desenvolvedores que desejam integrar funcionalidades de gerenciamento de pets em suas aplicações

### 🏗️ Arquitetura

O projeto segue as melhores práticas do Laravel com:

- **MVC Pattern**: Controllers, Models, Views (API)
- **Service Layer**: Lógica de negócio centralizada (`AccessService`, `PetService`)
- **Form Requests**: Validação de entrada isolada
- **Policies**: Autorização baseada em permissões
- **Events**: Sistema de eventos para ações importantes
- **Repository Pattern**: Eloquent ORM com relacionamentos
- **Middleware**: CORS, JWT, Security Headers
- **PHP 8.2 Enums**: Type-safe para roles e status

## Tecnologias Utilizadas

- **Laravel 12.x** - Framework PHP moderno
- **PostgreSQL** - Banco de dados relacional
  - Local (Docker) para testes na porta 5433
  - Supabase para produção
- **Docker & Docker Compose** - Containerização da aplicação
- **JWT (php-open-source-saver/jwt-auth)** - Autenticação stateless
- **Cloudinary** - Armazenamento e manipulação de imagens
- **Swagger UI** - Documentação interativa da API
- **PHPUnit** - Testes automatizados (54 testes, 240 assertions)

## Módulos Aplicados da Disciplina

**Módulo 04 | Roteamento e Ciclo de Vida de uma Request**  
Utilizaremos o sistema de rotas da API (`routes/api.php`) para organizar os endpoints RESTful da aplicação. As requisições serão processadas por controllers seguindo a convenção de ciclo de vida Laravel (Request → Middleware → Controller → Response).

**Módulo 07 | Forms e Validação de Requisições**  
As validações de entrada serão tratadas via Form Requests customizados com regras específicas para criação de usuários, pets, lembretes e refeições. Respostas de erro serão padronizadas em JSON.

**Módulo 08 | Autenticação de Usuários**  
A autenticação será feita via JWT, permitindo login seguro e persistente por token. Middleware será aplicado para proteger as rotas autenticadas.

**Módulo 09 | Migrações e Relacionamentos**  
Todas as tabelas e relacionamentos representados no diagrama serão implementados via migrations. Relacionamentos do tipo One to Many, Many to Many e One to One serão aplicados conforme a modelagem.

**Módulo 11 | Autorização com Policies e Testes de Feature**  
Policies serão utilizadas para restringir ações como editar/remover apenas aos donos ou cuidadores autorizados de um pet. Serão implementados também testes de feature para validar o comportamento esperado da API.

## Pré-requisitos

- Docker Desktop (Windows/Mac) ou Docker Engine (Linux)
- Docker Compose v2.0+
- Git
- Conta Cloudinary (para upload de imagens)
- Conta Supabase (para banco de produção - opcional)

## Configuração e Execução

### 🚀 Configuração Rápida (Recomendada)

Use o script automatizado para configurar os ambientes:

```bash
# Windows (PowerShell)
.\scripts\db-setup.ps1 test

# Linux/Mac (Bash)
./scripts/db-setup.sh test
```

### 📋 Configuração Manual

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/TCC_UTFPets_API.git
cd TCC_UTFPets_API
```

2. **Configure o ambiente de produção (.env):**
```bash
cp .env.example .env
```

Configure as variáveis para **Supabase** (produção):
```env
# Banco de Produção (Supabase)
DB_CONNECTION=pgsql
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_supabase
DB_SSLMODE=require

# Outras configurações
APP_KEY=
JWT_SECRET=
CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_URL=cloudinary://sua_api_key:seu_api_secret@seu_cloud_name
```

3. **Inicie os containers:**
```bash
docker-compose up -d
```

4. **Execute as migrações:**
```bash
# Para produção (Supabase)
docker-compose exec utfpets-app php artisan migrate --force

# Para testes (automático)
docker-compose exec utfpets-app php artisan test
```

### 🧪 Ambientes de Banco de Dados

O projeto agora suporta **dois ambientes distintos**:

- **🧪 Testes**: PostgreSQL local via Docker (porta 5433)
- **🚀 Produção**: Supabase (PostgreSQL gerenciado)

**📚 Documentação completa**: Veja [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) para detalhes.

## 🛠️ Scripts Utilitários

O projeto inclui scripts para facilitar o gerenciamento:

### `db-setup.ps1` (Windows) / `db-setup.sh` (Linux/Mac)

```bash
# Configurar e testar ambiente de teste
.\scripts\db-setup.ps1 test

# Configurar ambiente de produção (Supabase)
.\scripts\db-setup.ps1 production

# Limpar todos os ambientes
.\scripts\db-setup.ps1 clean

# Verificar status
.\scripts\db-setup.ps1 status

# Ajuda
.\scripts\db-setup.ps1 help
```

## Endpoints Principais

A API oferece os seguintes endpoints principais:

### 🔐 Autenticação
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/me` - Informações do usuário autenticado

### 🐾 Pets
- `GET /api/v1/pets` - Lista todos os pets do usuário
- `POST /api/v1/pets` - Cadastra um novo pet
- `GET /api/v1/pets/{id}` - Obtém detalhes de um pet específico
- `PUT /api/v1/pets/{id}` - Atualiza informações de um pet
- `DELETE /api/v1/pets/{id}` - Remove um pet (soft delete)

### 🍽️ Refeições
- `GET /api/v1/pets/{pet}/meals` - Lista refeições de um pet
- `POST /api/v1/pets/{pet}/meals` - Registra nova refeição
- `GET /api/v1/pets/{pet}/meals/{id}` - Detalhes de uma refeição
- `PUT /api/v1/pets/{pet}/meals/{id}` - Atualiza refeição
- `DELETE /api/v1/pets/{pet}/meals/{id}` - Remove refeição
- `POST /api/v1/pets/{pet}/meals/{id}/consume` - Marca refeição como consumida

### 👥 Compartilhamento de Pets
- `GET /api/v1/pets/{pet}/share` - Lista participantes do pet
- `POST /api/v1/pets/{pet}/share` - Envia convite de compartilhamento
- `POST /api/v1/pets/{pet}/share/{user}/accept` - Aceita convite
- `PATCH /api/v1/pets/{pet}/share/{user}` - Altera papel do participante
- `DELETE /api/v1/pets/{pet}/share/{user}` - Revoga acesso

### ⏰ Lembretes
- `GET /api/v1/pets/{pet}/reminders` - Lista lembretes (com filtros)
- `POST /api/v1/pets/{pet}/reminders` - Cria lembrete
- `GET /api/v1/reminders/{id}` - Visualiza lembrete
- `PATCH /api/v1/reminders/{id}` - Atualiza lembrete
- `DELETE /api/v1/reminders/{id}` - Deleta lembrete
- `POST /api/v1/reminders/{id}/snooze` - Adia lembrete
- `POST /api/v1/reminders/{id}/complete` - Marca como concluído

### 📱 Notificações ⭐ NOVO
- `GET /api/v1/notifications` - Lista notificações (com filtros e paginação)
- `GET /api/v1/notifications/unread-count` - Conta notificações não lidas
- `PATCH /api/v1/notifications/{id}/read` - Marca notificação como lida
- `POST /api/v1/notifications/mark-all-read` - Marca todas como lidas

## 🔐 Sistema de Permissões

### Papéis de Acesso

| Ação | Owner | Editor | Viewer |
|------|-------|--------|--------|
| Visualizar pet | ✅ | ✅ | ✅ |
| Editar pet | ✅ | ❌ | ❌ |
| Deletar pet | ✅ | ❌ | ❌ |
| Criar refeição | ✅ | ✅ | ❌ |
| Editar refeição | ✅ | ✅ | ❌ |
| Deletar refeição | ✅ | ✅ | ❌ |
| Marcar como consumido | ✅ | ✅ | ❌ |
| Gerenciar compartilhamento | ✅ | ❌ | ❌ |
| Alterar papéis | ✅ | ❌ | ❌ |

### Regras de Negócio

- ✅ Apenas **1 owner** por pet (o criador original)
- ✅ Owner pode convidar outros usuários como **editor** ou **viewer**
- ✅ Convites ficam **pendentes** até serem aceitos
- ✅ Apenas o **usuário convidado** pode aceitar o convite
- ✅ Owner pode **alterar papéis** e **revogar acessos** a qualquer momento

## Containers e Portas

- **API (Laravel)**: http://localhost:8080
- **PostgreSQL (Teste)**: localhost:5433 (container: `utfpets-test-db`)
- **Swagger UI**: http://localhost:8081/swagger (container: `utfpets-swagger-ui`)
- **Nginx**: http://localhost:8080 (container: `utfpets-nginx`)

## Testes

### 🧪 Executar Todos os Testes

Use o script automatizado (recomendado):
```bash
# Windows (PowerShell)
.\scripts\db-setup.ps1 test

# Linux/Mac (Bash)
./scripts/db-setup.sh test
```

Ou execute manualmente:
```bash
docker-compose exec app php artisan test
```

### 📊 Cobertura de Testes

- ✅ **AuthTest**: 5 testes (registro, login, logout, perfil)
- ✅ **PetTest**: 6 testes (CRUD completo de pets)
- ✅ **MealTest**: 6 testes (CRUD completo de refeições)
- ✅ **ReminderTest**: 14 testes (lembretes, agendamento, recorrência)
- ✅ **SharedPetTest**: 14 testes (compartilhamento e permissões)
- ✅ **NotificationTest**: 9 testes (sistema de notificações) ⭐ NOVO

**Total: 54 testes | 240 assertions | 100% passando** ✅

## Troubleshooting

Se encontrar problemas:

1. Verifique se todos os containers estão rodando:
```bash
docker-compose ps
```

2. Se o container da aplicação estiver parado:
```bash
docker-compose up -d utfpets-app
```

3. Se houver problemas com dependências:
```bash
docker-compose exec app composer install
```

4. Se houver problemas com cache ou banco de dados:
```bash
# Limpar todos os caches
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear

# Executar migrações (teste)
docker-compose exec app php artisan migrate --env=testing --force

# Executar migrações (produção)
docker-compose exec app php artisan migrate --force
```

5. Para visualizar logs:
```bash
# Logs da aplicação
docker-compose logs app

# Logs do banco de teste
docker-compose logs test-db

# Logs do Swagger UI
docker-compose logs swagger-ui

# Todos os logs
docker-compose logs
```

6. Para reiniciar containers:
```bash
# Reiniciar tudo
docker-compose restart

# Reiniciar apenas a aplicação
docker-compose restart app

# Rebuild completo
docker-compose down
docker-compose up --build -d
```

## 📚 Documentação da API

### Swagger UI (Interativo)
Acesse a documentação interativa em: **http://localhost:8081/swagger**

A documentação inclui:
- ✅ Todos os endpoints com exemplos prontos para testar
- ✅ Schemas completos (Pet, Meal, SharedPet)
- ✅ Valores de teste pré-preenchidos
- ✅ Sistema de autenticação integrado (clique em "Authorize")
- ✅ Descrição de permissões por papel (owner/editor/viewer)

### Arquivo OpenAPI
O arquivo JSON da documentação está disponível em:
- **URL**: http://localhost:8080/api-docs.json
- **Arquivo**: `public/api-docs.json`

### 🎯 Como Testar no Swagger UI

1. Acesse http://localhost:8081/swagger
2. Registre um usuário em `/auth/register`:
   ```json
   {
     "name": "João Silva",
     "email": "joao@example.com",
     "password": "Senha@123",
     "password_confirmation": "Senha@123"
   }
   ```
3. Copie o `token` retornado
4. Clique em **"Authorize"** 🔒 no topo
5. Cole o token (não precisa adicionar "Bearer")
6. Teste todos os endpoints!

### 📖 Módulos Implementados

- **[📚 Índice de Documentação](docs/INDEX.md)** - Navegue por toda a documentação
- **Módulo 1**: [Compartilhamento de Pets](docs/MODULO_1_COMPARTILHAMENTO.md) - Sistema de colaboração com papéis
- **Módulo 2**: [Lembretes com Agendamento](docs/MODULO_2_LEMBRETES.md) - Lembretes recorrentes com timezone
- **Módulo 3**: [Sistema de Notificações](docs/MODULO_3_NOTIFICACOES.md) - Histórico e controle de leitura ⭐ NOVO

## 📁 Estrutura do Projeto

```
TCC_UTFPets_API/
├── app/
│   ├── Enums/              # PHP 8.2 Enums (7 enums)
│   ├── Events/             # Eventos do sistema (4 eventos)
│   ├── Http/
│   │   ├── Controllers/    # Controllers da API (6 controllers)
│   │   ├── Middleware/     # CORS, Security Headers
│   │   └── Requests/       # Form Requests para validação (8 requests)
│   ├── Jobs/               # Background Jobs (2 jobs)
│   ├── Models/             # Eloquent Models (6 models)
│   ├── Policies/           # Authorization Policies (2 policies)
│   └── Services/           # Service Layer (3 services)
├── database/
│   ├── migrations/         # Migrations do banco (9 migrations)
│   ├── factories/          # Factories para testes (6 factories)
│   └── seeders/            # Seeders
├── docs/                   # 📚 Documentação dos módulos
│   ├── INDEX.md            # Índice de toda documentação
│   ├── DATABASE_SETUP.md   # Setup de banco de dados
│   ├── MODULO_1_COMPARTILHAMENTO.md
│   ├── MODULO_2_LEMBRETES.md
│   └── MODULO_3_NOTIFICACOES.md
├── routes/
│   ├── api.php             # Definição de rotas da API (29 rotas)
│   └── console.php         # Scheduler e comandos Artisan
├── tests/
│   └── Feature/            # Testes de feature (54 testes)
├── public/
│   └── api-docs.json       # Documentação OpenAPI completa
├── scripts/
│   ├── db-setup.ps1        # Script Windows para setup
│   └── db-setup.sh         # Script Linux/Mac para setup
├── docker-compose.yml      # Orquestração de containers (4 serviços)
├── Dockerfile              # Imagem da aplicação
└── README.md               # Este arquivo
```

## 🎯 Recursos Principais

### 1. Autenticação JWT
- Registro com validação robusta de senha
- Login com rate limiting (6 tentativas/minuto)
- Logout que invalida o token
- Middleware de autenticação em rotas protegidas

### 2. Gerenciamento de Pets
- CRUD completo com soft delete
- Upload de fotos via Cloudinary
- Validação de espécies (Enums)
- Policies para autorização

### 3. Controle de Refeições
- Registro de refeições agendadas
- Marcação de consumo
- Histórico completo por pet
- Permissões baseadas em papéis

### 4. Compartilhamento Colaborativo
- Sistema de convites (pending → accepted)
- 3 papéis: owner, editor, viewer
- Gerenciamento de permissões granular
- Eventos para notificações futuras

### 5. Lembretes Inteligentes
- Lembretes únicos e recorrentes (diário, semanal)
- Agendamento com timezone do usuário
- Processamento em background com Jobs
- Snooze (adiar) e Complete (concluir)
- Filtros por status e intervalo de datas
- Tolerância de 5 minutos para evitar perda

### 6. Sistema de Notificações ⭐ NOVO
- Histórico completo de notificações do usuário
- Controle de leitura (individual e em lote)
- Integração automática com lembretes e compartilhamento
- Paginação e filtros por status
- Contador de notificações não lidas
- Dados estruturados para contexto (JSON)

## Demonstração em Vídeo

Disponível em: [Link do YouTube / Google Drive]

## 🔥 Destaques Técnicos

- ✅ **100% de cobertura de testes** nos casos de uso principais
- ✅ **Type Safety** com PHP 8.2 Enums
- ✅ **Service Layer** para separação de responsabilidades
- ✅ **Event-Driven** pronto para notificações
- ✅ **RESTful** seguindo melhores práticas
- ✅ **Soft Deletes** para integridade de dados
- ✅ **UUID** para compartilhamentos
- ✅ **Policies integradas** com Laravel Gates
- ✅ **CORS configurado** para integração frontend
- ✅ **Documentação completa** com Swagger UI
- ✅ **Scripts automatizados** para setup e testes
- ✅ **Docker multi-estágio** para otimização
- ✅ **Ambientes separados** (teste local + produção Supabase)

## 📋 Roadmap

- [ ] Canais adicionais (email/push)
- [ ] Histórico de auditoria
- [ ] Exportação de relatórios
- [ ] Dashboard de estatísticas
- [ ] Integração com calendário

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a [documentação do Swagger](http://localhost:8081/swagger)
2. Consulte o [guia de troubleshooting](#troubleshooting) acima
3. Navegue pelo [índice de documentação](docs/INDEX.md)
4. Veja documentação dos módulos:
   - [Módulo 1 - Compartilhamento](docs/MODULO_1_COMPARTILHAMENTO.md)
   - [Módulo 2 - Lembretes](docs/MODULO_2_LEMBRETES.md)
   - [Setup de Banco de Dados](docs/DATABASE_SETUP.md)

## Autor e Disciplina

**Aluno:** Rafael Sedor Oliveira Deda  
**Disciplina:** Desenvolvimento de Aplicações Backend com Framework  
**Instituição:** UTFPR

---

**⭐ Se este projeto foi útil, considere dar uma estrela no repositório!**
