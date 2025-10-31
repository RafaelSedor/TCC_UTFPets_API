# Guia de Deploy - UTFPets API

## Infraestrutura

### Arquitetura Escolhida

**VM + Cloud SQL (Google Cloud Platform)**

- **VM**: Compute Engine e2-medium (2 vCPUs, 4GB RAM)
- **Banco**: Cloud SQL PostgreSQL 17
- **Região**: southamerica-east1 (São Paulo)

**Justificativa**: A separação entre aplicação (VM) e banco de dados (Cloud SQL) oferece:
- **Escalabilidade independente**: VM e banco podem escalar separadamente
- **Backup gerenciado**: Cloud SQL oferece backups automáticos
- **Alta disponibilidade**: Cloud SQL possui réplicas automáticas
- **Custo-benefício**: e2-medium suficiente para o escopo do TCC

### Docker Compose

A aplicação usa Docker Compose para orquestração:

```yaml
services:
  app:       # Laravel API
  nginx:     # Reverse proxy
  cloud-sql-proxy: # Proxy seguro para Cloud SQL
```

**Justificativa**:
- **Portabilidade**: Mesma configuração em dev e produção
- **Isolamento**: Cada serviço em seu container
- **Cloud SQL Proxy**: Conexão segura sem expor IP público do banco

## CI/CD com GitHub Actions

### Fluxo Automatizado

Cada push na branch `master` dispara:

1. Autenticação no GCP com Service Account
2. Backup da versão atual
3. Deploy de novos arquivos na VM
4. Rebuild dos containers
5. Execução de migrations
6. Health check
7. Limpeza de backups antigos (mantém 5)

**Justificativa**:
- **Confiabilidade**: Deploy consistente sem intervenção manual
- **Rollback rápido**: Backups automáticos a cada deploy
- **Validação**: Health check garante que deploy funcionou
- **Auditoria**: Histórico completo no GitHub Actions

### Service Account

Usa-se Service Account dedicada (`github-actions-deployer`) com permissões mínimas:
- Compute Instance Admin (apenas para a VM específica)
- Service Account User

**Justificativa**: Princípio do privilégio mínimo. Se a chave vazar, danos são limitados.

## Segurança

### Firewall Configurado

- **Portas abertas**: 80 (HTTP), 443 (HTTPS), 8080 (API)
- **SSH**: Apenas via gcloud (IAM)

**Justificativa**: Reduz superfície de ataque. SSH não exposto publicamente.

### Secrets Management

- **`.env`**: Nunca commitado, copiado via script
- **Service Account Keys**: Armazenadas como GitHub Secrets
- **Permissões**: Arquivos sensíveis com 600 (apenas owner)

**Justificativa**: Previne vazamento acidental de credenciais no controle de versão.

### Backups Automáticos

- **Frequência**: A cada deploy
- **Retenção**: 5 backups mais recentes
- **Localização**: `/opt/utfpets_backup_YYYYMMDD_HHMMSS`

**Justificativa**: Permite rollback rápido em caso de deploy problemático.

## Decisões Técnicas

### Por que não Kubernetes?

Para o escopo do TCC, Docker Compose é suficiente:
- **Simplicidade**: Mais fácil de entender e manter
- **Custo**: Kubernetes requer mais recursos ($$)
- **Escopo**: Single-server atende demanda esperada

**Justificativa**: Evita complexidade desnecessária. Kubernetes seria over-engineering para este projeto.

### Por que Cloud SQL e não DB no Docker?

- **Persistência garantida**: Dados não dependem da VM
- **Backups gerenciados**: GCP cuida dos backups
- **Performance**: SSDs otimizados
- **Manutenção**: Patches automáticos

**Justificativa**: Confiabilidade do banco é crítica. Cloud SQL remove essa preocupação.

### Por que GitHub Actions e não Jenkins/GitLab CI?

- **Integração nativa**: Direto no repositório
- **Gratuito**: Para repositórios públicos/acadêmicos
- **Simplicidade**: Configuração em YAML simples

**Justificativa**: Reduz complexidade de infra (não precisa manter servidor Jenkins).

## URLs da Aplicação

- **API**: http://34.39.150.157:8080
- **Swagger**: http://34.39.150.157:8080/swagger
- **Health Check**: http://34.39.150.157:8080/api/health

## Monitoramento

### Health Check Endpoint

`GET /api/health` retorna status da aplicação e conexão com banco:

**Justificativa**: Permite validar deploy automaticamente e configurar alertas externos (UptimeRobot, etc).

### Logs

Logs da aplicação acessíveis via:
```bash
docker-compose logs -f app
```

**Justificativa**: Centralização de logs facilita debugging em produção.

## Melhorias Futuras

Para evolução além do TCC:

- **HTTPS**: Certificado SSL via Let's Encrypt
- **CDN**: Cloudflare para assets estáticos
- **Monitoring**: Grafana + Prometheus
- **Auto-scaling**: Horizontal pod autoscaler
- **Multi-region**: Réplicas em outras regiões
- **Container Registry**: GCR em vez de rebuild na VM

**Nota**: Estas melhorias adicionariam complexidade além do escopo acadêmico atual.
