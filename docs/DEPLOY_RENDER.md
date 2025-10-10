# 🚀 Deploy no Render - UTFPets API

Este guia fornece instruções completas para fazer deploy da API UTFPets no [Render](https://render.com).

## 📋 Pré-requisitos

1. **Conta no Render** - [Criar conta gratuita](https://dashboard.render.com/register)
2. **Repositório Git** - GitHub, GitLab ou Bitbucket
3. **Conta Cloudinary** - Para upload de imagens ([criar conta](https://cloudinary.com))
4. **Firebase Project** - Para push notifications (opcional)

## 🎯 Visão Geral

O deploy no Render incluirá:

- ✅ **Web Service** - API Laravel (Free tier disponível)
- ✅ **PostgreSQL Database** - Banco de dados gerenciado (Free tier disponível)
- ✅ **Variáveis de Ambiente** - Configuração automática
- ✅ **SSL/HTTPS** - Certificado gratuito automático
- ✅ **Auto-deploy** - Deploy automático a cada push no repositório

## 📦 Arquivos Necessários

Os seguintes arquivos já foram criados para você:

```
TCC_UTFPets_API/
├── render.yaml                    # Configuração Blueprint do Render
├── Dockerfile.render              # Dockerfile otimizado para produção
├── scripts/
│   └── render-start.sh           # Script de inicialização
├── nginx/
│   ├── render.conf               # Configuração Nginx para Render
│   └── supervisord.conf          # Configuração do Supervisor
└── docs/
    └── DEPLOY_RENDER.md          # Este arquivo
```

## 🚀 Método 1: Deploy Automático via Blueprint (Recomendado)

O método mais simples é usar o arquivo `render.yaml` que já foi configurado.

### Passo 1: Preparar o Repositório

```bash
# Adicionar os novos arquivos ao Git
git add render.yaml Dockerfile.render scripts/render-start.sh nginx/render.conf nginx/supervisord.conf docs/DEPLOY_RENDER.md

# Commit
git commit -m "feat: adicionar configuração para deploy no Render"

# Push para o repositório
git push origin master
```

### Passo 2: Conectar ao Render

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório (GitHub/GitLab/Bitbucket)
4. Selecione o repositório `TCC_UTFPets_API`
5. O Render detectará automaticamente o arquivo `render.yaml`
6. Clique em **"Apply"**

### Passo 3: Configurar Variáveis de Ambiente

Após a criação dos serviços, você precisará configurar algumas variáveis manualmente:

#### 3.1. Acessar Web Service

1. Vá para **Dashboard** → **utfpets-api**
2. Clique em **"Environment"**

#### 3.2. Configurar Cloudinary

Adicione as seguintes variáveis:

```bash
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

**Como obter as credenciais:**
1. Acesse [Cloudinary Dashboard](https://console.cloudinary.com)
2. Copie as credenciais da seção **"Product Environment Credentials"**

#### 3.3. Configurar Firebase (Opcional)

Se você usa push notifications:

```bash
FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...",...}'
```

**Como obter:**
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá para **Project Settings** → **Service Accounts**
3. Clique em **"Generate New Private Key"**
4. Copie o conteúdo do arquivo JSON gerado

#### 3.4. Outras Configurações

```bash
# URL da sua aplicação (será fornecida pelo Render)
APP_URL=https://utfpets-api.onrender.com

# Se quiser executar seeders no primeiro deploy
RUN_SEEDERS=true  # Remover após primeiro deploy
```

### Passo 4: Aguardar o Deploy

- O Render iniciará o build automaticamente
- Acompanhe o processo na aba **"Logs"**
- O primeiro deploy pode levar 5-10 minutos
- Quando terminar, você verá: ✅ **Live**

### Passo 5: Testar a API

```bash
# Verificar se a API está online
curl https://utfpets-api.onrender.com/api/health

# Testar registro de usuário
curl -X POST https://utfpets-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "password": "Senha@123",
    "password_confirmation": "Senha@123"
  }'
```

---

## 🛠️ Método 2: Deploy Manual

Se preferir configurar manualmente:

### Passo 1: Criar PostgreSQL Database

1. No Dashboard do Render, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `utfpets-db`
   - **Database**: `utfpets_production`
   - **User**: (gerado automaticamente)
   - **Region**: escolha a mais próxima
   - **Plan**: Free
3. Clique em **"Create Database"**
4. **Importante**: Anote as credenciais (Internal Database URL)

### Passo 2: Criar Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório Git
3. Configure:
   - **Name**: `utfpets-api`
   - **Region**: mesma do banco de dados
   - **Branch**: `master`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile.render`
   - **Plan**: Free

### Passo 3: Configurar Variáveis de Ambiente

Adicione todas as variáveis listadas no Método 1, incluindo as credenciais do banco:

```bash
DB_CONNECTION=pgsql
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_DATABASE=utfpets_production
DB_USERNAME=utfpets_user
DB_PASSWORD=sua_senha_gerada
DB_SSLMODE=require
```

### Passo 4: Deploy

Clique em **"Create Web Service"** e aguarde o build.

---

## 🔧 Configurações Adicionais

### Health Check Endpoint

Adicione um endpoint de health check ao seu projeto:

```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
    ]);
});
```

### Scheduler (Tarefas Agendadas)

Se você usa o Laravel Scheduler, adicione um **Cron Job** no Render:

1. No Dashboard, clique em **"New +"** → **"Cron Job"**
2. Configure:
   - **Name**: `utfpets-scheduler`
   - **Command**: `php /var/www/artisan schedule:run`
   - **Schedule**: `* * * * *` (a cada minuto)

### Queue Worker

O queue worker já está configurado no `supervisord.conf`. Para monitorar:

```bash
# Ver logs do worker
# No Render Shell (Dashboard → Shell)
tail -f /var/www/storage/logs/worker.log
```

### Custom Domain

Para usar seu próprio domínio:

1. Vá para **Settings** → **Custom Domain**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções do Render

---

## 📊 Monitoramento

### Logs

Acesse os logs em tempo real:

1. Dashboard → **utfpets-api** → **Logs**

### Métricas

O Render fornece métricas gratuitas:
- CPU Usage
- Memory Usage
- Bandwidth
- HTTP Response Times

### Alertas

Configure alertas para notificações:

1. Settings → **Notifications**
2. Adicione email ou Slack webhook

---

## 🐛 Troubleshooting

### Erro: "APP_KEY not set"

**Solução:**

```bash
# Gerar APP_KEY manualmente
php artisan key:generate --show

# Adicionar nas variáveis de ambiente do Render
APP_KEY=base64:sua_chave_gerada
```

### Erro: "SQLSTATE[08006] connection failed"

**Problema:** Banco de dados não conectado

**Solução:**
1. Verifique se as credenciais do banco estão corretas
2. Confirme que `DB_SSLMODE=require` está definido
3. Teste a conexão no Shell do Render:

```bash
php artisan tinker
DB::connection()->getPdo();
```

### Erro: "Permission denied" no storage

**Solução:**

```bash
# No Shell do Render
chmod -R 775 /var/www/storage
chown -R www-data:www-data /var/www/storage
```

### Deploy Lento ou Timeout

**Soluções:**
1. O plano Free do Render hiberna após 15 min de inatividade
2. Considere usar o plano Starter ($7/mês) para melhor performance
3. Otimize o Dockerfile para builds mais rápidos

### Erro de Memória

**Solução:**

O plano Free tem 512MB de RAM. Otimize:

```bash
# Reduzir workers do queue
# Em nginx/supervisord.conf
numprocs=1  # ao invés de 2
```

---

## 💰 Custos Estimados

### Plano Free

- **Web Service**: Free (com limitações)
  - ✅ 512 MB RAM
  - ✅ 0.1 CPU
  - ✅ SSL gratuito
  - ⚠️ Hiberna após 15min inatividade
  - ⚠️ 750 horas/mês

- **PostgreSQL**: Free
  - ✅ 256 MB storage
  - ✅ Backups automáticos (30 dias)
  - ✅ 97% uptime

**Total: $0/mês** ✨

### Planos Pagos (Recomendados para Produção)

- **Web Service Starter**: $7/mês
  - 512 MB RAM (sem hibernação)
  - 0.5 CPU
  - SSL gratuito

- **PostgreSQL Starter**: $7/mês
  - 1 GB storage
  - 99.9% uptime

**Total: $14/mês** para produção estável

---

## 🚀 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ **Testar todos os endpoints** usando Postman ou Swagger
2. ✅ **Configurar domínio customizado** (opcional)
3. ✅ **Configurar CI/CD** com GitHub Actions (opcional)
4. ✅ **Monitorar logs e métricas** regularmente
5. ✅ **Fazer backup do banco** periodicamente
6. ✅ **Documentar URL da API** para o frontend

---

## 📚 Recursos Úteis

- [Documentação do Render](https://render.com/docs)
- [Deploy Laravel no Render](https://render.com/docs/deploy-php-laravel-docker)
- [Render Community Forum](https://community.render.com)
- [Status do Render](https://status.render.com)

---

## 🆘 Suporte

Se você encontrar problemas:

1. Verifique a seção [Troubleshooting](#-troubleshooting)
2. Consulte os [logs no Dashboard](#logs)
3. Abra uma issue no repositório
4. Entre em contato com o suporte do Render

---

## ✅ Checklist de Deploy

Use esta lista para garantir que tudo está configurado:

- [ ] Repositório Git conectado ao Render
- [ ] Arquivo `render.yaml` commitado
- [ ] PostgreSQL database criado
- [ ] Web Service criado e rodando
- [ ] Variáveis de ambiente configuradas:
  - [ ] APP_KEY
  - [ ] JWT_SECRET
  - [ ] Credenciais do banco de dados
  - [ ] Cloudinary credentials
  - [ ] Firebase credentials (se aplicável)
  - [ ] APP_URL
- [ ] Health check endpoint respondendo
- [ ] Migrações executadas com sucesso
- [ ] Seeders executados (se necessário)
- [ ] API respondendo corretamente
- [ ] Testes de endpoints críticos realizados
- [ ] Logs monitorados e sem erros críticos
- [ ] Documentação atualizada com URL de produção

---

**🎉 Parabéns! Sua API UTFPets está no ar!** 🐾

Acesse: `https://utfpets-api.onrender.com`

Documentação: `https://utfpets-api.onrender.com/api/documentation`

