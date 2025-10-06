# 🗄️ Script de Configuração de Banco de Dados - UTFPets API (PowerShell)
# Este script facilita o gerenciamento dos ambientes de banco de dados

param(
    [Parameter(Position=0)]
    [ValidateSet("test", "production", "clean", "status", "help")]
    [string]$Command = "help"
)

# Cores para output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Cyan"
    White = "White"
}

function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorMessage "[INFO] $Message" $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-ColorMessage "[WARNING] $Message" $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-ColorMessage "[ERROR] $Message" $Colors.Red
}

function Write-Header {
    param([string]$Message)
    Write-ColorMessage "=== $Message ===" $Colors.Blue
}

# Função para verificar se Docker está rodando
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Error "Docker não está rodando. Por favor, inicie o Docker primeiro."
        return $false
    }
}

# Função para configurar ambiente de teste
function Setup-TestEnvironment {
    Write-Header "Configurando Ambiente de Teste"

    Write-Info "Subindo banco de teste (test-db)..."
    docker-compose up -d test-db

    Write-Info "Aguardando banco de teste ficar pronto..."
    Start-Sleep -Seconds 8

    Write-Info "Subindo aplicacao (app)..."
    docker-compose up -d app

    # Aguarda o healthcheck do servico 'app' (quando disponivel)
    $maxAttempts = 30
    $attempt = 0
    do {
        $attempt++
        $status = (docker inspect -f '{{.State.Health.Status}}' utfpets-app 2>$null)
        if (-not $status) {
            # Se nao houver healthcheck, apenas verifica se esta "running"
            $running = (docker inspect -f '{{.State.Running}}' utfpets-app 2>$null)
            if ($running -eq 'true') { break }
        } elseif ($status -eq 'healthy') {
            break
        }
        Start-Sleep -Seconds 2
    } while ($attempt -lt $maxAttempts)

    Write-Info "Aguardando aplicacao ficar pronta..."
    $maxAttempts = 30
    $attempt = 0
    do {
        $attempt++
        $status = (docker inspect -f '{{.State.Health.Status}}' utfpets-app 2>$null)
        if ($status -eq 'healthy') {
            break
        }
        Write-Info "Tentativa $attempt/$maxAttempts - Status: $status"
        Start-Sleep -Seconds 5
    } while ($attempt -lt $maxAttempts)

    if ($status -ne 'healthy') {
        Write-Error "Aplicacao nao ficou pronta a tempo"
        return
    }

    Write-Info "Executando migracoes no ambiente de teste..."
    docker-compose exec app php artisan migrate --force --env=testing

    Write-Info "Executando testes..."
    docker-compose exec app php artisan test

    Write-Info "Ambiente de teste configurado com sucesso!"
}

# Função para configurar ambiente de produção
function Setup-ProductionEnvironment {
    Write-Header "Configurando Ambiente de Producao"
    
    Write-Warning "ATENCAO: Esta operacao ira executar migracoes no banco de PRODUCAO!"
    $confirmation = Read-Host "Tem certeza que deseja continuar? (y/N)"
    
    if ($confirmation -ne "y" -and $confirmation -ne "Y") {
        Write-Info "Operação cancelada."
        return
    }
    
    Write-Info "Verificando conexao com Supabase..."
    docker-compose exec utfpets-app php artisan tinker --execute="DB::connection()->getPdo(); echo 'Conexão OK';"
    
    Write-Info "Executando migracoes no ambiente de producao..."
    docker-compose exec utfpets-app php artisan migrate --force
    
    Write-Info "Ambiente de producao configurado com sucesso!"
}

# Função para limpar ambientes
function Clear-Environment {
    Write-Header "Limpando Ambientes"
    
    Write-Info "Parando containers e removendo volumes..."
    docker-compose down -v
    
    Write-Info "Ambientes limpos com sucesso!"
}

# Função para mostrar status
function Show-Status {
    Write-Header "Status dos Ambientes"
    
    Write-Info "Containers Docker:"
    docker-compose ps
    
    Write-Info "`nVolumes Docker:"
    docker volume ls | Select-String "utfpets"
    
    Write-Info "`nConexoes de banco configuradas:"
    try {
        docker-compose exec utfpets-app php artisan tinker --execute="
            echo 'Teste: ' . (DB::connection('pgsql_testing')->getPdo() ? 'OK' : 'ERRO');
            echo 'Produção: ' . (DB::connection('pgsql')->getPdo() ? 'OK' : 'ERRO');
        "
    }
    catch {
        Write-Warning "Não foi possível verificar conexões"
    }
}

# Função para mostrar ajuda
function Show-Help {
    Write-Host "🗄️  UTFPets API - Gerenciador de Banco de Dados" -ForegroundColor $Colors.Blue
    Write-Host ""
    Write-Host "Uso: .\scripts\db-setup.ps1 [comando]"
    Write-Host ""
    Write-Host "Comandos disponíveis:"
    Write-Host "  test        - Configura e executa ambiente de teste"
    Write-Host "  production  - Configura ambiente de produção (Supabase)"
    Write-Host "  clean       - Limpa todos os ambientes"
    Write-Host "  status      - Mostra status dos ambientes"
    Write-Host "  help        - Mostra esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:"
    Write-Host "  .\scripts\db-setup.ps1 test        # Configura ambiente de teste"
    Write-Host "  .\scripts\db-setup.ps1 production  # Executa migracoes na produção"
    Write-Host "  .\scripts\db-setup.ps1 clean       # Limpa tudo"
    Write-Host "  .\scripts\db-setup.ps1 status      # Verifica status"
}

# Verificar se Docker está rodando
if (-not (Test-Docker)) {
    exit 1
}

# Processar comandos
switch ($Command) {
    "test" {
        Setup-TestEnvironment
    }
    "production" {
        Setup-ProductionEnvironment
    }
    "clean" {
        Clear-Environment
    }
    "status" {
        Show-Status
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Comando inválido: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
