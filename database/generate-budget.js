/**
 * generate-budget.js — Génère seed-budget.sql
 * Usage : node database/generate-budget.js
 */
const fs = require('fs');
const path = require('path');

// ─── budget_lines ──────────────────────────────────────────────────────────
// (event_id, type, category, label, forecast, actual, fsdie, status, created_by)
const lines = [
  // ── EVENT 1 : Gala 2024 — tout réel, budget riche, statuts variés ──
  [1,'EXPENSE','Logistique',   'Location salle des fêtes',  2536.00, 2536.00, 1,'APPROUVE',1],
  [1,'EXPENSE','Logistique',   'Transport (navettes)',       1078.00, 1120.00, 1,'APPROUVE',1],
  [1,'EXPENSE','Nourriture',   'Traiteur VIP',               1500.00, 1450.00, 1,'APPROUVE',1],
  [1,'EXPENSE','Animations',   'DJ & sono',                   975.00,  975.00, 0,'APPROUVE',1],
  [1,'EXPENSE','Communication','Flyers & affiches',            150.00,  132.50, 0,'APPROUVE',1],
  [1,'EXPENSE','Logistique',   'Sécurité (2 agents)',          400.00,  400.00, 1,'SOUMIS',  1],
  [1,'REVENUE','Billetterie',  'Vente billets (476 pax)',     5900.00, 5200.00, 0,'APPROUVE',1],
  [1,'REVENUE','Financements', 'Subvention BDE',              1000.00, 1000.00, 0,'APPROUVE',1],

  // ── EVENT 2 : WEI 2025 — tout réel, riche, beaucoup de lignes et justificatifs ──
  [2,'EXPENSE','Logistique',            'Privatisation Domaine',      12500.00, 12500.00, 1,'APPROUVE',1],
  [2,'EXPENSE','Logistique',            'Transport (4 cars A/R)',      4800.00,  4750.00, 1,'APPROUVE',1],
  [2,'EXPENSE','Logistique',            'Location sono & lumières',    1200.00,  1200.00, 1,'APPROUVE',1],
  [2,'EXPENSE','Logistique',            'Location Tentes & Barnums',    850.00,   850.00, 1,'APPROUVE',1],
  [2,'EXPENSE','Logistique',            'Secouristes (Croix Rouge)',    950.00,   950.00, 1,'APPROUVE',1],
  [2,'EXPENSE','Logistique',            'Assurance RC Événement',       320.00,   320.00, 1,'APPROUVE',1],
  [2,'EXPENSE','Nourriture et boissons','Traiteur repas (3 jours)',    5400.00,  5500.00, 1,'APPROUVE',1],
  [2,'EXPENSE','Nourriture et boissons','Boissons softs & eaux',        800.00,   825.50, 1,'APPROUVE',1],
  [2,'EXPENSE','Nourriture et boissons','Bière (20 fûts + tireuse)',   2100.00,  2100.00, 0,'APPROUVE',1],
  [2,'EXPENSE','Nourriture et boissons','Petit-déjeuner géant',         650.00,   610.20, 1,'APPROUVE',1],
  [2,'EXPENSE','Animations',            'DJ Guest Samedi Soir',        1500.00,  1500.00, 0,'APPROUVE',1],
  [2,'EXPENSE','Animations',            'Location Taureau Mécanique',   600.00,   600.00, 0,'APPROUVE',1],
  [2,'EXPENSE','Animations',            'Matériel Olympiades',          450.00,   485.00, 1,'APPROUVE',1],
  [2,'EXPENSE','Communication',         'T-shirts staff & goodies',    1200.00,  1230.00, 0,'APPROUVE',1],
  [2,'EXPENSE','Communication',         'Bracelets festival',           150.00,   150.00, 0,'APPROUVE',1],
  [2,'EXPENSE','Logistique',            'Location Camionnette BDE',     350.00,   350.00, 1,'APPROUVE',1],
  [2,'REVENUE','Billetterie',           'Cotisations (150 pax)',      22500.00, 22500.00, 0,'APPROUVE',1],
  [2,'REVENUE','Financements',          'Subvention FSDIE',            4500.00,  4500.00, 0,'APPROUVE',1],
  [2,'REVENUE','Financements',          'Sponsoring Société Générale', 1000.00,  1000.00, 0,'APPROUVE',1],
  [2,'REVENUE','Financements',          'Subvention BDE MIAGE',        1500.00,  1500.00, 0,'APPROUVE',1],

  // ── EVENT 3 : WES 2024 — partiellement justifié ──
  [3,'EXPENSE','Logistique',  'Gîte de groupe',           1200.00, 1180.00, 1,'APPROUVE',1],
  [3,'EXPENSE','Logistique',  'Covoiturage & essence',     220.00,  235.00, 1,'APPROUVE',1],
  [3,'EXPENSE','Animations',  'Activité accrobranche',     320.00,  320.00, 1,'SOUMIS',  1],
  [3,'EXPENSE','Nourriture',  'Courses alimentaires',      410.00,  398.00, 1,'SOUMIS',  1],
  [3,'EXPENSE','Logistique',  'Matériel de soirée',         80.00,   65.00, 0,'APPROUVE',1],
  [3,'REVENUE','Billetterie', 'Cotisations (22 pax)',       880.00,  880.00, 0,'APPROUVE',1],
  [3,'REVENUE','Financements','FSDIE reçu',               1200.00, 1200.00, 0,'APPROUVE',1],

  // ── EVENT 4 : Saint-Valentin 2025 — simple, tout ok ──
  [4,'EXPENSE','Logistique',  'Sono & micro',              200.00,  195.00, 1,'APPROUVE',1],
  [4,'EXPENSE','Nourriture',  'Snacks & boissons',         150.00,  162.00, 0,'APPROUVE',1],
  [4,'EXPENSE','Animations',  'Supports blind test',        30.00,   28.00, 0,'APPROUVE',1],
  [4,'EXPENSE','Communication','Décorations Saint-Valentin', 60.00,   55.00, 0,'SOUMIS',  1],
  [4,'REVENUE','Billetterie', 'Entrées (15 × 5€)',          75.00,   75.00, 0,'APPROUVE',1],

  // ── EVENT 5 : Tournoi 2025 — budget minimal ──
  [5,'EXPENSE','Logistique',  'Réservation gymnase',        80.00,   80.00, 1,'APPROUVE',1],
  [5,'EXPENSE','Nourriture',  'Collations & eau',           60.00,   55.00, 0,'APPROUVE',1],
  [5,'EXPENSE','Animations',  'Trophées & médailles',       45.00,   48.00, 0,'APPROUVE',1],
  [5,'EXPENSE','Communication','Affiches tournoi',           20.00,   18.00, 0,'SOUMIS',  1],
  [5,'REVENUE','Billetterie', 'Inscriptions (20 × 5€)',    100.00,  100.00, 0,'APPROUVE',1],

  // ── EVENT 6 : WEI 2026 — prévisionnel uniquement ──
  [6,'EXPENSE','Logistique',            'Domaine privatisé',        2800.00, null, 1,'SOUMIS',1],
  [6,'EXPENSE','Logistique',            'Transport (2 bus)',         1200.00, null, 1,'SOUMIS',1],
  [6,'EXPENSE','Logistique',            'Protection civile',          900.00, null, 1,'SOUMIS',1],
  [6,'EXPENSE','Nourriture et boissons','Repas & petit-dej',          850.00, null, 1,'SOUMIS',1],
  [6,'EXPENSE','Animations',            'DJ & animations',           1050.00, null, 1,'SOUMIS',1],
  [6,'EXPENSE','Communication',         'Goodies & tote-bags',        200.00, null, 0,'SOUMIS',1],
  [6,'REVENUE','Billetterie',           'Cotisations (120 pax)',     4800.00, null, 0,'SOUMIS',1],
  [6,'REVENUE','Financements',          'FSDIE sollicité',           2000.00, null, 0,'SOUMIS',1],
  [6,'REVENUE','Financements',          'UF MIAGE (demandé)',          900.00, null, 0,'SOUMIS',1],

  // ── EVENT 7 : Gala 2026 — quelques acomptes versés ──
  [7,'EXPENSE','Logistique',   'Location salle prestige',  3200.00, 1600.00, 1,'SOUMIS',1],
  [7,'EXPENSE','Logistique',   'Transport VIP',            1100.00,    null, 1,'SOUMIS',1],
  [7,'EXPENSE','Nourriture',   'Traiteur gastronomique',   2000.00,    null, 1,'SOUMIS',1],
  [7,'EXPENSE','Animations',   'DJ + light show',          1200.00,    null, 0,'SOUMIS',1],
  [7,'EXPENSE','Communication','Flyers & billets imprimés',  180.00,    null, 0,'SOUMIS',1],
  [7,'REVENUE','Billetterie',  'Ventes prévisionnelles',   6000.00,    null, 0,'SOUMIS',1],
  [7,'REVENUE','Financements', 'FSDIE (dossier en cours)', 2000.00,    null, 0,'SOUMIS',1],

  // ── EVENT 8 : Ski 2027 — budget esquissé ──
  [8,'EXPENSE','Logistique',  'Hébergement (chalet)',      2400.00, null, 1,'SOUMIS',1],
  [8,'EXPENSE','Logistique',  'Forfaits ski (40 pax)',     3600.00, null, 1,'SOUMIS',1],
  [8,'EXPENSE','Logistique',  'Location de matériel',       800.00, null, 1,'SOUMIS',1],
  [8,'EXPENSE','Logistique',  'Navette aller-retour',       600.00, null, 1,'SOUMIS',1],
  [8,'EXPENSE','Nourriture',  'Repas sur place',            960.00, null, 0,'SOUMIS',1],
  [8,'REVENUE','Billetterie', 'Cotisations (40 × 195€)',  7800.00, null, 0,'SOUMIS',1],
  [8,'REVENUE','Financements','Aide FSDIE envisagée',      2000.00, null, 0,'SOUMIS',1],
];

// ─── budget_attachments ────────────────────────────────────────────────────
// Référence les IDs de budget_lines par position (1-indexed après TRUNCATE)
// Event 1 : lignes 1-8 → FSDIE = ids 1,2,3,6  → justif sur 1,2,3 (pas 6=SOUMIS sans fichier)
// Event 2 : lignes 9-28 → FSDIE = plein  → on va les justifier pour que ce soit clean
// Event 3 : lignes 20-26 → FSDIE = 20,21,22,23 → justif sur 20,21 seulement
// Event 4 : lignes 27-31 → FSDIE = 27 → justif ok
// Event 5 : lignes 32-36 → FSDIE = 32 → justif ok
const attachments = [
  [1, 'facture_salle_gala2024.pdf',     'uploads/budget/facture_salle_gala2024.pdf'],
  [2, 'facture_transport_gala2024.pdf', 'uploads/budget/facture_transport_gala2024.pdf'],
  [3, 'facture_traiteur_gala2024.pdf',  'uploads/budget/facture_traiteur_gala2024.pdf'],

  // WEI 2025 (Les dépenses logistiques et nourriture FSDIE)
  // Indices dans lines[] : 9 à 28. (1-indexed). Les 8 premiers sont event 1.
  // 9: Privatisation, 10: Cars, 11: Sono, 12: Tentes, 13: Secouristes, 14: Assurance, 15: Traiteur, 16: Softs, 18: Dej, 21: Olympiades, 24: Camionnette
  [9,  'facture_domaine_wei2025.pdf',       'uploads/budget/facture_domaine_wei2025.pdf'],
  [10, 'facture_cars_wei2025.pdf',          'uploads/budget/facture_cars_wei2025.pdf'],
  [11, 'facture_sono_wei2025.pdf',          'uploads/budget/facture_sono_wei2025.pdf'],
  [12, 'facture_tentes_wei2025.pdf',        'uploads/budget/facture_tentes_wei2025.pdf'],
  [13, 'facture_croix_rouge.pdf',           'uploads/budget/facture_croix_rouge.pdf'],
  [14, 'attestation_assurance_rc.pdf',      'uploads/budget/attestation_assurance_rc.pdf'],
  [15, 'facture_traiteur_wei2025.pdf',      'uploads/budget/facture_traiteur_wei2025.pdf'],
  [16, 'ticket_caisse_metro.pdf',           'uploads/budget/ticket_caisse_metro.pdf'],
  [18, 'facture_boulangerie_dej.pdf',       'uploads/budget/facture_boulangerie_dej.pdf'],
  [21, 'facture_decathlon_olympiades.pdf',  'uploads/budget/facture_decathlon_olympiades.pdf'],
  [24, 'facture_location_camion_superu.pdf','uploads/budget/facture_location_camion_superu.pdf'],
  // WES 2024 (FSDIE lines 29,30,31,32 — justif sur 29 et 30 seulement)
  [29,'facture_gite_wes2024.pdf',       'uploads/budget/facture_gite_wes2024.pdf'],
  [30,'justif_covoiturage_wes2024.pdf', 'uploads/budget/justif_covoiturage_wes2024.pdf'],
  // Saint-Valentin (FSDIE line 36)
  [36,'facture_sono_valentin2025.pdf',  'uploads/budget/facture_sono_valentin2025.pdf'],
  // Tournoi (FSDIE line 41)
  [41,'facture_gymnase_tournoi2025.pdf','uploads/budget/facture_gymnase_tournoi2025.pdf'],
];

// ─── member_attachments ────────────────────────────────────────────────────
// (member_id, document_type, file_name, file_path)
const memberAttachments = [
  [1, 'CERTIFICATE',      'certificat_alice_martin.pdf',   'uploads/members/certificat_alice_martin.pdf'],
  [1, 'WAIVER',           'decharge_alice_martin.pdf',     'uploads/members/decharge_alice_martin.pdf'],
  [2, 'CERTIFICATE',      'certificat_baptiste_moreau.pdf','uploads/members/certificat_baptiste_moreau.pdf'],
  [4, 'CERTIFICATE',      'certificat_david_thomas.pdf',   'uploads/members/certificat_david_thomas.pdf'],
  [4, 'WAIVER',           'decharge_david_thomas.pdf',     'uploads/members/decharge_david_thomas.pdf'],
  [5, 'CERTIFICATE',      'certificat_emma_laurent.pdf',   'uploads/members/certificat_emma_laurent.pdf'],
  [5, 'WAIVER',           'decharge_emma_laurent.pdf',     'uploads/members/decharge_emma_laurent.pdf'],
  [7, 'CERTIFICATE',      'certificat_gaelle_simon.pdf',   'uploads/members/certificat_gaelle_simon.pdf'],
  [7, 'WAIVER',           'decharge_gaelle_simon.pdf',     'uploads/members/decharge_gaelle_simon.pdf'],
  [9, 'CERTIFICATE',      'certificat_ines_garcia.pdf',    'uploads/members/certificat_ines_garcia.pdf'],
  [9, 'WAIVER',           'decharge_ines_garcia.pdf',      'uploads/members/decharge_ines_garcia.pdf'],
  [9, 'PARENTAL_CONSENT', 'autorisation_ines_garcia.pdf',  'uploads/members/autorisation_ines_garcia.pdf'],
  [12,'CERTIFICATE',      'certificat_lucie_petit.pdf',    'uploads/members/certificat_lucie_petit.pdf'],
  [12,'WAIVER',           'decharge_lucie_petit.pdf',      'uploads/members/decharge_lucie_petit.pdf'],
];

// ─── Build SQL ─────────────────────────────────────────────────────────────
let sql = `-- =============================================================================
-- seed-budget.sql (généré par generate-budget.js)
-- ÉTAPE 3 : Budget + Justificatifs + Pièces jointes membres
-- =============================================================================
USE gestion_assos;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE budget_attachments;
TRUNCATE TABLE budget_lines;
TRUNCATE TABLE member_attachments;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- BUDGET LINES
-- =============================================================================
INSERT INTO budget_lines
  (event_id, type, category, label, forecast_amount, actual_amount,
   is_fsdie_eligible, validation_status, created_by)
VALUES\n`;

sql += lines.map(l => {
  const actual = l[6] === null ? 'NULL' : l[6].toFixed(2);
  return `(${l[0]},'${l[1]}','${l[2]}','${l[3]}',${l[4].toFixed(2)},${actual},${l[6] !== null ? l[5] : l[5]},'${l[7]}',${l[8]})`;
}).join(',\n') + ';\n\n';

// Fix: actual is index 6, fsdie is index 6... let me recheck
// Line structure: [event_id, type, category, label, forecast, actual, fsdie, status, created_by]
//                   0        1      2         3       4        5      6      7       8

sql = `-- =============================================================================
-- seed-budget.sql (généré par generate-budget.js)
-- ÉTAPE 3 : Budget + Justificatifs + Pièces jointes membres
-- =============================================================================
USE gestion_assos;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE budget_attachments;
TRUNCATE TABLE budget_lines;
TRUNCATE TABLE member_attachments;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- BUDGET LINES
-- =============================================================================
INSERT INTO budget_lines
  (event_id, type, category, label, forecast_amount, actual_amount,
   is_fsdie_eligible, validation_status, created_by)
VALUES\n`;

sql += lines.map(l => {
  const [eid, type, cat, label, forecast, actual, fsdie, status, cby] = l;
  const actualSql = actual === null ? 'NULL' : actual.toFixed(2);
  return `(${eid},'${type}','${cat}','${label}',${forecast.toFixed(2)},${actualSql},${fsdie},'${status}',${cby})`;
}).join(',\n') + ';\n\n';

sql += `-- =============================================================================
-- BUDGET ATTACHMENTS (justificatifs FSDIE)
-- =============================================================================
INSERT INTO budget_attachments (budget_line_id, file_name, file_path) VALUES\n`;
sql += attachments.map(a => `(${a[0]},'${a[1]}','${a[2]}')`).join(',\n') + ';\n\n';

sql += `-- =============================================================================
-- MEMBER ATTACHMENTS (pièces jointes adhérents)
-- =============================================================================
INSERT INTO member_attachments (member_id, document_type, file_name, file_path) VALUES\n`;
sql += memberAttachments.map(a => `(${a[0]},'${a[1]}','${a[2]}','${a[3]}')`).join(',\n') + ';\n';

const outPath = path.join(__dirname, 'seed-budget.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`✅ ${outPath} généré (${lines.length} lignes budget, ${attachments.length} justificatifs, ${memberAttachments.length} pièces membres).`);
