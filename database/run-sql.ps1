# run-sql.ps1 — Exécute un fichier SQL en forçant l'encodage UTF-8
# Usage : .\database\run-sql.ps1 .\database\seed-data.sql
param([string]$SqlFile)
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
cmd /c "chcp 65001 > nul && `"$mysql`" -u root -proot --default-character-set=utf8mb4 < $SqlFile 2>NUL"
Write-Host "✅ $SqlFile exécuté avec succès (UTF-8)."
