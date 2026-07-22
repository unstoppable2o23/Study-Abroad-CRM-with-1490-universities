param(
  [string]$Database = "study_abroad_crm",
  [string]$User = "postgres",
  [string]$OutputDir = "./backups"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$filename = "$Database-$timestamp.sql"
$outputPath = Join-Path $OutputDir $filename

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "Backing up $Database to $outputPath ..."
$env:PGPASSWORD = $env:POSTGRES_PASSWORD
& pg_dump -U $User -h localhost -d $Database -F c -f $outputPath

if ($LASTEXITCODE -eq 0) {
  Write-Host "Backup completed: $outputPath"
  # Compress
  & gzip $outputPath
  Write-Host "Compressed: $outputPath.gz"
} else {
  Write-Host "Backup failed!" -ForegroundColor Red
  exit 1
}
