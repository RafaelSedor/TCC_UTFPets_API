#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Sincroniza variáveis de ambiente do .env para GitHub Actions Secrets

.DESCRIPTION
    Este script automatiza o processo de enviar todas as variáveis do arquivo .env
    para o GitHub Actions como secrets. Útil para configurar deploy em produção.

    Pré-requisitos:
      - GitHub CLI instalado: https://cli.github.com/
      - Autenticado: gh auth login
      - Acesso de admin ao repositório

    O script sincroniza automaticamente 50+ variáveis incluindo:
      - Aplicação (APP_NAME, APP_KEY, APP_URL)
      - Banco de dados (DB_*)
      - Cache/Queue (REDIS_*, CACHE_*)
      - Email (MAIL_*)
      - Cloudinary (CLOUDINARY_*)
      - JWT (JWT_SECRET, JWT_ALGO)
      - CORS (CORS_ALLOWED_ORIGINS)

.PARAMETER EnvFile
    Caminho para o arquivo .env (padrão: backend/.env)

.PARAMETER Repository
    Repositório GitHub no formato owner/repo

.PARAMETER DryRun
    Executa sem fazer alterações reais (apenas mostra o que seria feito)

.EXAMPLE
    # Uso básico
    .\scripts\sync-secrets.ps1 -Repository "rafaelsedor/TCC_UTFPets_API"

.EXAMPLE
    # Testar antes de aplicar (dry-run)
    .\scripts\sync-secrets.ps1 -Repository "rafaelsedor/TCC_UTFPets_API" -DryRun

.EXAMPLE
    # Usar arquivo .env customizado
    .\scripts\sync-secrets.ps1 -Repository "rafaelsedor/TCC_UTFPets_API" -EnvFile "backend/.env.production"

.NOTES
    Autor: Rafael Sedor
    Projeto: UTFPets TCC
    Versão: 1.0.0
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = "backend/.env",

    [Parameter(Mandatory=$true)]
    [string]$Repository,

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Cores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Banner
Write-Host ""
Write-ColorOutput Cyan "╔═══════════════════════════════════════════════════════════╗"
Write-ColorOutput Cyan "║         UTFPets - GitHub Secrets Sync Tool              ║"
Write-ColorOutput Cyan "╚═══════════════════════════════════════════════════════════╝"
Write-Host ""

# Verificar se o GitHub CLI está instalado
Write-Host "🔍 Verificando dependências..."
try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-ColorOutput Green "✓ GitHub CLI encontrado: $ghVersion"
} catch {
    Write-ColorOutput Red "✗ GitHub CLI não encontrado!"
    Write-Host "  Instale em: https://cli.github.com/"
    exit 1
}

# Verificar autenticação
Write-Host ""
Write-Host "🔐 Verificando autenticação..."
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "✓ Autenticado no GitHub"
    } else {
        throw "Não autenticado"
    }
} catch {
    Write-ColorOutput Red "✗ Não autenticado no GitHub!"
    Write-Host "  Execute: gh auth login"
    exit 1
}

# Verificar se o arquivo .env existe
Write-Host ""
Write-Host "📁 Verificando arquivo .env..."
$envPath = Join-Path $PSScriptRoot ".." $EnvFile
if (-not (Test-Path $envPath)) {
    Write-ColorOutput Red "✗ Arquivo não encontrado: $envPath"
    exit 1
}
Write-ColorOutput Green "✓ Arquivo encontrado: $envPath"

# Ler variáveis do .env
Write-Host ""
Write-Host "📖 Lendo variáveis de ambiente..."
$envVars = @{}
$secretsToSync = @(
    "APP_NAME",
    "APP_ENV",
    "APP_KEY",
    "APP_DEBUG",
    "APP_TIMEZONE",
    "APP_URL",
    "APP_LOCALE",
    "APP_FALLBACK_LOCALE",
    "APP_FAKER_LOCALE",
    "APP_MAINTENANCE_DRIVER",
    "APP_MAINTENANCE_STORE",
    "BCRYPT_ROUNDS",
    "LOG_CHANNEL",
    "LOG_STACK",
    "LOG_DEPRECATIONS_CHANNEL",
    "LOG_LEVEL",
    "DB_CONNECTION",
    "DB_HOST",
    "DB_PORT",
    "DB_DATABASE",
    "DB_USERNAME",
    "DB_PASSWORD",
    "SESSION_DRIVER",
    "SESSION_LIFETIME",
    "SESSION_ENCRYPT",
    "SESSION_PATH",
    "SESSION_DOMAIN",
    "BROADCAST_CONNECTION",
    "FILESYSTEM_DISK",
    "QUEUE_CONNECTION",
    "CACHE_STORE",
    "CACHE_PREFIX",
    "REDIS_CLIENT",
    "REDIS_HOST",
    "REDIS_PASSWORD",
    "REDIS_PORT",
    "MAIL_MAILER",
    "MAIL_HOST",
    "MAIL_PORT",
    "MAIL_USERNAME",
    "MAIL_PASSWORD",
    "MAIL_ENCRYPTION",
    "MAIL_FROM_ADDRESS",
    "MAIL_FROM_NAME",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_DEFAULT_REGION",
    "AWS_BUCKET",
    "AWS_USE_PATH_STYLE_ENDPOINT",
    "VITE_APP_NAME",
    "CLOUDINARY_URL",
    "CLOUDINARY_UPLOAD_PRESET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "JWT_SECRET",
    "JWT_ALGO",
    "CORS_ALLOWED_ORIGINS"
)

Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    # Ignorar linhas vazias e comentários
    if ($line -and -not $line.StartsWith("#")) {
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()

            # Remover aspas se existirem
            $value = $value -replace '^["'']|["'']$', ''

            if ($secretsToSync -contains $key) {
                $envVars[$key] = $value
            }
        }
    }
}

Write-ColorOutput Green "✓ Encontradas $($envVars.Count) variáveis para sincronizar"

# Listar variáveis que serão sincronizadas
Write-Host ""
Write-Host "📋 Variáveis que serão sincronizadas:"
Write-Host ""
$envVars.Keys | Sort-Object | ForEach-Object {
    $maskedValue = if ($_ -match "(KEY|SECRET|PASSWORD|TOKEN)") {
        "***MASKED***"
    } else {
        $envVars[$_].Substring(0, [Math]::Min(50, $envVars[$_].Length))
    }
    Write-Host "   • $_" -NoNewline
    Write-ColorOutput DarkGray " = $maskedValue"
}

# Confirmar antes de prosseguir
if (-not $DryRun) {
    Write-Host ""
    Write-ColorOutput Yellow "⚠️  Isso irá sobrescrever os secrets existentes no repositório!"
    $confirm = Read-Host "Deseja continuar? (s/N)"
    if ($confirm -ne "s" -and $confirm -ne "S") {
        Write-ColorOutput Yellow "Operação cancelada."
        exit 0
    }
}

# Sincronizar secrets
Write-Host ""
Write-Host "🚀 Sincronizando secrets com GitHub Actions..."
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($key in $envVars.Keys | Sort-Object) {
    $value = $envVars[$key]

    if ($DryRun) {
        Write-Host "   [DRY-RUN] " -NoNewline -ForegroundColor Cyan
        Write-Host "Enviaria secret: $key"
        $successCount++
    } else {
        try {
            # Usar gh secret set para criar/atualizar o secret
            $value | gh secret set $key --repo $Repository 2>&1 | Out-Null

            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✓ " -NoNewline -ForegroundColor Green
                Write-Host "$key"
                $successCount++
            } else {
                throw "Falha ao definir secret"
            }
        } catch {
            Write-Host "   ✗ " -NoNewline -ForegroundColor Red
            Write-Host "$key - Erro: $_"
            $errorCount++
        }
    }
}

# Resumo
Write-Host ""
Write-ColorOutput Cyan "═══════════════════════════════════════════════════════════"
Write-Host ""

if ($DryRun) {
    Write-ColorOutput Cyan "🧪 Modo DRY-RUN - Nenhuma alteração foi feita"
    Write-Host ""
    Write-Host "Total de secrets que seriam sincronizados: " -NoNewline
    Write-ColorOutput Green $successCount
} else {
    Write-Host "✅ Sincronização concluída!"
    Write-Host ""
    Write-Host "Sucesso: " -NoNewline
    Write-ColorOutput Green $successCount

    if ($errorCount -gt 0) {
        Write-Host "Erros: " -NoNewline
        Write-ColorOutput Red $errorCount
    }
}

Write-Host ""
Write-ColorOutput Cyan "═══════════════════════════════════════════════════════════"
Write-Host ""

# Listar secrets configurados
if (-not $DryRun) {
    Write-Host "📋 Secrets configurados no repositório:"
    Write-Host ""
    gh secret list --repo $Repository
    Write-Host ""
}

exit 0
