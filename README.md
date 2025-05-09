# UTFPets API - Projeto Final da Disciplina "Desenvolvimento de Aplicações Backend com Framework"

Este repositório contém o backend da aplicação UTFPets, desenvolvido com o framework Laravel, utilizando PostgreSQL, JWT para autenticação, integração com Cloudinary e testes automatizados com Laravel Dusk (Selenium). A aplicação tem como objetivo auxiliar no gerenciamento de refeições e cuidados com pets, sendo posteriormente consumida por um frontend Angular (PWA).

## Visão Geral

UTFPets é uma plataforma voltada ao gerenciamento de alimentação de pets. A aplicação permite que múltiplos cuidadores compartilhem responsabilidades, mantendo histórico alimentar, lembretes, e controle de notificações.

### Funcionalidades principais:

- Cadastro e autenticação de usuários via JWT
- Registro de pets com informações detalhadas (foto, espécie, peso etc.)
- Compartilhamento de pets com diferentes perfis de acesso
- Registro de alimentações com anotações
- Agendamento de lembretes para medicamentos e refeições
- Sistema de notificações

## Público-Alvo

Tutores de animais de estimação que desejam compartilhar o cuidado com outras pessoas (família, pet sitter, funcionários, etc), mantendo organização e histórico centralizado.

## Tecnologias utilizadas

- Laravel 11 (Backend RESTful)
- PostgreSQL (SGDB relacional)
- JWT Auth com tymon/jwt-auth
- Cloudinary para upload de imagens de pets
- Laravel Dusk (Selenium) para testes automatizados
- Docker e Docker Compose para ambiente isolado

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

## Estrutura do Banco de Dados

O banco foi modelado com as seguintes entidades:

- `users`: dados de autenticação e informações pessoais
- `pets`: relação com um ou mais users, foto no Cloudinary
- `shared_pets`: compartilhamento de acesso entre usuários e pets com controle de papel ("owner", "viewer")
- `feedings`: histórico de alimentação
- `reminders`: lembretes com intervalo e status
- `notifications`: mensagens ao usuário

## Instalação

1. Clonar repositório

```bash
git clone https://github.com/SeuUsuario/TCC_UTFPets_API.git
cd TCC_UTFPets_API
```

2. Copiar e configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com:

- Credenciais do banco PostgreSQL
- Chaves do Cloudinary
- Chave JWT (`php artisan jwt:secret`)

3. Subir ambiente com Docker

```bash
docker-compose up -d --build
```

4. Migrar e popular o banco

```bash
docker exec -it utfpets-app php artisan migrate --seed
```

## Execução de Testes

```bash
docker exec -it utfpets-app php artisan dusk
```

## Demonstração em Vídeo

Disponível em: [Link do YouTube / Google Drive]

## Autor e Disciplina

**Aluno:** Rafael Sedor Oliveira Deda  
**Disciplina:** Desenvolvimento de Aplicações Backend com Framework

## Licença

Este projeto é de uso acadêmico e educacional. Uso comercial não autorizado sem permissão expressa.
