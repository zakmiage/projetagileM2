# reset-db.ps1 - Regenere et recharge toute la BDD de zero
# Usage : .\database\reset-db.ps1
param()

$db = $PSScriptRoot

Write-Host ""
Write-Host ">> Generation des seeds JS..."
node "$db\generate-participants.js"
node "$db\generate-budget.js"

Write-Host ""
Write-Host ">> Chargement MySQL..."
& "$db\run-sql.ps1" "$db\init.sql"
& "$db\run-sql.ps1" "$db\seed-data.sql"
& "$db\run-sql.ps1" "$db\seed-participants.sql"
& "$db\run-sql.ps1" "$db\seed-budget.sql"

Write-Host ""
Write-Host ">> Termine."
Write-Host ""
