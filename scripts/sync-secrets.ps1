# Sync .env to GitHub Secrets
$env:Path += ";C:\Program Files\GitHub CLI\"

if (!(Test-Path ".env")) { Write-Host "Arquivo .env nao encontrado"; exit 1 }

function Get-Val($k) { (Get-Content ".env" | Where-Object { $_ -match "^$k=" }) -replace "^$k=", "" -replace '"', '' }

$vars = @("APP_KEY","JWT_SECRET","DB_HOST","DB_DATABASE","DB_USERNAME","DB_PASSWORD","CLOUDINARY_URL","CLOUDINARY_CLOUD_NAME","CLOUDINARY_API_KEY","CLOUDINARY_API_SECRET","APP_NAME","APP_ENV","APP_DEBUG","DB_PORT","CLOUD_SQL_CONNECTION_NAME")

$c = 0
foreach ($v in $vars) {
    $val = Get-Val $v
    if ($val) {
        Write-Host "Creating $v..."
        $val | gh secret set $v
        $c++
    }
}

Write-Host "`n$c secrets criados!"
