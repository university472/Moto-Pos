# scripts/backup.ps1
# Windows PowerShell MongoDB backup script.
# Schedule via Task Scheduler: run nightly at 11 PM.
#
# To schedule:
#   1. Open Task Scheduler
#   2. Create Basic Task → "Moto POS Backup"
#   3. Trigger: Daily at 11:00 PM
#   4. Action: Start Program → powershell.exe
#      Arguments: -File "C:\moto-pos\scripts\backup.ps1"

$DbName = "moto-pos"
$BackupDir = "$PSScriptRoot\..\backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupPath = "$BackupDir\backup_$Timestamp"
$MongoUri = mongodb://ujavaid472_db_user:umerjavaid@ac-apya2pu-shard-00-00.aixa6po.mongodb.net:27017,ac-apya2pu-shard-00-01.aixa6po.mongodb.net:27017,ac-apya2pu-shard-00-02.aixa6po.mongodb.net:27017/?ssl=true&replicaSet=atlas-nx71dd-shard-0&authSource=admin&appName=Cluster0

Write-Host "──────────────────────────────────────" -ForegroundColor Cyan
Write-Host " Moto POS — MongoDB Backup" -ForegroundColor Cyan
Write-Host " Timestamp: $Timestamp" -ForegroundColor Cyan
Write-Host "──────────────────────────────────────" -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

# Run mongodump
mongodump `
  --uri="$MongoUri" `
  --db="$DbName" `
  --out="$BackupPath" `
  --gzip

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅  Backup created: $BackupPath" -ForegroundColor Green

    # Compress to zip
    Compress-Archive -Path "$BackupPath\*" -DestinationPath "$BackupDir\backup_$Timestamp.zip" -Force
    Remove-Item -Recurse -Force $BackupPath

    Write-Host "✅  Compressed: $BackupDir\backup_$Timestamp.zip" -ForegroundColor Green

    # Keep only last 30 backups
    $backups = Get-ChildItem "$BackupDir\backup_*.zip" | Sort-Object LastWriteTime -Descending
    if ($backups.Count -gt 30) {
        $backups | Select-Object -Skip 30 | Remove-Item -Force
        Write-Host "✅  Cleanup: kept last 30 backups" -ForegroundColor Green
    }

    Write-Host "──────────────────────────────────────" -ForegroundColor Cyan
    Write-Host " Backup complete!" -ForegroundColor Green
    Write-Host "──────────────────────────────────────" -ForegroundColor Cyan
} else {
    Write-Host "❌  Backup FAILED — check MongoDB is running" -ForegroundColor Red
    exit 1
}