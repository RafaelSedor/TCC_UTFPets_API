# 🚀 Deploy UTFPets - Guia Rápido

## Arquitetura Atual

- **Cloud Provider:** Google Cloud Platform (GCP)
- **VM:** e2-small, Debian 12, southamerica-east1-b
- **Database:** Cloud SQL PostgreSQL
- **Deploy:** GitHub Actions + Docker Compose
- **IP:** 34.39.150.157

## Estrutura de Arquivos

```
TCC_UTFPets_API/
├── backend/.env              # Variáveis do Laravel (produção)
├── .env.production           # Variáveis do Docker Compose (GCP)
├── .env.local.example        # Template para desenvolvimento local
├── scripts/
│   └── sync-secrets.ps1      # Script para sincronizar secrets com GitHub
└── .github/workflows/
    └── deploy-vm.yml         # Pipeline de deploy automático
```

## Setup Inicial (uma vez)

### 1. Configurar GitHub CLI

```powershell
# Instalar
winget install GitHub.cli

# Autenticar
gh auth login
```

### 2. Sincronizar Secrets

```powershell
# Sincronizar todas as variáveis do backend/.env para GitHub Secrets
.\scripts\sync-secrets.ps1 -Repository "RafaelSedor/TCC_UTFPets_API"
```

O script sincroniza automaticamente:
- ✅ APP_KEY, APP_NAME, APP_URL
- ✅ DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
- ✅ JWT_SECRET, JWT_ALGO
- ✅ CLOUDINARY_URL, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- ✅ E mais 40+ variáveis

### 3. Adicionar GCP Service Account

```powershell
# Baixar service account key do GCP Console
# Console > IAM > Service Accounts > Actions > Manage Keys > Add Key

# Adicionar ao GitHub
gh secret set GCP_SA_KEY --repo RafaelSedor/TCC_UTFPets_API < caminho/gcp-sa-key.json
```

## Deploy

### Automático (Recomendado)

```bash
# Qualquer push para master ou main dispara o deploy
git add .
git commit -m "feat: nova funcionalidade"
git push origin master
```

### Manual

```bash
# Via GitHub CLI
gh workflow run deploy-vm.yml --repo RafaelSedor/TCC_UTFPets_API

# Via GitHub.com
# Actions > Deploy to Production > Run workflow
```

## O que acontece no deploy?

1. **Preparação**: Instala Docker (se necessário)
2. **Backup**: Cria backup da versão atual
3. **Copy**: Envia código via gcloud scp
4. **Env**: Cria backend/.env com secrets
5. **GCP**: Configura service account key
6. **Build**: Executa docker compose up -d --build
7. **Migrate**: Roda migrations
8. **Cache**: Otimiza configs e rotas
9. **Health**: Verifica endpoint /api/health
10. **Cleanup**: Remove backups antigos (mantém últimos 5)

## Verificar Deploy

### Acompanhar em tempo real

```bash
# Listar workflows
gh run list --repo RafaelSedor/TCC_UTFPets_API

# Ver logs do último
gh run view --repo RafaelSedor/TCC_UTFPets_API --log
```

### Endpoints

- **API**: http://34.39.150.157:8080
- **Health**: http://34.39.150.157:8080/api/health
- **Swagger**: http://34.39.150.157:8080/swagger

## Gerenciar Secrets

### Listar secrets configurados

```bash
gh secret list --repo RafaelSedor/TCC_UTFPets_API
```

### Atualizar secrets

```powershell
# Re-executar script após alterar backend/.env
.\scripts\sync-secrets.ps1 -Repository "RafaelSedor/TCC_UTFPets_API"
```

### Adicionar secret manualmente

```bash
gh secret set NOME_SECRET --repo RafaelSedor/TCC_UTFPets_API --body "valor"
```

## Acessar VM

```bash
# Via gcloud
gcloud compute ssh tccutfpets --zone=southamerica-east1-b --project=tccutfpets

# Ver containers
cd /opt/utfpets
docker compose ps

# Ver logs
docker compose logs -f app

# Logs Laravel
docker compose exec app tail -f storage/logs/laravel.log
```

## Troubleshooting

### Deploy falhou

```bash
# Ver logs detalhados
gh run view --repo RafaelSedor/TCC_UTFPets_API --log

# Conectar na VM e verificar
gcloud compute ssh tccutfpets --zone=southamerica-east1-b --project=tccutfpets
cd /opt/utfpets
docker compose logs
```

### Containers não sobem

```bash
# Na VM
cd /opt/utfpets
docker compose down
docker compose up -d --build
docker compose logs -f
```

### Migrations falhando

```bash
# Na VM
cd /opt/utfpets
docker compose exec app php artisan migrate:status
docker compose exec app php artisan migrate --force
```

### Erro de permissão

```bash
# Na VM
cd /opt/utfpets
sudo chown -R 1000:1000 backend/storage backend/bootstrap/cache
sudo chmod -R 775 backend/storage backend/bootstrap/cache
```

### Rollback

```bash
# Na VM, listar backups
ls -la /opt/utfpets_backups/

# Restaurar backup
cd /opt/utfpets
docker compose down
sudo cp -r /opt/utfpets_backups/utfpets_YYYYMMDD_HHMMSS/* .
docker compose up -d
```

## Comandos Úteis

### Laravel

```bash
# Artisan na VM
cd /opt/utfpets
docker compose exec app php artisan [comando]

# Exemplos:
docker compose exec app php artisan migrate:status
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan queue:work
```

### Docker

```bash
# Ver status
docker compose ps

# Ver logs
docker compose logs -f [serviço]

# Reiniciar serviço
docker compose restart [serviço]

# Rebuild
docker compose up -d --build [serviço]
```

### Database

```bash
# Conectar ao PostgreSQL via Cloud SQL Proxy
docker compose exec cloud-sql-proxy psql -h localhost -U RafaelSedor -d postgres

# Backup
docker compose exec cloud-sql-proxy pg_dump -h localhost -U RafaelSedor postgres > backup.sql
```

## Estrutura na VM

```
/opt/utfpets/
├── backend/
│   ├── .env                    # Criado pelo deploy
│   └── storage/
│       └── keys/
│           └── gcp-service-account.json
├── frontend/
├── docker-compose.yml
├── .env.production             # Variáveis do compose
└── entrypoint.sh

/opt/utfpets_backups/
├── utfpets_20250111_143022/
├── utfpets_20250111_150133/
└── ...                         # Últimos 5 backups
```

## Secrets Necessários

### Sincronizados pelo script
- APP_* (50+ variáveis da aplicação)
- DB_* (database)
- JWT_* (auth)
- CLOUDINARY_* (storage)
- MAIL_* (email)
- REDIS_* (cache)

### Configurados manualmente
- `GCP_SA_KEY`: JSON da service account do GCP

## Links Úteis

- [GCP Console](https://console.cloud.google.com/compute/instances?project=tccutfpets)
- [GitHub Actions](https://github.com/RafaelSedor/TCC_UTFPets_API/actions)
- [Cloud SQL](https://console.cloud.google.com/sql/instances?project=tccutfpets)

---

**Última atualização**: 2025-01-11
