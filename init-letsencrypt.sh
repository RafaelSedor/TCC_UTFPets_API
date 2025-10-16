#!/bin/bash

# Script para obter certificado SSL do Let's Encrypt
# Deve ser executado manualmente na VM após o primeiro deploy

DOMAIN="api.utfpets.online"
EMAIL="seu-email@example.com" # ALTERAR para seu email

echo "🔐 Iniciando configuração SSL para $DOMAIN"

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p certbot/conf
mkdir -p certbot/www

# Obter certificado
echo "📜 Obtendo certificado SSL..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ Certificado SSL obtido com sucesso!"
    echo "🔄 Reiniciando nginx..."
    docker compose restart nginx
    echo "✅ HTTPS configurado! Acesse: https://$DOMAIN"
else
    echo "❌ Falha ao obter certificado SSL"
    echo "Verifique se:"
    echo "  1. O DNS está apontando corretamente para o IP da VM"
    echo "  2. As portas 80 e 443 estão abertas no firewall"
    echo "  3. O domínio está propagado (pode levar até 48h)"
    exit 1
fi
