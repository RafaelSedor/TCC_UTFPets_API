# ========================================
# UTFPets - Docker Development Helper (PowerShell)
# ========================================
# Script para facilitar o desenvolvimento com Docker no Windows
# Uso: .\scripts\docker-dev.ps1 [comando]

param(
    [Parameter(Mandatory=$false)]
    [string]$Command = "help",

    [Parameter(Mandatory=$false)]
    [string]$Service = ""
)

# Cores para output
function Write-Info {
    param([string]$Message)
    Write-Host "i $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "! $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "x $Message" -ForegroundColor Red
}

# Verifica se Docker esta rodando
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-Error "Docker nao esta rodando! Por favor, inicie o Docker Desktop."
        exit 1
    }
}

# Comandos
switch ($Command.ToLower()) {
    "start" {
        Write-Info "Iniciando ambiente de desenvolvimento..."
        Test-Docker

        Write-Info "Subindo containers..."
        docker-compose -f docker-compose.local.yml up -d

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Containers iniciados com sucesso!"
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  UTFPets - Ambiente Local" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Aplicacoes:" -ForegroundColor Yellow
            Write-Host "   Frontend (Angular):  http://localhost:4201" -ForegroundColor White
            Write-Host "   Backend (Laravel):   http://localhost/api" -ForegroundColor White
            Write-Host "   Swagger Docs:        http://localhost:8081" -ForegroundColor White
            Write-Host ""
            Write-Host "Banco de Dados:" -ForegroundColor Yellow
            Write-Host "   PostgreSQL:          localhost:5432" -ForegroundColor White
            Write-Host "   Database:            utfpets" -ForegroundColor White
            Write-Host "   User:                postgres" -ForegroundColor White
            Write-Host "   Password:            postgres" -ForegroundColor White
            Write-Host ""
            Write-Host "Comandos uteis:" -ForegroundColor Yellow
            Write-Host "   Ver logs:            .\scripts\docker-dev.ps1 logs" -ForegroundColor Gray
            Write-Host "   Ver logs frontend:   .\scripts\docker-dev.ps1 logs -Service frontend" -ForegroundColor Gray
            Write-Host "   Ver logs backend:    .\scripts\docker-dev.ps1 logs -Service backend" -ForegroundColor Gray
            Write-Host "   Status containers:   .\scripts\docker-dev.ps1 status" -ForegroundColor Gray
            Write-Host "   Parar ambiente:      .\scripts\docker-dev.ps1 stop" -ForegroundColor Gray
            Write-Host ""
            Write-Info "Aguardando containers ficarem prontos (isso pode levar 1-2 minutos)..."
            Write-Info "Use 'docker-compose -f docker-compose.local.yml ps' para verificar o status"
        } else {
            Write-Error "Erro ao iniciar containers!"
            Write-Info "Verifique os logs com: docker-compose -f docker-compose.local.yml logs"
            exit 1
        }
    }

    "stop" {
        Write-Info "Parando containers..."
        docker-compose -f docker-compose.local.yml down
        Write-Success "Containers parados!"
    }

    "restart" {
        Write-Info "Reiniciando containers..."
        docker-compose -f docker-compose.local.yml restart
        Write-Success "Containers reiniciados!"
    }

    "logs" {
        if ($Service) {
            docker-compose -f docker-compose.local.yml logs -f $Service
        } else {
            docker-compose -f docker-compose.local.yml logs -f
        }
    }

    "ps" {
        docker-compose -f docker-compose.local.yml ps
    }

    "status" {
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Status dos Containers" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""

        docker-compose -f docker-compose.local.yml ps

        Write-Host ""
        Write-Host "Healthcheck:" -ForegroundColor Yellow

        $containers = @(
            @{Name="utfpets-postgres-local"; Display="PostgreSQL (Dev)"},
            @{Name="utfpets-postgres-test"; Display="PostgreSQL (Test)"},
            @{Name="utfpets-backend-local"; Display="Backend (Laravel)"},
            @{Name="utfpets-frontend-local"; Display="Frontend (Angular)"},
            @{Name="utfpets-nginx-local"; Display="Nginx"},
            @{Name="utfpets-swagger-ui-local"; Display="Swagger UI"}
        )

        foreach ($container in $containers) {
            $status = docker inspect --format='{{.State.Status}}' $container.Name 2>$null
            if ($status -eq "running") {
                Write-Host "   OK $($container.Display): Running" -ForegroundColor Green
            } elseif ($status) {
                Write-Host "   ERRO $($container.Display): $status" -ForegroundColor Red
            } else {
                Write-Host "   N/A $($container.Display): Not found" -ForegroundColor Gray
            }
        }

        Write-Host ""
        Write-Info "Use '.\scripts\docker-dev.ps1 logs -Service <servico>' para ver logs detalhados"
    }

    "build" {
        if ($Service) {
            Write-Info "Rebuilding $Service..."
            docker-compose -f docker-compose.local.yml build $Service
        } else {
            Write-Info "Rebuilding todos os containers..."
            docker-compose -f docker-compose.local.yml build
        }
        Write-Success "Build completo!"
    }

    "migrate" {
        Write-Info "Executando migrations..."
        docker-compose -f docker-compose.local.yml exec backend php artisan migrate
        Write-Success "Migrations executadas!"
    }

    "seed" {
        Write-Info "Executando seeders..."
        docker-compose -f docker-compose.local.yml exec backend php artisan db:seed
        Write-Success "Seeders executados!"
    }

    "fresh" {
        Write-Warning "Isso vai apagar TODOS os dados do banco de dados!"
        $confirmation = Read-Host "Tem certeza? (y/N)"
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            Write-Info "Executando migrate:fresh..."
            docker-compose -f docker-compose.local.yml exec backend php artisan migrate:fresh --seed
            Write-Success "Banco de dados resetado!"
        } else {
            Write-Info "Operacao cancelada."
        }
    }

    "shell" {
        if (-not $Service) {
            Write-Error "Especifique o container: backend ou frontend"
            Write-Info "Uso: .\scripts\docker-dev.ps1 shell -Service backend"
            exit 1
        }
        Write-Info "Abrindo shell no container $Service..."
        docker-compose -f docker-compose.local.yml exec $Service sh
    }

    "clean" {
        Write-Warning "Isso vai remover todos os containers, volumes e dados!"
        $confirmation = Read-Host "Tem certeza? (y/N)"
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            Write-Info "Limpando tudo..."
            docker-compose -f docker-compose.local.yml down -v
            docker system prune -f
            Write-Success "Limpeza completa!"
        } else {
            Write-Info "Operacao cancelada."
        }
    }

    "test" {
        if ($Service -eq "backend") {
            Write-Info "Executando testes do backend..."
            docker-compose -f docker-compose.local.yml exec backend php artisan test
        } elseif ($Service -eq "frontend") {
            Write-Info "Executando testes do frontend..."
            docker-compose -f docker-compose.local.yml exec frontend npm run test:ci
        } else {
            Write-Error "Especifique: backend ou frontend"
            Write-Info "Uso: .\scripts\docker-dev.ps1 test -Service backend"
            exit 1
        }
    }

    default {
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  UTFPets - Docker Development Helper" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Uso: .\scripts\docker-dev.ps1 [comando] [-Service servico]" -ForegroundColor White
        Write-Host ""
        Write-Host "Gerenciamento de Containers:" -ForegroundColor Yellow
        Write-Host "  start              Inicia todos os containers" -ForegroundColor White
        Write-Host "  stop               Para todos os containers" -ForegroundColor White
        Write-Host "  restart            Reinicia todos os containers" -ForegroundColor White
        Write-Host "  ps                 Lista containers em execucao" -ForegroundColor White
        Write-Host "  status             Mostra status detalhado dos containers" -ForegroundColor White
        Write-Host "  logs               Mostra logs (use -Service para especificar)" -ForegroundColor White
        Write-Host "  build              Rebuild containers (use -Service para especificar)" -ForegroundColor White
        Write-Host "  clean              Remove todos os containers e volumes" -ForegroundColor White
        Write-Host ""
        Write-Host "Banco de Dados:" -ForegroundColor Yellow
        Write-Host "  migrate            Executa migrations do Laravel" -ForegroundColor White
        Write-Host "  seed               Executa seeders do Laravel" -ForegroundColor White
        Write-Host "  fresh              Reseta o banco de dados (migrate:fresh --seed)" -ForegroundColor White
        Write-Host ""
        Write-Host "Desenvolvimento:" -ForegroundColor Yellow
        Write-Host "  shell              Abre shell no container (use -Service)" -ForegroundColor White
        Write-Host "  test               Executa testes (use -Service: backend ou frontend)" -ForegroundColor White
        Write-Host ""
        Write-Host "Exemplos de Uso:" -ForegroundColor Yellow
        Write-Host "  .\scripts\docker-dev.ps1 start" -ForegroundColor Gray
        Write-Host "  .\scripts\docker-dev.ps1 status" -ForegroundColor Gray
        Write-Host "  .\scripts\docker-dev.ps1 logs -Service frontend" -ForegroundColor Gray
        Write-Host "  .\scripts\docker-dev.ps1 shell -Service backend" -ForegroundColor Gray
        Write-Host "  .\scripts\docker-dev.ps1 migrate" -ForegroundColor Gray
        Write-Host "  .\scripts\docker-dev.ps1 test -Service backend" -ForegroundColor Gray
        Write-Host "  .\scripts\docker-dev.ps1 build -Service frontend" -ForegroundColor Gray
        Write-Host ""
    }
}
