# Setup para Desenvolvimento Local

## Arquitetura Local

### docker-compose.local.yml

O projeto utiliza configuração separada para desenvolvimento local:

**Justificativa**: Separar configurações de dev e produção evita deploy acidental de configurações locais. O arquivo `docker-compose.local.yml` sobrescreve apenas o necessário (porta 80 e configuração do nginx).

### Nginx Localhost

```nginx
server {
    listen 80;
    server_name localhost;
    # ...
}
```

**Justificativa**: Em desenvolvimento, usa-se `localhost` sem SSL para simplicidade. Em produção, usa-se domínio real com HTTPS.

## Decisões Técnicas

### Por que não SQLite?

Mesmo localmente, usa-se PostgreSQL (via Cloud SQL):

**Justificativa**:
- **Paridade com produção**: Evita bugs específicos de SQLite vs PostgreSQL
- **Features específicas**: JSONB, Enums, etc não existem em SQLite
- **Testes realistas**: Queries testadas localmente funcionarão em prod

### Cloud SQL Proxy Local

O proxy é usado também em desenvolvimento:

**Justificativa**: Mantém configuração idêntica à produção. Testa o proxy localmente antes do deploy.

### Porta 80 vs 8080

- **Local**: Porta 80 (http://localhost)
- **Produção**: Porta 8080 (http://IP:8080)

**Justificativa**: Porta 80 requer sudo em muitos sistemas, mas em Docker não há esse problema. Simplifica URLs locais.

### Hot Reload Não Configurado

Laravel não possui hot reload nativo como frameworks JavaScript:

**Justificativa**: PHP não requer build step. Mudanças em arquivos PHP são refletidas imediatamente (opcache desabilitado em dev).

## Testes Locais

### Parâmetro `-T` no docker-compose exec

```bash
docker-compose exec -T app php artisan test
```

**Justificativa**: O parâmetro `-T` desabilita alocação de TTY, evitando que testes travem após warnings do PHPUnit. Essencial para CI/CD e scripts automatizados.

### Banco de Teste Separado

O arquivo `.env.testing` usa banco separado:

**Justificativa**: Testes não devem poluir banco de desenvolvimento. Migrations rodam fresh a cada execução de teste.

## Desenvolvimento

### URLs Locais

- **API**: http://localhost/api
- **Swagger**: http://localhost/swagger
- **Health**: http://localhost/api/health

### Swagger UI Local

Swagger UI roda em container separado apontando para `localhost`:

**Justificativa**: Evita problemas de CORS. Swagger UI e API na mesma origem (localhost).

## Comparação: Local vs Produção

| Aspecto | Local | Produção |
|---------|-------|----------|
| URL | localhost | IP público |
| Porta | 80 | 8080 |
| SSL | Não | Sim (futuro) |
| Logs | Console | Arquivos + GCP Logging |
| Debug | Habilitado | Desabilitado |
| Cache | Desabilitado | Habilitado |

**Justificativa**: Ambiente de dev prioriza debugging (logs verbosos, debug ativo). Produção prioriza performance (cache, otimizações).
