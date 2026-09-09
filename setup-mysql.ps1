# One-time MySQL setup for the GPGD IT Professional Certification Programme.
# Must be run from an elevated (Administrator) PowerShell window.
#
# This version verifies every step instead of assuming it worked, and makes
# sure no leftover mysqld.exe process is left running against the data files
# at any point (which is what caused earlier attempts to silently fail).

$projectRoot  = $PSScriptRoot
$mysqldPath   = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
$mysqlPath    = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$defaultsFile = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
$schemaPath   = Join-Path $projectRoot "api\schema.sql"
$configPath   = Join-Path $projectRoot "api\config.php"
$initFile     = Join-Path $env:TEMP "gpgd_mysql_init.sql"

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
    Write-Error "Please re-run this script from an elevated (Administrator) PowerShell window."
    exit 1
}

function Wait-NoMysqldProcesses {
    param([int]$maxTries = 10)
    for ($i = 1; $i -le $maxTries; $i++) {
        Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        $remaining = Get-Process mysqld -ErrorAction SilentlyContinue
        if (-not $remaining) { return $true }
    }
    return -not (Get-Process mysqld -ErrorAction SilentlyContinue)
}

function Test-DbLogin($username, $password) {
    $result = & $mysqlPath -u $username "-p$password" -N -e "SELECT 1;" 2>&1
    return ($LASTEXITCODE -eq 0)
}

Write-Host "Step 1: Making sure no MySQL process is left running from a previous attempt..."
Stop-Service MySQL80 -ErrorAction SilentlyContinue
if (-not (Wait-NoMysqldProcesses)) {
    Write-Error "Could not clear existing mysqld processes. Open Task Manager, end any 'mysqld.exe' processes manually, then re-run this script."
    exit 1
}
Write-Host "  OK: no mysqld processes running."

$appPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })

# mysqld's --init-file reader has trouble with some multi-line statements
# (observed: multi-row INSERT ... VALUES split across lines breaks it, even
# though multi-line CREATE TABLE is fine). Flatten every statement to a
# single physical line to sidestep this entirely, regardless of the exact
# cause: drop comment-only/blank lines, then join everything with spaces.
$schemaLines = Get-Content $schemaPath | Where-Object { $_.Trim() -ne '' -and $_.Trim() -notmatch '^--' }
$schemaSql = ($schemaLines -join ' ')

$userSql = @"

CREATE USER IF NOT EXISTS 'gpgd_app'@'localhost' IDENTIFIED BY '$appPassword';
ALTER USER 'gpgd_app'@'localhost' IDENTIFIED BY '$appPassword';
GRANT ALL PRIVILEGES ON gpgd_it_program.* TO 'gpgd_app'@'localhost';
FLUSH PRIVILEGES;
"@
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($initFile, ($schemaSql + $userSql), $utf8NoBom)

Write-Host "Step 2: Starting a temporary MySQL instance to apply the schema and create the app user..."
Start-Process -FilePath $mysqldPath `
    -ArgumentList "--defaults-file=`"$defaultsFile`"", "--init-file=`"$initFile`"" `
    -WindowStyle Hidden
Start-Sleep -Seconds 12

Write-Host "Step 3: Verifying the new login actually works, before touching the service..."
$loginWorks = Test-DbLogin -username "gpgd_app" -password $appPassword

if (-not $loginWorks) {
    Write-Host ""
    Write-Host "FAILED: the new gpgd_app login does not work against the temporary instance." -ForegroundColor Red
    Write-Host "Recent MySQL error log:" -ForegroundColor Yellow
    Get-Content "C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err" -Tail 40
    Write-Host ""
    Write-Host "Leaving the temporary instance running for diagnosis. It is NOT the normal service." -ForegroundColor Yellow
    exit 1
}

Write-Host "  OK: gpgd_app login confirmed working."
Remove-Item $initFile -Force -ErrorAction SilentlyContinue

Write-Host "Step 4: Stopping the temporary instance..."
if (-not (Wait-NoMysqldProcesses)) {
    Write-Error "Could not stop the temporary mysqld instance cleanly. Open Task Manager, end any 'mysqld.exe' processes manually, then run: Start-Service MySQL80"
    exit 1
}
Write-Host "  OK: temporary instance stopped, no mysqld processes running."

Write-Host "Step 5: Starting the normal MySQL80 service..."
$restarted = $false
for ($attempt = 1; $attempt -le 3 -and -not $restarted; $attempt++) {
    try {
        Start-Service MySQL80 -ErrorAction Stop
        $restarted = $true
    } catch {
        Write-Host "  Attempt $attempt failed, retrying..."
        Start-Sleep -Seconds 5
    }
}
Start-Sleep -Seconds 3

Write-Host "Step 6: Verifying the login again, this time against the real service..."
$finalLoginWorks = Test-DbLogin -username "gpgd_app" -password $appPassword
$serviceStatus = (Get-Service MySQL80).Status

$configContent = @"
<?php
// Database connection settings for the GPGD IT Professional Certification Programme.
// This app connects as a dedicated 'gpgd_app' user scoped only to the
// gpgd_it_program database (not root), generated by setup-mysql.ps1.

return [
    'host'     => getenv('DB_HOST') ?: 'localhost',
    'port'     => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_NAME') ?: 'gpgd_it_program',
    'username' => getenv('DB_USER') ?: 'gpgd_app',
    'password' => getenv('DB_PASSWORD') ?: '$appPassword',
];
"@
[System.IO.File]::WriteAllText($configPath, $configContent, $utf8NoBom)

Write-Host ""
if ($serviceStatus -eq 'Running' -and $finalLoginWorks) {
    Write-Host "SUCCESS: MySQL80 is running, gpgd_app login verified, api/config.php updated." -ForegroundColor Green
} else {
    Write-Host "Service status: $serviceStatus | Login verified: $finalLoginWorks" -ForegroundColor Yellow
    Write-Host "api/config.php was still updated with the current password." -ForegroundColor Yellow
}
