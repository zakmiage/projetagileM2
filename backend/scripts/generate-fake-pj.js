/**
 * generate-fake-pj.js
 * Génère des PDF factices dans /uploads et insère les références en BDD
 * Usage: node scripts/generate-fake-pj.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── Fausses factures réalistes ────────────────────────────────────────────────
const FAKE_INVOICES = [
  // Gala KUBIK 2024 (event_id=1) — budget_line_ids à récupérer dynamiquement
  { event_id: 1, label: 'Salle Le Rooftop',     amount: 1200, vendor: 'Le Rooftop Bordeaux SAS',     date: '2024-11-15', category: 'Lieu' },
  { event_id: 1, label: 'Sono & Éclairage',      amount: 850,  vendor: 'AudioPro Sud-Ouest',          date: '2024-11-20', category: 'Technique' },
  { event_id: 1, label: 'Barman freelance x2',   amount: 320,  vendor: 'EventStaff Bordeaux',         date: '2024-12-01', category: 'Personnel' },
  { event_id: 1, label: 'Flyers 500 ex.',         amount: 95,   vendor: 'Imprimerie Printfast',        date: '2024-11-10', category: 'Communication' },
  // WEI 2024 (event_id=2)
  { event_id: 2, label: 'Domaine des Pins — hébergement 3 jours', amount: 3200, vendor: 'Domaine des Pins SARL', date: '2024-08-01', category: 'Hébergement' },
  { event_id: 2, label: 'Location minibus x2',   amount: 680,  vendor: 'Hertz Bordeaux Gare',         date: '2024-09-05', category: 'Transport' },
  { event_id: 2, label: 'Courses alimentaires',  amount: 420,  vendor: 'Métro Cash & Carry',          date: '2024-09-18', category: 'Alimentation' },
  // WES 2024 (event_id=3)
  { event_id: 3, label: 'Traiteur pauses café',  amount: 180,  vendor: 'Délices Traiteur',            date: '2024-10-25', category: 'Alimentation' },
  { event_id: 3, label: 'Impression supports',   amount: 65,   vendor: 'Imprimerie Printfast',        date: '2024-10-28', category: 'Communication' },
  // Saint-Valentin 2025 (event_id=4)
  { event_id: 4, label: 'Traiteur dîner 50 pers.',amount: 1500, vendor: 'Gascogne Traiteur',          date: '2025-01-20', category: 'Alimentation' },
  { event_id: 4, label: 'Fleurs & décoration',   amount: 180,  vendor: 'Fleurs de France Bordeaux',   date: '2025-02-10', category: 'Décoration' },
];

// ── Génère un PDF de facture réaliste ────────────────────────────────────────
function generateFakePDF(invoice, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // En-tête vendeur
    doc.fontSize(20).fillColor('#1e293b').text(invoice.vendor, { align: 'left' });
    doc.fontSize(9).fillColor('#64748b').text('N° SIRET : 123 456 789 00012 | TVA : FR12123456789');
    doc.text('12 Rue du Commerce — 33000 Bordeaux');
    doc.text(`contact@${invoice.vendor.toLowerCase().replace(/\s+/g, '')}.fr`);
    doc.moveDown(1.5);

    // Ligne séparatrice
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(0.5);

    // Infos facture
    const invoiceNum = `FAC-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    doc.fontSize(16).fillColor('#6366f1').text('FACTURE', { align: 'right' });
    doc.fontSize(10).fillColor('#1e293b');
    doc.text(`N° : ${invoiceNum}`, { align: 'right' });
    doc.text(`Date : ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.moveDown(1);

    // Destinataire
    doc.fontSize(10).fillColor('#64748b').text('Facturé à :');
    doc.fontSize(11).fillColor('#1e293b').text('Association KUBIK — BDE KEDGE Bordeaux');
    doc.fontSize(9).fillColor('#64748b').text('680 Cours de la Libération — 33405 Talence');
    doc.moveDown(1.5);

    // Tableau
    const tableTop = doc.y;
    doc.rect(50, tableTop, 495, 22).fillColor('#f8fafc').fill();
    doc.fillColor('#475569').fontSize(9)
      .text('Désignation', 55, tableTop + 6)
      .text('Qté', 350, tableTop + 6)
      .text('P.U. HT', 390, tableTop + 6)
      .text('Total HT', 460, tableTop + 6);

    const rowTop = tableTop + 26;
    doc.fillColor('#1e293b').fontSize(10)
      .text(invoice.label, 55, rowTop)
      .text('1', 350, rowTop)
      .text(`${invoice.amount.toFixed(2)} €`, 390, rowTop)
      .text(`${invoice.amount.toFixed(2)} €`, 460, rowTop);

    doc.moveDown(3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(0.5);

    // Totaux
    const tva = +(invoice.amount * 0.2).toFixed(2);
    const ttc = +(invoice.amount + tva).toFixed(2);
    doc.fontSize(9).fillColor('#64748b');
    doc.text(`Total HT : ${invoice.amount.toFixed(2)} €`, { align: 'right' });
    doc.text(`TVA 20% : ${tva.toFixed(2)} €`, { align: 'right' });
    doc.fontSize(12).fillColor('#1e293b').font('Helvetica-Bold');
    doc.text(`Total TTC : ${ttc.toFixed(2)} €`, { align: 'right' });

    // Pied de page
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica')
      .text('Règlement par virement sous 30 jours. Tout retard de paiement entraîne des pénalités.', 50, 760, { align: 'center' });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    multipleStatements: false
  });

  console.log(`\nConnected to ${process.env.DB_NAME}`);
  console.log('Generating fake invoices...\n');

  const [users] = await conn.execute('SELECT id FROM users LIMIT 1');
  const createdBy = users[0]?.id ?? 1;
  console.log(`Using user_id=${createdBy} as created_by\n`);

  for (const inv of FAKE_INVOICES) {
    // Trouver ou créer une ligne budget correspondante
    const [lines] = await conn.execute(
      `SELECT id FROM budget_lines WHERE event_id = ? AND type = 'EXPENSE' AND category = ? LIMIT 1`,
      [inv.event_id, inv.category]
    );

    let lineId;
    if (lines.length > 0) {
      lineId = lines[0].id;
    } else {
      // Créer la ligne budget si elle n'existe pas
      const [result] = await conn.execute(
        `INSERT INTO budget_lines (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, validation_status, created_by)
         VALUES (?, 'EXPENSE', ?, ?, ?, ?, 1, 'SOUMIS', ?)`,
        [inv.event_id, inv.category, inv.label, inv.amount, inv.amount, createdBy]
      );
      lineId = result.insertId;
      console.log(`  + Ligne budget créée : [event=${inv.event_id}] ${inv.category} — ${inv.label}`);
    }

    // Générer le fichier PDF
    const fileName = `facture_${inv.event_id}_${inv.label.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_${Date.now()}.pdf`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    await generateFakePDF(inv, filePath);

    // Insérer l'attachment en BDD
    await conn.execute(
      `INSERT INTO budget_attachments (budget_line_id, file_name, file_path)
       VALUES (?, ?, ?)`,
      [lineId, fileName, filePath]
    );

    console.log(`  ✓ [event=${inv.event_id}] ${inv.label} — ${inv.amount}€ → ${fileName}`);
  }

  await conn.end();
  console.log(`\n✅ ${FAKE_INVOICES.length} factures PDF générées dans /uploads et liées en BDD.`);
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
