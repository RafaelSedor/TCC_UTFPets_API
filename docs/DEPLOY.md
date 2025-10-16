# Guia de Deploy - UTFPets API

Guia completo para configurar e fazer deploy automático da UTFPets API no Google Cloud Platform.

## Infraestrutura

### VM (Compute Engine)
- **Nome**: tccutfpets
- **Zona**: southamerica-east1-b
- **Tipo**: e2-medium (2 vCPUs, 4GB RAM)
- **OS**: Debian 12 Bookworm
- **IP Externo**: 34.39.150.157
- **IP Interno**: 10.158.0.2
- **Disco**: 10GB

### Cloud SQL
- **Instance**: tccutfpets:southamerica-east1:tcc
- **Versão**: PostgreSQL 17.6
- **Região**: southamerica-east1

---

## Setup Inicial (Executar Apenas uma Vez)

### Passo 1: Configurar Firewall

Execute localmente para abrir portas HTTP/HTTPS:

```bash
chmod +x scripts/setup-firewall.sh
./scripts/setup-firewall.sh
```

### Passo 2: Deploy Inicial da Aplicação

Execute localmente para configurar a VM:

```bash
chmod +x scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh
```

Isso irá:
- Instalar Docker e Docker Compose na VM
- Copiar arquivos do projeto
- Copiar service account key
- Configurar permissões
- Iniciar containers
- Executar migrations
- Otimizar aplicação

### Passo 3: Configurar CI/CD (Deploy Automático)

Execute o script para configurar tudo automaticamente:

```bash
chmod +x scripts/setup-ci-cd.sh
./scripts/setup-ci-cd.sh
```

Esse script irá:
1. Criar Service Account `github-actions-deployer`
2. Conceder permissões necessárias
3. Gerar chave JSON
4. Instruir você a adicionar o secret no GitHub

**Ação Manual Necessária:**
Após executar o script acima, siga as instruções para:
1. Ir em **GitHub** → **Settings** → **Secrets and variables** → **Actions**
2. Criar secret `GCP_SA_KEY` com o conteúdo de `github-actions-key.json`
3. Deletar o arquivo `github-actions-key.json` localmente

---

## Deploy Automático

### Como Funciona

Após configurar o CI/CD, cada push na branch `master` automaticamente:

1. Autentica no Google Cloud
2. Para containers
3. Faz backup da versão atual
4. Copia novos arquivos para a VM
5. Reconstrói containers Docker
6. Executa migrations
7. Otimiza a aplicação (cache)
8. Verifica se está funcionando (health check)
9. Mantém apenas 5 backups mais recentes

### Fazer Deploy

```bash
git add .
git commit -m "feat: sua mensagem"
git push origin master
```

Acompanhe em: **GitHub** → **Actions**

---

## URLs da Aplicação

- **API**: http://34.39.150.157:8080
- **Swagger**: http://34.39.150.157:8080/swagger
- **Health Check**: http://34.39.150.157:8080/api/health

---

## Comandos Úteis

### Conectar na VM

```bash
gcloud compute ssh tccutfpets --zone=southamerica-east1-b
```

### Ver Status dos Containers

```bash
cd /opt/utfpets
docker-compose ps
```

### Ver Logs

```bash
# Logs de todos os containers
docker-compose logs -f

# Logs apenas do app
docker-compose logs -f app

# Logs do Laravel
docker-compose exec app tail -f storage/logs/laravel.log
```

### Executar Comandos Laravel

```bash
cd /opt/utfpets

# Migrations
docker-compose exec app php artisan migrate

# Limpar cache
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear

# Otimizar para produção
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache
```

### Reiniciar Containers

```bash
cd /opt/utfpets
docker-compose restart
```

### Rebuild Completo

```bash
cd /opt/utfpets
docker-compose down
docker-compose up -d --build
```

---

## Backups

### Backups Automáticos

A cada deployment via CI/CD:
- Backup criado em: `/opt/utfpets_backup_YYYYMMDD_HHMMSS`
- Mantidos os 5 backups mais recentes
- Backups antigos removidos automaticamente

### Reverter para Backup

```bash
# Conectar na VM
gcloud compute ssh tccutfpets --zone=southamerica-east1-b

# Listar backups
ls -ltr /opt/utfpets_backup_*

# Reverter
cd /opt/utfpets
docker-compose down
sudo rm -rf /opt/utfpets
sudo cp -r /opt/utfpets_backup_20250115_143022 /opt/utfpets
cd /opt/utfpets
docker-compose up -d
```

### Backup do Banco de Dados

```bash
cd /opt/utfpets

# Criar backup
docker-compose exec -T cloud-sql-proxy pg_dump -h localhost -U RafaelSedor postgres > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker-compose exec -T cloud-sql-proxy psql -h localhost -U RafaelSedor postgres < backup_20250115.sql
```

---

## Troubleshooting

### Container Não Inicia

```bash
# Ver logs detalhados
docker-compose logs app

# Verificar .env
cat .env

# Testar conexão com Cloud SQL
docker-compose exec app nc -zv cloud-sql-proxy 5432
```

### Erro de Permissão no Storage

```bash
sudo chown -R 1000:1000 /opt/utfpets/storage /opt/utfpets/bootstrap/cache
sudo chmod -R 775 /opt/utfpets/storage /opt/utfpets/bootstrap/cache
```

### Migrations Falhando

```bash
# Ver status
docker-compose exec app php artisan migrate:status

# Ver detalhes do erro
docker-compose exec app php artisan migrate --verbose
```

### Deploy Falha no CI/CD

1. Ver logs no **GitHub Actions**
2. Conectar na VM e ver logs dos containers
3. Verificar health endpoint manualmente
4. Reverter para backup se necessário

---

## Segurança

### Checklist de Segurança

- [x] Firewall configurado (apenas portas 80, 443, 8080)
- [x] `.env` com permissões 600
- [x] `gcp-service-account.json` com permissões 600
- [x] APP_DEBUG=false em produção
- [x] Senhas fortes no .env
- [x] CI/CD com backups automáticos
- [ ] HTTPS configurado (opcional)

### Boas Práticas

- Nunca commitar arquivos `.env` ou `*-key.json`
- Rotacionar chaves da service account periodicamente
- Revisar logs de deployment regularmente
- Manter backups do banco de dados
- Monitorar uso de recursos da VM

---

## Configuração HTTPS (Opcional)

Se você tiver um domínio apontando para `34.39.150.157`:

```bash
# Copiar script para VM
gcloud compute scp scripts/setup-https.sh tccutfpets:/tmp/ --zone=southamerica-east1-b

# Conectar na VM
gcloud compute ssh tccutfpets --zone=southamerica-east1-b

# Executar script (fornecerá seu domínio e email)
sudo bash /tmp/setup-https.sh
```

---

## Estrutura de Arquivos na VM

```
/opt/utfpets/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
├── routes/
├── storage/
│   └── keys/
│       └── gcp-service-account.json
├── .env
├── docker-compose.yml
├── Dockerfile
└── entrypoint.sh

/opt/utfpets_backup_*/
└── (backups automáticos do CI/CD)
```

---

## Fluxo de Trabalho Recomendado

1. Desenvolver em branch de feature
2. Criar Pull Request para master
3. Code Review
4. Merge para master
5. **Deploy Automático** (GitHub Actions)
6. Monitorar logs e health check
7. Reverter se necessário

---

## Monitoramento

### Health Check Manual

```bash
curl http://34.39.150.157:8080/api/health
```

### Status dos Containers

```bash
docker-compose ps
```

### Uso de Recursos

```bash
docker stats
```

### Logs em Tempo Real

```bash
docker-compose logs -f
```

---

## Suporte

Em caso de problemas:

1. Verificar logs: `docker-compose logs -f`
2. Verificar status: `docker-compose ps`
3. Verificar health: `curl http://34.39.150.157:8080/api/health`
4. Verificar GitHub Actions se deploy falhou
5. Consultar backups disponíveis
6. Reverter se necessário

---

**Última atualização**: Outubro 2025
