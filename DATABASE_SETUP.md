# 🗄️ Configuração de Banco de Dados - UTFPets API

## 📋 Visão Geral

O projeto agora está configurado para usar **dois ambientes de banco de dados distintos**:

- **🧪 Testes**: PostgreSQL local via Docker (porta 5433)
- **🚀 Produção**: Supabase (PostgreSQL gerenciado)

---

## 🧪 Ambiente de Testes (Docker Local)

### Configuração Automática
O ambiente de testes é configurado automaticamente via Docker Compose:

```yaml
# docker-compose.yml
test-db:
  image: postgres:15-alpine
  container_name: utfpets-test-db
  ports:
    - "127.0.0.1:5433:5432"  # Porta 5433 para não conflitar
  environment:
    POSTGRES_DB: utfpets_test
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_password
```

### Variáveis de Ambiente para Testes
```env
# .env.testing (criado automaticamente)
DB_CONNECTION=pgsql_testing
DB_TEST_HOST=test-db
DB_TEST_PORT=5432
DB_TEST_DATABASE=utfpets_test
DB_TEST_USERNAME=test_user
DB_TEST_PASSWORD=test_password
```

### Executar Testes
```bash
# Iniciar ambiente de teste
docker-compose up -d

# Executar testes
docker-compose exec utfpets-app php artisan test

# Ou executar testes específicos
docker-compose exec utfpets-app php artisan test --filter=PetTest
```

---

## 🚀 Ambiente de Produção (Supabase)

### Configuração Manual Necessária

1. **Configure as variáveis no `.env` principal**:
```env
# .env (produção)
DB_CONNECTION=pgsql
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_supabase
DB_SSLMODE=require
```

2. **Execute as migrações no Supabase**:
```bash
# Conectar ao ambiente de produção
docker-compose exec utfpets-app php artisan migrate --force
```

### Configuração SSL para Supabase
O Supabase requer SSL, então certifique-se de que:
- `DB_SSLMODE=require` está configurado
- As credenciais do Supabase estão corretas
- A conexão está funcionando antes de executar migrações

---

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
# Iniciar ambiente completo
docker-compose up -d

# Ver logs
docker-compose logs -f utfpets-app

# Acessar container
docker-compose exec utfpets-app bash

# Executar comandos Laravel
docker-compose exec utfpets-app php artisan migrate
docker-compose exec utfpets-app php artisan test
```

### Produção
```bash
# Executar migrações no Supabase
php artisan migrate --force

# Verificar conexão
php artisan tinker
>>> DB::connection()->getPdo();
```

---

## 🗂️ Estrutura de Arquivos

```
├── docker-compose.yml          # Configuração Docker (apenas testes)
├── config/database.php         # Configurações de conexão
├── phpunit.xml                # Configuração de testes
├── entrypoint.sh              # Script de inicialização
└── .env                       # Variáveis de produção (Supabase)
```

---

## ⚠️ Importante

### Separação de Ambientes
- **Testes**: Sempre usam banco local Docker
- **Produção**: Sempre usa Supabase
- **Desenvolvimento**: Pode usar qualquer um

### Segurança
- Nunca execute testes em banco de produção
- Sempre use variáveis de ambiente para credenciais
- Mantenha `.env` fora do controle de versão

### Migrações
- **Testes**: Executadas automaticamente no entrypoint
- **Produção**: Devem ser executadas manualmente no Supabase

---

## 🐛 Troubleshooting

### Problema: Testes não conectam ao banco
```bash
# Verificar se o container está rodando
docker-compose ps

# Verificar logs do banco de teste
docker-compose logs test-db

# Recriar containers
docker-compose down -v
docker-compose up -d
```

### Problema: Produção não conecta ao Supabase
```bash
# Verificar variáveis de ambiente
docker-compose exec utfpets-app php artisan tinker
>>> config('database.connections.pgsql')

# Testar conexão
>>> DB::connection()->getPdo();
```

### Problema: Porta 5432 já em uso
```bash
# O banco de teste usa porta 5433
# Verificar se não há conflito
netstat -an | grep 5433
```

---

## 📚 Documentação Adicional

- [Supabase Documentation](https://supabase.com/docs)
- [Laravel Database Configuration](https://laravel.com/docs/database)
- [Docker Compose](https://docs.docker.com/compose/)
- [PHPUnit Testing](https://phpunit.de/documentation.html)
