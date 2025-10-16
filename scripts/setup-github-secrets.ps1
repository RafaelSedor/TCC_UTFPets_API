# Script PowerShell para criar GitHub Secrets a partir do .env local
# Requer: GitHub CLI (gh) instalado e autenticado

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setup GitHub Secrets from .env" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se gh está instalado
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) não está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale com: winget install GitHub.cli"
    Write-Host "Ou baixe em: https://cli.github.com/"
    Write-Host ""
    exit 1
}

# Verificar se está autenticado
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Você não está autenticado no GitHub CLI" -ForegroundColor Yellow
    Write-Host "Executando autenticação..."
    gh auth login
}

Write-Host "✓ GitHub CLI configurado" -ForegroundColor Green
Write-Host ""

# Verificar se .env existe
if (!(Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado" -ForegroundColor Red
    Write-Host "Execute este script na raiz do projeto"
    exit 1
}

Write-Host "✓ Arquivo .env encontrado" -ForegroundColor Green
Write-Host ""

# Função para ler valor do .env
function Get-EnvValue {
    param($Key)

    $content = Get-Content ".env" | Where-Object { $_ -match "^$Key=" }
    if ($content) {
        $value = $content -replace "^$Key=", ""
        $value = $value -replace '^"', '' -replace '"$', ''
        return $value
    }
    return $null
}

# Lista de variáveis OBRIGATÓRIAS
$requiredVars = @(
    "APP_KEY",
    "JWT_SECRET",
    "DB_HOST",
    "DB_DATABASE",
    "DB_USERNAME",
    "DB_PASSWORD",
    "CLOUDINARY_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
)

# Lista de variáveis OPCIONAIS
$optionalVars = @(
    "APP_NAME",
    "APP_ENV",
    "APP_DEBUG",
    "APP_URL",
    "DB_CONNECTION",
    "DB_PORT",
    "LOG_CHANNEL",
    "LOG_LEVEL",
    "BROADCAST_DRIVER",
    "CACHE_DRIVER",
    "FILESYSTEM_DISK",
    "QUEUE_CONNECTION",
    "SESSION_DRIVER",
    "SESSION_LIFETIME",
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
    "JWT_TTL",
    "GOOGLE_CLOUD_PROJECT"
)

# Verificar variáveis obrigatórias
Write-Host "Verificando variáveis obrigatórias..." -ForegroundColor Yellow
$missingVars = @()

foreach ($var in $requiredVars) {
    $value = Get-EnvValue $var
    if ([string]::IsNullOrEmpty($value)) {
        $missingVars += $var
        Write-Host "  ✗ $var - não encontrado" -ForegroundColor Red
    } else {
        Write-Host "  ✓ $var - encontrado" -ForegroundColor Green
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Variáveis obrigatórias faltando no .env:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "  - $var"
    }
    Write-Host ""
    Write-Host "Configure essas variáveis no .env antes de continuar"
    exit 1
}

Write-Host ""
Write-Host "✓ Todas as variáveis obrigatórias encontradas" -ForegroundColor Green
Write-Host ""

# Mostrar o que será criado
Write-Host "Este script irá criar/atualizar os seguintes secrets no GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Obrigatórios:"
foreach ($var in $requiredVars) {
    Write-Host "  - $var"
}
Write-Host ""
Write-Host "Opcionais (se existirem no .env):"
foreach ($var in $optionalVars) {
    $value = Get-EnvValue $var
    if (![string]::IsNullOrEmpty($value)) {
        Write-Host "  - $var"
    }
}
Write-Host ""

$confirmation = Read-Host "Deseja continuar? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "Cancelado pelo usuário"
    exit 0
}

Write-Host ""
Write-Host "Criando secrets no GitHub..." -ForegroundColor Yellow
Write-Host ""

# Criar secrets
$successCount = 0
$failCount = 0

# Obrigatórios
foreach ($var in $requiredVars) {
    $value = Get-EnvValue $var
    if (![string]::IsNullOrEmpty($value)) {
        try {
            $value | gh secret set $var 2>&1 | Out-Null
            Write-Host "  ✓ $var criado" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "  ✗ $var falhou" -ForegroundColor Red
            $failCount++
        }
    }
}

# Opcionais
foreach ($var in $optionalVars) {
    $value = Get-EnvValue $var
    if (![string]::IsNullOrEmpty($value)) {
        try {
            $value | gh secret set $var 2>&1 | Out-Null
            Write-Host "  ✓ $var criado" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "  ⚠ $var falhou (opcional)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✓ Setup concluído!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Estatísticas:"
Write-Host "  ✓ Secrets criados: $successCount"
if ($failCount -gt 0) {
    Write-Host "  ✗ Falhas: $failCount"
}
Write-Host ""

$repo = (gh repo view --json nameWithOwner -q .nameWithOwner)
Write-Host "Próximos passos:"
Write-Host "1. Verificar secrets em: https://github.com/$repo/settings/secrets/actions"
Write-Host "2. Fazer push para master para testar deploy"
Write-Host "3. Acompanhar em: https://github.com/$repo/actions"
Write-Host ""
