/**
 * setup-test-data.js
 * ─────────────────────────────────────────────────────────────────
 * Script tout-en-un pour injecter les données de test complètes.
 * Utilisable directement par une IA ou un développeur.
 *
 * Usage : cd backend && node scripts/setup-test-data.js
 * ─────────────────────────────────────────────────────────────────
 * Ce script :
 *  1. Remet à zéro les tables dans l'ordre des FK
 *  2. Insère les données via les fichiers SQL dans database/
 *  3. Lance seed-prod.js pour les lignes budget
 *  4. Affiche un résumé des comptages finaux
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql  = require('mysql2/promise');
const fs     = require('fs');
const path   = require('path');
const { execSync } = require('child_process');

const DB_CFG = {
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'gestion_assos',
  multipleStatements: true,
};

const DB_DIR  = path.join(__dirname, '..', '..', 'database');
const LOG     = (msg) => console.log(`  ${msg}`);
const OK      = (msg) => console.log(`  ✓ ${msg}`);
const WARN    = (msg) => console.log(`  ⚠ ${msg}`);
const SECTION = (msg) => console.log(`\n${'═'.repeat(60)}\n  ${msg}\n${'─'.repeat(60)}`);

async function runSqlFile(filename) {
  const filePath = path.join(DB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    WARN(`Fichier introuvable, ignoré : ${filename}`);
    return;
  }

  // Ouvrir une connexion fraîche avec multipleStatements=true pour exécuter le SQL tel quel
  const c = await mysql.createConnection({ ...DB_CFG });
  try {
    await c.query('SET FOREIGN_KEY_CHECKS = 0');
    const sql = fs.readFileSync(filePath, 'utf8');
    await c.query(sql);
    await c.query('SET FOREIGN_KEY_CHECKS = 1');
    OK(`${filename} exécuté`);
  } catch (e) {
    WARN(`${filename} — ${e.message.split('\n')[0]}`);
  } finally {
    await c.end();
  }
}

async function count(conn, table) {
  try {
    const [[row]] = await conn.execute(`SELECT COUNT(*) AS n FROM \`${table}\``);
    return row.n;
  } catch { return '(table manquante)'; }
}

async function main() {
  console.log('\n🚀 KUBIK — Setup données de test complètes\n');

  let conn;
  try {
    conn = await mysql.createConnection(DB_CFG);
    OK(`Connecté à ${DB_CFG.database}@${DB_CFG.host}`);

    // ── 1. RESET ─────────────────────────────────────────────────
    SECTION('ÉTAPE 1/4 — Remise à zéro des tables');

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'budget_attachments', 'budget_lines',
      'shift_registrations', 'shifts',
      'kanban_card_members', 'kanban_cards', 'kanban_columns',
      'event_participants',
      'member_attachments', 'members',
      'events', 'users',
    ];
    for (const t of tables) {
      try {
        await conn.query(`TRUNCATE TABLE \`${t}\``);
        LOG(`TRUNCATE ${t}`);
      } catch (e) {
        WARN(`Table ${t} introuvable — ignorée`);
      }
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    OK('Reset terminé');

    // ── 2. SEEDS SQL ──────────────────────────────────────────────
    SECTION('ÉTAPE 2/4 — Injection des seeds SQL');

    const seeds = [
      'seed-data.sql',          // Users + Events de base
      'seed-members.sql',        // 47 membres fictifs
      'seed-participants.sql',   // ~180 inscriptions
      'seed-budget.sql',         // Lignes budget EXPENSE + REVENUE
      'seed-kanban.sql',         // Colonnes + cartes Kanban
      'seed-shifts.sql',         // 68 créneaux de planning
    ];
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const seed of seeds) {
      await runSqlFile(seed);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // ── 3. MIGRATIONS (idempotentes) ──────────────────────────────
    SECTION('ÉTAPE 3/4 — Vérification des migrations');

    const migrations = [
      'migration_kanban.sql',
      'migration_shifts.sql',
      'migration_validation_status.sql',
    ];
    for (const mig of migrations) {
      const filePath = path.join(DB_DIR, mig);
      if (fs.existsSync(filePath)) {
        try {
          const sql = fs.readFileSync(filePath, 'utf8');
          await conn.query(sql);
          OK(`Migration ${mig} appliquée`);
        } catch (e) {
          // Migrations idempotentes → erreurs "already exists" ignorées
          WARN(`${mig} ignorée (déjà appliquée ou erreur : ${e.message.split('\n')[0]})`);
        }
      }
    }

    // ── 4. LIGNES BUDGET SUPPLÉMENTAIRES ─────────────────────────
    SECTION('ÉTAPE 4/4 — Vérification des données budget');
    const [budgetCount] = await conn.execute('SELECT COUNT(*) AS n FROM budget_lines');
    const [eventCount]  = await conn.execute('SELECT COUNT(*) AS n FROM events');
    OK(`${eventCount[0].n} événement(s) — ${budgetCount[0].n} ligne(s) de budget en BDD`);

    // ── 5. RÉSUMÉ ─────────────────────────────────────────────────
    SECTION('RÉSUMÉ — Comptages finaux');

    const summary = [
      ['users',               'Utilisateurs (comptes)'],
      ['members',             'Membres association'],
      ['events',              'Événements'],
      ['event_participants',  'Inscriptions événements'],
      ['budget_lines',        'Lignes de budget'],
      ['budget_attachments',  'Pièces jointes BDD'],
      ['kanban_columns',      'Colonnes Kanban'],
      ['kanban_cards',        'Cartes Kanban'],
      ['shifts',              'Créneaux de planning'],
    ];

    for (const [table, label] of summary) {
      const n = await count(conn, table);
      console.log(`  ${label.padEnd(32)} : ${n}`);
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`\n✅ Setup terminé ! Vous pouvez maintenant :`);
    console.log(`   • Lancer le backend   : cd backend && npm run dev`);
    console.log(`   • Lancer le frontend  : cd frontend && ng serve`);
    console.log(`   • Se connecter avec   : toto@mail.com / toto`);
    console.log(`\n   Pour les PJ PDF réalistes (factures) :`);
    console.log(`   python scripts/generate-fake-pj.py`);
    console.log(`   (prérequis : python -m pip install xhtml2pdf pymysql)\n`);

  } catch (err) {
    console.error('\n❌ Erreur :', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();
