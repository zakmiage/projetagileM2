/**
 * apply-prod-migrations.js
 * Applique les migrations shifts et kanban sur gestion_assos (prod)
 * Usage: node scripts/apply-prod-migrations.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestion_assos',
    multipleStatements: true
  });

  console.log(`Connected to: ${process.env.DB_NAME || 'gestion_assos'}`);

  const dbDir = path.join(__dirname, '..', '..', 'database');
  const migrations = [
    path.join(dbDir, 'migration_shifts.sql'),
    path.join(dbDir, 'migration_kanban.sql'),
  ];

  for (const file of migrations) {
    const sql = fs.readFileSync(file, 'utf8')
      .replace(/USE gestion_assos;/g, '');
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
  console.log('\nMigrations terminées sur la BDD de production.');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
