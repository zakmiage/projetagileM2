/**
 * seed-prod.js
 * Injecte les données de test shifts et kanban dans gestion_assos (prod)
 * Usage: node scripts/seed-prod.js
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
  const seeds = [
    path.join(dbDir, 'seed-shifts.sql'),
    path.join(dbDir, 'seed-kanban.sql'),
  ];

  for (const file of seeds) {
    const sql = fs.readFileSync(file, 'utf8')
      .replace(/USE gestion_assos;/g, '');
    console.log(`Seeding: ${path.basename(file)}...`);
    try {
      await conn.query(sql);
      console.log(`  ✓ OK`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`  ⚠ Données déjà présentes (doublon ignoré).`);
      } else {
        console.error(`  ✗ Erreur:`, err.message);
      }
    }
  }

  await conn.end();
  console.log('\nSeed terminé sur gestion_assos.');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
