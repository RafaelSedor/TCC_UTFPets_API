# Setup para Desenvolvimento Local

Este guia explica como executar o UTFPets API localmente em `http://localhost`.

## Opção 1: Usar docker-compose.local.yml (Recomendado)

### 1. Parar containers atuais (se estiverem rodando)
```bash
docker-compose down
```

### 2. Iniciar com configuração local
```bash
docker-compose -f docker-compose.local.yml up -d
```

### 3. Verificar se está funcionando
```bash
# Verificar containers
docker-compose -f docker-compose.local.yml ps

# Testar API
curl http://localhost/api/health
```

### 4. Acessar a aplicação
- **API**: http://localhost/api
- **Health Check**: http://localhost/api/health
- **Swagger UI**: http://localhost/swagger
- **Documentação JSON**: http://localhost/api-docs.json

### 5. Para parar
```bash
docker-compose -f docker-compose.local.yml down
```

---

## Opção 2: Modificar docker-compose.yml original

Se preferir modificar o arquivo principal:

### 1. Editar docker-compose.yml

Altere a linha 76 de:
```yaml
- ./nginx/api.utfpets.online.conf:/etc/nginx/conf.d/default.conf:ro
```

Para:
```yaml
- ./nginx/localhost.conf:/etc/nginx/conf.d/default.conf:ro
```

### 2. Reiniciar containers
```bash
docker-compose down
docker-compose up -d
```

---

## Executar Comandos no Container

```bash
# Migrations
docker-compose -f docker-compose.local.yml exec app php artisan migrate

# Testes
docker-compose -f docker-compose.local.yml exec app php artisan test

# Limpar cache
docker-compose -f docker-compose.local.yml exec app php artisan cache:clear

# Acessar shell
docker-compose -f docker-compose.local.yml exec app bash
```

---

## Trocar entre Local e Produção

### Para desenvolvimento local:
```bash
docker-compose -f docker-compose.local.yml up -d
```

### Para produção (api.utfpets.online):
```bash
docker-compose up -d
```

---

## Endpoints Principais (localhost)

### Autenticação
- `POST http://localhost/api/auth/register` - Registro
- `POST http://localhost/api/auth/login` - Login
- `GET http://localhost/api/auth/me` - Perfil

### Pets
- `GET http://localhost/api/v1/pets` - Listar pets
- `POST http://localhost/api/v1/pets` - Criar pet

### Refeições
- `GET http://localhost/api/v1/pets/{pet}/meals` - Listar refeições
- `POST http://localhost/api/v1/pets/{pet}/meals` - Criar refeição

### Compartilhamento
- `POST http://localhost/api/v1/pets/{pet}/share` - Compartilhar pet
- `POST http://localhost/api/v1/pets/{pet}/share/{user}/accept` - Aceitar convite

### Lembretes
- `GET http://localhost/api/v1/pets/{pet}/reminders` - Listar lembretes
- `POST http://localhost/api/v1/pets/{pet}/reminders` - Criar lembrete

---

## Testar no Swagger UI

1. Acesse: http://localhost/swagger
2. Teste o endpoint `/api/auth/register`:
   ```json
   {
     "name": "Teste Local",
     "email": "teste@localhost.com",
     "password": "Senha@123",
     "password_confirmation": "Senha@123"
   }
   ```
3. Copie o token retornado
4. Clique em "Authorize" no topo
5. Cole o token (sem "Bearer")
6. Teste os outros endpoints!

---

## Troubleshooting

### Porta 80 já está em uso
Se a porta 80 estiver ocupada, você pode mudar no `docker-compose.local.yml`:

```yaml
ports:
  - "8080:80"  # Mude de "80:80" para "8080:80"
```

Depois acesse: http://localhost:8080

### Erro de conexão com banco de dados
Certifique-se de que:
1. O arquivo `.env` está configurado corretamente
2. As credenciais do banco estão corretas
3. O serviço `cloud-sql-proxy` está rodando

### Verificar logs
```bash
# Logs do Nginx
docker-compose -f docker-compose.local.yml logs nginx

# Logs da aplicação
docker-compose -f docker-compose.local.yml logs app

# Logs do banco
docker-compose -f docker-compose.local.yml logs cloud-sql-proxy

# Todos os logs
docker-compose -f docker-compose.local.yml logs -f
```

---

## Diferenças entre Local e Produção

| Aspecto | Local | Produção |
|---------|-------|----------|
| URL | http://localhost | https://api.utfpets.online |
| Porta | 80 | 80 e 443 (HTTPS) |
| SSL | Não | Sim (Let's Encrypt) |
| Nginx Config | localhost.conf | api.utfpets.online.conf |
| Docker Compose | docker-compose.local.yml | docker-compose.yml |
| APP_URL | http://localhost | https://api.utfpets.online |

---

## Próximos Passos

Depois de configurar o ambiente local:

1. ✅ Execute as migrations: `docker-compose -f docker-compose.local.yml exec app php artisan migrate`
2. ✅ Teste a API: `curl http://localhost/api/health`
3. ✅ Acesse o Swagger: http://localhost/swagger
4. ✅ Registre um usuário e comece a testar!

---

**Pronto! Seu ambiente local está configurado e funcionando!** 🚀
