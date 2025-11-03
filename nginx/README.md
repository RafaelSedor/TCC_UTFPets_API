# Configurações Nginx - UTFPets

Este diretório contém as configurações do Nginx organizadas por ambiente.

## Estrutura de Diretórios

```
nginx/
├── production/          # Configurações de produção (HTTPS)
│   ├── api.utfpets.online.conf      # API com SSL/TLS
│   └── utfpets.online.conf          # Frontend com SSL/TLS
│
├── ssl-setup/          # Configurações temporárias para obter certificados SSL
│   ├── api.utfpets.online.conf      # API HTTP-only para validação Let's Encrypt
│   └── utfpets.online.conf          # Frontend HTTP-only para validação Let's Encrypt
│
└── development/        # Configurações de desenvolvimento local
    └── local.conf                    # Configuração local com CORS aberto

```

## Ambientes

### 🚀 Production (HTTPS)
Configurações completas com SSL/TLS para produção.

**Características:**
- HTTPS (porta 443) com certificados Let's Encrypt
- HTTP (porta 80) com redirecionamento para HTTPS
- Headers de segurança (HSTS, CSP, X-Frame-Options, etc.)
- Compressão Gzip
- Cache otimizado para assets estáticos
- Service Worker e PWA support

**Domínios:**
- `utfpets.online`, `www.utfpets.online` → Frontend Angular
- `api.utfpets.online` → Backend Laravel API

**Uso:**
```yaml
# docker-compose.yml
volumes:
  - ./nginx/production/utfpets.online.conf:/etc/nginx/conf.d/utfpets.conf:ro
  - ./nginx/production/api.utfpets.online.conf:/etc/nginx/conf.d/api.conf:ro
```

---

### 🔐 SSL Setup (HTTP-only)
Configurações temporárias usadas APENAS durante a obtenção inicial dos certificados SSL.

**Características:**
- HTTP-only (porta 80)
- Location especial para `.well-known/acme-challenge/` (validação Let's Encrypt)
- Sem redirecionamentos
- Sem headers HSTS

**Quando usar:**
- Na primeira vez que você faz deploy
- Quando os certificados SSL expiraram
- Para renovar certificados manualmente

**Uso:**
```yaml
# docker-compose.ssl-setup.yml
volumes:
  - ./nginx/ssl-setup/utfpets.online.conf:/etc/nginx/conf.d/utfpets.conf:ro
  - ./nginx/ssl-setup/api.utfpets.online.conf:/etc/nginx/conf.d/api.conf:ro
```

---

### 💻 Development (Local)
Configuração para desenvolvimento local sem SSL.

**Características:**
- HTTP-only (porta 80)
- CORS totalmente aberto (`Access-Control-Allow-Origin: *`)
- Logs detalhados
- Proxy para Swagger UI

**Uso:**
```yaml
# docker-compose.local.yml (se existir)
volumes:
  - ./nginx/development/local.conf:/etc/nginx/conf.d/default.conf:ro
```

---

## Fluxo de Deploy com SSL

O workflow de CI/CD (.github/workflows/deploy-vm.yml) segue este fluxo:

1. **Verificar certificados existentes**
   - Se existem → pular para etapa 3
   - Se não existem → continuar para etapa 2

2. **Obter certificados SSL** (primeira vez)
   ```bash
   # Inicia nginx com configs HTTP-only
   docker compose -f docker-compose.ssl-setup.yml up -d

   # Obtém certificados do Let's Encrypt
   docker run certbot/certbot certonly --webroot ...

   # Para nginx temporário
   docker compose -f docker-compose.ssl-setup.yml down
   ```

3. **Iniciar aplicação com HTTPS**
   ```bash
   # Usa configurações de produção com SSL
   docker compose up -d --build
   ```

---

## Renovação de Certificados

Os certificados Let's Encrypt são válidos por 90 dias.

### Automático
O container `certbot` renova automaticamente:
```yaml
certbot:
  entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

### Manual
Se precisar renovar manualmente:
```bash
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot renew

# Recarregar nginx
docker compose exec nginx nginx -s reload
```

---

## Troubleshooting

### Nginx não inicia (erro de certificado)
**Problema:** Nginx procura certificados SSL que não existem.

**Solução:** Use as configurações HTTP-only temporariamente:
```bash
# No docker-compose.yml, altere temporariamente para:
- ./nginx/ssl-setup/utfpets.online.conf:/etc/nginx/conf.d/utfpets.conf:ro
- ./nginx/ssl-setup/api.utfpets.online.conf:/etc/nginx/conf.d/api.conf:ro

# Obtenha os certificados
# Depois volte para as configurações de produção
```

### CORS bloqueado em produção
**Problema:** Frontend não consegue acessar API (erro CORS).

**Causa:** CSP (Content Security Policy) muito restritivo.

**Solução:** Verifique o header `Content-Security-Policy` em `production/utfpets.online.conf`:
```nginx
add_header Content-Security-Policy "... connect-src 'self' https://api.utfpets.online; ..." always;
```

### Erro 502 Bad Gateway
**Problema:** Nginx não consegue se conectar ao backend.

**Verificações:**
1. Container backend está rodando? `docker compose ps`
2. Backend está saudável? `docker compose exec backend php -r "echo 'OK';"`
3. Nome do serviço correto? Deve ser `backend:9000` (não `app:9000`)

---

## Segurança

### Headers de Segurança Implementados

✅ **HSTS** - Força HTTPS por 1 ano
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

✅ **CSP** - Content Security Policy
```nginx
add_header Content-Security-Policy "default-src 'self'; ..." always;
```

✅ **X-Frame-Options** - Previne clickjacking
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
```

✅ **X-Content-Type-Options** - Previne MIME sniffing
```nginx
add_header X-Content-Type-Options "nosniff" always;
```

✅ **X-XSS-Protection** - Proteção XSS (legado)
```nginx
add_header X-XSS-Protection "1; mode=block" always;
```

### Testes de Segurança

Teste seus headers de segurança:
- https://securityheaders.com/?q=utfpets.online
- https://www.ssllabs.com/ssltest/analyze.html?d=utfpets.online

---

## Referências

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt - Certbot](https://certbot.eff.org/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
