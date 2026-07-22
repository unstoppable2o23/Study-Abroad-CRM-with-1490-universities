param(
  [string]$BackupFile,
  [string]$Database = "study_abroad_crm",
  [string]$User = "postgres"
)

if (-not (Test-Path $BackupFile)) {
  Write-Host "Backup file not found: $BackupFile" -ForegroundColor Red
  exit 1
}

$inputFile = $BackupFile
if ($BackupFile -match '\.gz$') {
  Write-Host "Decompressing $BackupFile ..."
  $inputFile = [System.IO.Path]::GetTempFileName()
  & gzip -d -c $BackupFile > $inputFile
}

Write-Host "Restoring $Database from $inputFile ..."
$env:PGPASSWORD = $env:POSTGRES_PASSWORD
& pg_restore -U $User -h localhost -d $Database -c $inputFile

if ($LASTEXITCODE -eq 0) {
  Write-Host "Restore completed successfully"
} else {
  Write-Host "Restore failed!" -ForegroundColor Red
  exit 1
}
