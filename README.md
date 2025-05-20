# UTFPets API

## Sobre o Projeto

A UTFPets API é uma aplicação backend desenvolvida em Laravel 12.x que oferece uma solução completa para o gerenciamento de pets e suas refeições. Esta API foi desenvolvida como parte do Trabalho de Conclusão de Curso (TCC) e tem como objetivo auxiliar tutores de pets a manterem um controle adequado da alimentação de seus animais de estimação.

### Principais Funcionalidades

- 🔐 **Autenticação de Usuários**: Sistema completo de registro e autenticação usando JWT
- 🐾 **Gerenciamento de Pets**: Cadastro, atualização, listagem e remoção de pets
- 🍽️ **Controle de Refeições**: Registro e acompanhamento das refeições de cada pet
- 📸 **Upload de Imagens**: Integração com Cloudinary para armazenamento de fotos dos pets
- 📊 **Histórico Alimentar**: Acompanhamento do histórico de alimentação de cada pet

### Público-Alvo

- Tutores de pets que desejam um controle mais rigoroso da alimentação de seus animais
- Clínicas veterinárias que precisam acompanhar a dieta de seus pacientes
- Desenvolvedores que desejam integrar funcionalidades de gerenciamento de pets em suas aplicações

## Tecnologias Utilizadas

- Laravel 12.x
- PostgreSQL
- Docker & Docker Compose
- JWT para autenticação
- Cloudinary para armazenamento de imagens
- Swagger para documentação da API

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

- Docker
- Docker Compose
- Git

## Configuração e Execução

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/TCC_UTFPets_API.git
cd TCC_UTFPets_API
```

2. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

3. Configure as variáveis de ambiente no arquivo `.env`:
```env
DB_CONNECTION=
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
APP_KEY=
SESSION_DRIVER=file
JWT_SECRET= 
APP_ENV=production
APP_DEBUG=true
CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_URL=cloudinary://sua_api_key:seu_api_secret@seu_cloud_name
JWT_ALGO=
```

4. Inicie os containers:
```bash
docker-compose up -d
```

5. Aguarde todos os containers iniciarem e execute os seguintes comandos:
```bash
# Instalar dependências
docker-compose exec utfpets-app composer install

# Gerar chave da aplicação
docker-compose exec utfpets-app php artisan key:generate

# Gerar chave JWT
docker-compose exec utfpets-app php artisan jwt:secret

# Executar migrações
docker-compose exec utfpets-app php artisan migrate

# Gerar documentação Swagger
docker-compose exec utfpets-app php artisan l5-swagger:generate
```

## Endpoints Principais

A API oferece os seguintes endpoints principais:

### Autenticação
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/me` - Informações do usuário autenticado

### Pets
- `GET /api/pets` - Lista todos os pets do usuário
- `POST /api/pets` - Cadastra um novo pet
- `GET /api/pets/{id}` - Obtém detalhes de um pet específico
- `POST /api/pets/{id}` - Atualiza informações de um pet
- `DELETE /api/pets/{id}` - Remove um pet

### Refeições
- `GET /api/pets/{pet}/meals` - Lista refeições de um pet
- `POST /api/pets/{pet}/meals` - Registra nova refeição
- `POST /api/pets/{pet}/meals/{meal}/consume` - Registra consumo de refeição

## Containers e Portas

- **API (Laravel)**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Selenium**: localhost:4444
- **Swagger UI**: http://localhost:8080/api/documentation

## Testes

Para executar os testes:
```bash
docker exec utfpets-app php artisan test
```

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
docker-compose exec utfpets-app composer update
```

4. Se houver problemas com cache ou banco de dados:
```bash
# Limpar todos os caches
docker-compose exec utfpets-app php artisan optimize:clear

# Executar migrações
docker-compose exec utfpets-app php artisan migrate

# Reotimizar a aplicação
docker-compose exec utfpets-app php artisan optimize
```

5. Para visualizar logs:
```bash
docker-compose logs utfpets-app
```

## Documentação

A documentação completa da API está disponível via Swagger UI em:
http://localhost:8080/api/documentation

## Demonstração em Vídeo

Disponível em: [Link do YouTube / Google Drive]

## Autor e Disciplina

**Aluno:** Rafael Sedor Oliveira Deda  
**Disciplina:** Desenvolvimento de Aplicações Backend com Framework

