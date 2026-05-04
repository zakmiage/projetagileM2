# run-sql.ps1 — Exécute un fichier SQL en forçant l'encodage UTF-8
# Usage : .\database\run-sql.ps1 .\database\seed-data.sql
param([string]$SqlFile)
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
& $mysql -u root -proot --default-character-set=utf8mb4 gestion_assos "--execute=source $SqlFile"
Write-Host "✅ $SqlFile exécuté avec succès (UTF-8)."
