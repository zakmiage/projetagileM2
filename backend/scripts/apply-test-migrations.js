/**
 * apply-test-migrations.js
 * Applique les migrations shifts et kanban sur gestion_assos_test
 * Usage: node scripts/apply-test-migrations.js
 */
process.env.NODE_ENV = 'test';

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gestion_assos_test',
    multipleStatements: true
  });

  const dbDir = path.join(__dirname, '..', '..', 'database');
  const migrations = [
    path.join(dbDir, 'migration_shifts.sql'),
    path.join(dbDir, 'migration_kanban.sql'),
  ];

  for (const file of migrations) {
    const sql = fs.readFileSync(file, 'utf8')
      .replace(/USE gestion_assos;/g, ''); // Utilise la DB déjà sélectionnée
    console.log(`Applying: ${path.basename(file)}...`);
    try {
      await conn.query(sql);
      console.log(`  ✓ OK`);
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`  ⚠ Tables déjà existantes, ignoré.`);
      } else {
        console.error(`  ✗ Erreur:`, err.message);
      }
    }
  }

  await conn.end();
  console.log('\nMigrations terminées sur gestion_assos_test.');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
