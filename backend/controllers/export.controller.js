const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

exports.exportBudget = async (req, res) => {
    try {
        const { lines, fsdieOnly } = req.body;

        if (!lines || !Array.isArray(lines)) {
            return res.status(400).json({ message: 'Lignes de budget manquantes ou invalides.' });
        }

        const filteredLines = fsdieOnly 
            ? lines.filter(l => l.type === 'REVENUE' || Boolean(l.is_fsdie_eligible))
            : lines;

        const workbook = new exceljs.Workbook();
        const sheet = workbook.addWorksheet('Budget', { views: [{ showGridLines: false }] });

        sheet.columns = [
            { key: 'sortCat', width: 22 },
            { key: 'sortLab', width: 35 },
            { key: 'sortAmt', width: 16 },
            { key: 'entCat', width: 22 },
            { key: 'entLab', width: 35 },
            { key: 'entAmt', width: 16 }
        ];

        const expenses = filteredLines.filter(l => l.type === 'EXPENSE');
        const revenues = filteredLines.filter(l => l.type === 'REVENUE');

        const groupByCat = (arr) => {
            return arr.reduce((acc, curr) => {
                const cat = curr.category || 'Sans catégorie';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(curr);
                return acc;
            }, {});
        };

        const expGrouped = groupByCat(expenses);
        const revGrouped = groupByCat(revenues);

        // Styling helpers
        const applyBorders = (cell) => {
            cell.border = {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            };
        };

        const applyStyle = (cell, color, bold = false) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
            if (bold) cell.font = { bold: true };
            applyBorders(cell);
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
        };

        // Header Styling
        const headerRow = sheet.getRow(1);
        headerRow.height = 25;
        
        sheet.mergeCells('A1:C1');
        const sortHeader = sheet.getCell('A1');
        sortHeader.value = 'SORTIE';
        sortHeader.font = { bold: true, size: 12 };
        sortHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE06666' } };
        sortHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        ['A1','B1','C1'].forEach(c => applyBorders(sheet.getCell(c)));

        sheet.mergeCells('D1:F1');
        const entHeader = sheet.getCell('D1');
        entHeader.value = 'ENTREE';
        entHeader.font = { bold: true, size: 12 };
        entHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF93C47D' } };
        entHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        ['D1','E1','F1'].forEach(c => applyBorders(sheet.getCell(c)));

        // Colors
        const expBg = 'FFFADCD9'; // Pastel red
        const revBg = 'FFDFF0D8'; // Pastel green
        
        // --- Populate Sorties (Expenses) ---
        let rowExp = 2;
        let totalExp = 0;

        for (const [cat, items] of Object.entries(expGrouped)) {
            const startRow = rowExp;
            let subTotal = 0;
            
            items.forEach(item => {
                const row = sheet.getRow(rowExp);
                const amount = Number(item.forecast_amount) || 0;
                subTotal += amount;
                
                row.getCell(2).value = item.label || '';
                row.getCell(3).value = amount;
                row.getCell(3).numFmt = '#,##0.00 €';
                
                applyStyle(row.getCell(2), expBg);
                applyStyle(row.getCell(3), expBg);
                // Keep alignment for numbers explicitly
                row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
                rowExp++;
            });

            // SubTotal line
            const subRow = sheet.getRow(rowExp);
            subRow.getCell(2).value = 'Sous-Total';
            subRow.getCell(3).value = subTotal;
            subRow.getCell(3).numFmt = '#,##0.00 €';
            applyStyle(subRow.getCell(2), expBg, true);
            applyStyle(subRow.getCell(3), expBg, true);
            subRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
            totalExp += subTotal;

            // Merge & Style Category Column A
            if (rowExp > startRow) {
                sheet.mergeCells(`A${startRow}:A${rowExp}`);
            }
            const catCell = sheet.getCell(`A${startRow}`);
            catCell.value = cat;
            
            for(let r = startRow; r <= rowExp; r++) {
               applyStyle(sheet.getCell(`A${r}`), expBg, true);
            }
            // Restore proper alignment for merged category text
            catCell.alignment = { horizontal: 'center', vertical: 'middle' };

            rowExp++;
        }

        // --- Populate Entrées (Revenues) ---
        let rowRev = 2;
        let totalRev = 0;

        for (const [cat, items] of Object.entries(revGrouped)) {
            const startRow = rowRev;
            let subTotal = 0;
            
            items.forEach(item => {
                const row = sheet.getRow(rowRev);
                const amount = Number(item.forecast_amount) || 0;
                subTotal += amount;
                
                row.getCell(5).value = item.label || '';
                row.getCell(6).value = amount;
                row.getCell(6).numFmt = '#,##0.00 €';
                
                applyStyle(row.getCell(5), revBg);
                applyStyle(row.getCell(6), revBg);
                row.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
                rowRev++;
            });

            // SubTotal line
            const subRow = sheet.getRow(rowRev);
            subRow.getCell(5).value = 'Sous-Total';
            subRow.getCell(6).value = subTotal;
            subRow.getCell(6).numFmt = '#,##0.00 €';
            applyStyle(subRow.getCell(5), revBg, true);
            applyStyle(subRow.getCell(6), revBg, true);
            subRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
            totalRev += subTotal;

            // Merge & Style Category Column D
            if (rowRev > startRow) {
                sheet.mergeCells(`D${startRow}:D${rowRev}`);
            }
            const catCell = sheet.getCell(`D${startRow}`);
            catCell.value = cat;
            
            for(let r = startRow; r <= rowRev; r++) {
               applyStyle(sheet.getCell(`D${r}`), revBg, true);
            }
            // Restore proper alignment for merged category text
            catCell.alignment = { horizontal: 'center', vertical: 'middle' };

            rowRev++;
        }

        // --- TOTAL Row ---
        const maxRow = Math.max(rowExp, rowRev);
        const totalRowLine = sheet.getRow(maxRow);
        totalRowLine.height = 20;

        // Left Total
        sheet.mergeCells(`A${maxRow}:B${maxRow}`);
        const leftTotalLabel = sheet.getCell(`A${maxRow}`);
        leftTotalLabel.value = 'TOTAL';
        
        applyStyle(sheet.getCell(`A${maxRow}`), 'FFB7B7B7', true); // Grey
        applyStyle(sheet.getCell(`B${maxRow}`), 'FFB7B7B7', true); // Grey
        leftTotalLabel.alignment = { horizontal: 'left', vertical: 'middle' };

        const leftTotalValue = sheet.getCell(`C${maxRow}`);
        leftTotalValue.value = totalExp;
        leftTotalValue.numFmt = '#,##0.00 €';
        applyStyle(leftTotalValue, 'FFE06666', true); // Red Header Color
        leftTotalValue.alignment = { horizontal: 'right', vertical: 'middle' };

        // Right Total
        sheet.mergeCells(`D${maxRow}:E${maxRow}`);
        const rightTotalLabel = sheet.getCell(`D${maxRow}`);
        rightTotalLabel.value = 'TOTAL';
        
        applyStyle(sheet.getCell(`D${maxRow}`), 'FFB7B7B7', true); // Grey
        applyStyle(sheet.getCell(`E${maxRow}`), 'FFB7B7B7', true); // Grey
        rightTotalLabel.alignment = { horizontal: 'left', vertical: 'middle' };

        const rightTotalValue = sheet.getCell(`F${maxRow}`);
        rightTotalValue.value = totalRev;
        rightTotalValue.numFmt = '#,##0.00 €';
        applyStyle(rightTotalValue, 'FF93C47D', true); // Green Header Color
        rightTotalValue.alignment = { horizontal: 'right', vertical: 'middle' };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=budget${fsdieOnly ? '_fsdie' : ''}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Erreur gènèration Excel: ", error);
        res.status(500).json({ message: 'Erreur lors de la génération du fichier Excel.' });
    }
};

/**
 * Concatène toutes les pièces jointes d'un événement en un seul PDF.
 * GET /api/export/events/:id/invoices
 */
exports.exportInvoices = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Récupérer l'événement
    const [evRows] = await db.execute('SELECT * FROM events WHERE id = ?', [eventId]);
    if (evRows.length === 0) return res.status(404).json({ message: 'Événement introuvable' });
    const event = evRows[0];

    // Récupérer les lignes budget + leurs PJ
    const [lines] = await db.execute(
      'SELECT bl.*, ba.id AS att_id, ba.file_name, ba.file_path FROM budget_lines bl LEFT JOIN budget_attachments ba ON ba.budget_line_id = bl.id WHERE bl.event_id = ? ORDER BY bl.id, ba.id',
      [eventId]
    );

    const attachments = lines.filter(r => r.att_id).map(r => ({
      id: r.att_id,
      file_name: r.file_name,
      file_path: r.file_path,
      label: r.label
    }));

    if (attachments.length === 0) {
      return res.status(404).json({ message: 'Aucune pièce jointe trouvée pour cet événement.' });
    }

    // Construire le PDF de synthèse (page de garde + liste PJ)
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', d => buffers.push(d));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="factures_${eventId}.pdf"`);
      res.send(pdfData);
    });

    // Page de garde
    doc.fontSize(20).font('Helvetica-Bold').text('Export des Pièces Justificatives', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica').text(`Événement : ${event.name}`);
    doc.text(`Date : ${new Date(event.start_date).toLocaleDateString('fr-FR')}`);
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text(`Pièces jointes (${attachments.length}) :`);
    doc.moveDown(0.5);
    attachments.forEach((att, i) => {
      doc.font('Helvetica').fontSize(11).text(`${i + 1}. ${att.file_name} — ${att.label}`);
    });

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Détail des pièces jointes', { align: 'center' });
    doc.moveDown();

    for (const att of attachments) {
      const filePath = path.join(__dirname, '..', att.file_path);
      if (fs.existsSync(filePath)) {
        doc.fontSize(11).font('Helvetica-Bold').text(`— ${att.file_name}`);
        doc.font('Helvetica').fontSize(10).text(`Libellé : ${att.label}`);
        doc.text(`Chemin : ${att.file_name}`);
        doc.moveDown();
      }
    }

    doc.end();
  } catch (err) {
    console.error('Erreur exportInvoices:', err);
    res.status(500).json({ message: 'Erreur lors de la génération du PDF.' });
  }
};

/**
 * Génère un dossier PDF FSDIE complet — v2.
 * Règles métier :
 *   R1  — Seules les lignes is_fsdie_eligible=true de type EXPENSE
 *   R2  — REFUSE → affiché barré en rouge, exclu du total
 *   R3  — Montant = actual_amount si > 0, sinon forecast_amount
 *   R4  — Total demandé = Σ lignes non REFUSE
 *   R5  — Recettes propres = lignes REVENUE hors subvention FSDIE
 *   R6  — Montant demandé au FSDIE = totalFsdie − recettes propres (≥0)
 *   R7  — Chaque ligne référence ses PJ [A1][A2] dans le tableau
 *   R8  — Ligne sans PJ → ⚠ bandeau orange
 *   R9  — Blocage si aucune ligne FSDIE éligible → 400
 *   R10 — PJ PDF réelles mergées après chaque page séparatrice
 *   R11 — Structure : Couverture → Budget complet (Excel-style) → Tableau FSDIE → Table annexes → PJ
 *   R12 — Couverture : bandeau couleur, encart montant, 3 chips
 *   R13 — Footer "Dossier FSDIE — [événement] — Page X"
 *   R14 — La subvention FSDIE attendue est une recette virtuelle = totalFsdie
 */
exports.exportFsdie = async (req, res) => {
  try {
    const eventId = req.params.id;
    const PDFDocument = require('pdfkit');
    const { PDFDocument: LibPDF, rgb, StandardFonts } = require('pdf-lib');

    // ── 1. Données BDD ────────────────────────────────────────────────────────
    const [evRows] = await db.execute('SELECT * FROM events WHERE id = ?', [eventId]);
    if (evRows.length === 0) return res.status(404).json({ message: 'Événement introuvable' });
    const event = evRows[0];

    const [rows] = await db.execute(
      `SELECT bl.*, ba.id AS att_id, ba.file_name, ba.file_path
       FROM budget_lines bl
       LEFT JOIN budget_attachments ba ON ba.budget_line_id = bl.id
       WHERE bl.event_id = ?
       ORDER BY bl.type DESC, bl.category, bl.id, ba.id`,
      [eventId]
    );

    // Dédoublonnage + regroupement PJ
    const lineMap = new Map();
    rows.forEach(r => {
      if (!lineMap.has(r.id)) lineMap.set(r.id, { ...r, attachments: [] });
      if (r.att_id) lineMap.get(r.id).attachments.push({ id: r.att_id, file_name: r.file_name, file_path: r.file_path });
    });
    const allLines = Array.from(lineMap.values());

    // R1
    const fsdieLines = allLines.filter(l => l.is_fsdie_eligible && l.type === 'EXPENSE');
    if (fsdieLines.length === 0) return res.status(400).json({ message: 'Aucune ligne FSDIE éligible.' });

    const allExpenses = allLines.filter(l => l.type === 'EXPENSE');
    const allRevenues = allLines.filter(l => l.type === 'REVENUE');

    // R3
    const getAmt = l => Number(l.actual_amount) > 0 ? Number(l.actual_amount) : Number(l.forecast_amount) || 0;

    // R4
    const totalFsdie = fsdieLines.filter(l => l.validation_status !== 'REFUSE').reduce((s, l) => s + getAmt(l), 0);

    // R5 — recettes propres (hors subvention FSDIE qui est virtuelle)
    const totalRecettesPropres = allRevenues.reduce((s, l) => s + getAmt(l), 0);

    // R14 — subvention FSDIE virtuelle = totalFsdie
    const subventionFsdie = totalFsdie;

    // R6
    const montantDemande = Math.max(0, totalFsdie - totalRecettesPropres);

    // Totaux budget complet
    const totalAllExpenses = allExpenses.reduce((s, l) => s + getAmt(l), 0);
    const totalAllRevenues = totalRecettesPropres + subventionFsdie; // R14
    const soldeGlobal = totalAllRevenues - totalAllExpenses;

    // R7 — Numérotation annexes
    let annexeCounter = 0;
    const annexeMap = new Map();
    const annexeList = [];
    for (const line of fsdieLines) {
      for (const att of line.attachments) {
        annexeCounter++;
        annexeMap.set(att.id, annexeCounter);
        annexeList.push({ num: annexeCounter, ...att, lineLabel: line.label, lineCategory: line.category });
      }
    }

    // ── 2. Helpers graphiques ─────────────────────────────────────────────────
    const INDIGO      = '#4f46e5';
    const INDIGO_L    = '#eff6ff';
    const RED_H       = '#991b1b';
    const RED_BG      = '#fef2f2';
    const RED_HEADER  = '#dc2626';
    const GREEN       = '#059669';
    const GREEN_BG    = '#f0fdf4';
    const GRAY        = '#64748b';
    const PAGE_W      = 595.28;
    const MARGIN      = 45;
    const COL_W       = PAGE_W - MARGIN * 2;

    const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const fmtAmt  = n => `${Number(n).toFixed(2)} €`;

    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
    const buffers = [];
    doc.on('data', d => buffers.push(d));

    const drawRect = (x, y, w, h, hex) => doc.save().rect(x, y, w, h).fill(hex).restore();
    const hline    = (x1, y1, x2, col='#e2e8f0') => doc.save().moveTo(x1, y1).lineTo(x2, y1).strokeColor(col).stroke().restore();
    const groupBy  = (arr, key) => arr.reduce((acc, x) => { const k = x[key] || 'Autre'; (acc[k] = acc[k] || []).push(x); return acc; }, {});

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COUVERTURE
    // ══════════════════════════════════════════════════════════════════════════
    // Bandeau
    drawRect(0, 0, PAGE_W, 110, INDIGO);
    doc.fill('white').fontSize(10).font('Helvetica').text('KUBIK — BDE KEDGE Bordeaux', MARGIN, 20, { width: COL_W });
    doc.fontSize(21).font('Helvetica-Bold').text('DOSSIER DE DEMANDE DE SUBVENTION', MARGIN, 40, { width: COL_W });
    doc.fontSize(11).font('Helvetica').text('Fonds de Solidarité et de Développement des Initiatives Étudiantes', MARGIN, 74, { width: COL_W });

    // Encart événement
    drawRect(MARGIN, 128, COL_W, 110, INDIGO_L);
    doc.save().rect(MARGIN, 128, COL_W, 110).strokeColor(INDIGO).lineWidth(1.5).stroke().restore();
    doc.fill(INDIGO).fontSize(17).font('Helvetica-Bold').text(event.name, MARGIN+14, 142, { width: COL_W-28 });
    doc.fill('#475569').fontSize(10).font('Helvetica')
      .text(`Date : ${fmtDate(event.start_date)}  →  ${fmtDate(event.end_date)}`, MARGIN+14, 170);
    if (event.description)
      doc.text(event.description, MARGIN+14, 190, { width: COL_W-28, height: 38, ellipsis: true });

    // Encart montant demandé
    drawRect(MARGIN, 262, COL_W, 80, INDIGO);
    doc.fill('white').fontSize(10).font('Helvetica').text('Montant sollicité au FSDIE', MARGIN, 275, { width: COL_W, align: 'center' });
    doc.fontSize(30).font('Helvetica-Bold').text(fmtAmt(montantDemande), MARGIN, 292, { width: COL_W, align: 'center' });

    // 3 chips
    const chipY = 368; const cw = COL_W / 3;
    [
      { label: 'Dépenses FSDIE éligibles', val: fmtAmt(totalFsdie), color: RED_HEADER },
      { label: 'Recettes propres', val: fmtAmt(totalRecettesPropres), color: GREEN },
      { label: 'Montant demandé FSDIE', val: fmtAmt(montantDemande), color: INDIGO },
    ].forEach((c, i) => {
      const cx = MARGIN + i * cw;
      drawRect(cx, chipY, cw-6, 68, '#f8fafc');
      doc.save().rect(cx, chipY, cw-6, 68).strokeColor('#e2e8f0').lineWidth(1).stroke().restore();
      doc.fill(GRAY).fontSize(8).font('Helvetica').text(c.label, cx+6, chipY+8, { width: cw-20, align: 'center' });
      doc.fill(c.color).fontSize(16).font('Helvetica-Bold').text(c.val, cx+6, chipY+28, { width: cw-20, align: 'center' });
    });

    // Stats
    doc.fill('#475569').fontSize(9.5).font('Helvetica')
      .text(`Lignes FSDIE éligibles : ${fsdieLines.length}  |  Pièces justificatives : ${annexeList.length}  |  Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`, MARGIN, 458, { width: COL_W, align: 'center' });

    // R14 note
    drawRect(MARGIN, 478, COL_W, 42, '#eff6ff');
    doc.save().rect(MARGIN, 478, COL_W, 42).strokeColor(INDIGO).lineWidth(1).stroke().restore();
    doc.fill(INDIGO).fontSize(8.5).font('Helvetica-Bold').text('Règle comptable appliquée :', MARGIN+10, 485);
    doc.fill('#1e40af').font('Helvetica').fontSize(8).text(
      `La subvention FSDIE attendue (${fmtAmt(subventionFsdie)}) est automatiquement portée en recette prévisionnelle et réelle du budget, conformément aux règles de présentation FSDIE.`,
      MARGIN+10, 497, { width: COL_W-20 });

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — BUDGET COMPLET (style Excel : 2 colonnes)
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    doc.fill(INDIGO).fontSize(14).font('Helvetica-Bold').text('Budget prévisionnel complet', MARGIN, MARGIN);
    hline(MARGIN, MARGIN+22, MARGIN+COL_W, INDIGO);
    doc.fill(GRAY).fontSize(8).font('Helvetica').text(`Exercice ${event.name} — Montants en euros HT — Subvention FSDIE incluse en recettes`, MARGIN, MARGIN+28);

    const half = COL_W / 2 - 6;
    const LX = MARGIN; const RX = MARGIN + half + 12;
    let bY = MARGIN + 50;

    // Helper : dessine une colonne (dépenses ou recettes)
    const drawBudgetCol = (x, w, title, headerBg, groups, total, extraRows = []) => {
      // Titre colonne
      drawRect(x, bY, w, 22, headerBg);
      doc.fill('white').fontSize(9).font('Helvetica-Bold').text(title, x+6, bY+7, { width: w-12 });
      let cy = bY + 22;
      let rowIdx = 0;
      for (const [cat, lines] of Object.entries(groups)) {
        // Sous-titre catégorie
        drawRect(x, cy, w, 16, headerBg + '22'); // approx lighter
        doc.fill(headerBg).fontSize(7.5).font('Helvetica-Bold').text(cat.toUpperCase(), x+6, cy+4, { width: w-12 });
        cy += 16;
        for (const line of lines) {
          const bg = rowIdx % 2 === 0 ? '#f8fafc' : 'white';
          drawRect(x, cy, w, 16, bg);
          doc.save().rect(x, cy, w, 16).strokeColor('#e2e8f0').lineWidth(0.5).stroke().restore();
          doc.fill('#1e293b').fontSize(7.5).font('Helvetica').text(line.label || '—', x+4, cy+4, { width: w*0.68-4, lineBreak: false, ellipsis: true });
          doc.fill(headerBg).font('Helvetica-Bold').text(fmtAmt(getAmt(line)), x+w*0.68, cy+4, { width: w*0.32-4, align: 'right', lineBreak: false });
          cy += 16; rowIdx++;
        }
      }
      // Lignes extra (subvention FSDIE virtuelle)
      for (const extra of extraRows) {
        drawRect(x, cy, w, 16, '#eff6ff');
        doc.save().rect(x, cy, w, 16).strokeColor(INDIGO).lineWidth(0.5).stroke().restore();
        doc.fill(INDIGO).fontSize(7.5).font('Helvetica-Bold').text(extra.label, x+4, cy+4, { width: w*0.68-4, lineBreak: false });
        doc.fill(INDIGO).text(fmtAmt(extra.val), x+w*0.68, cy+4, { width: w*0.32-4, align: 'right', lineBreak: false });
        cy += 16;
      }
      // Total
      drawRect(x, cy, w, 20, headerBg);
      doc.fill('white').fontSize(8.5).font('Helvetica-Bold').text('TOTAL', x+6, cy+6, { width: w*0.6, lineBreak: false });
      doc.fill('white').text(fmtAmt(total), x+w*0.6, cy+6, { width: w*0.35, align: 'right', lineBreak: false });
      cy += 20;
      return cy;
    };

    const expGroups = groupBy(allExpenses, 'category');
    const revGroups = groupBy(allRevenues, 'category');

    const endExpY = drawBudgetCol(LX, half, 'DÉPENSES', RED_HEADER, expGroups, totalAllExpenses);
    const endRevY = drawBudgetCol(RX, half, 'RECETTES', GREEN, revGroups, totalAllRevenues,
      [{ label: 'Subvention FSDIE attendue (R14)', val: subventionFsdie }]);

    // Solde global
    const soldeY = Math.max(endExpY, endRevY) + 10;
    const soldeColor = soldeGlobal >= 0 ? GREEN : RED_HEADER;
    drawRect(MARGIN, soldeY, COL_W, 26, soldeColor);
    doc.fill('white').fontSize(10).font('Helvetica-Bold')
      .text(`Solde global (recettes − dépenses) :`, MARGIN+8, soldeY+8, { width: COL_W*0.6, lineBreak: false });
    doc.fill('white').text(`${soldeGlobal >= 0 ? '+' : ''}${fmtAmt(soldeGlobal)}`, MARGIN+COL_W*0.6, soldeY+8, { width: COL_W*0.35, align: 'right', lineBreak: false });

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 3 — TABLEAU DÉTAILLÉ FSDIE
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    doc.fill(INDIGO).fontSize(14).font('Helvetica-Bold').text('Détail des dépenses éligibles FSDIE', MARGIN, MARGIN);
    hline(MARGIN, MARGIN+22, MARGIN+COL_W, INDIGO);
    doc.moveDown(1.5);

    const cols = { cat: 0, label: 88, ref: 268, amt: 340, status: 408, pj: 468 };
    const tX   = MARGIN;
    let tY     = doc.y;

    drawRect(tX, tY, COL_W, 22, INDIGO);
    doc.fill('white').fontSize(7.5).font('Helvetica-Bold');
    [['Catégorie',85],['Libellé',178],['Réf.',70],['Montant',66,'right'],['Statut',58],['PJ',42,'center']]
      .reduce((x, [label, w, align='left']) => {
        doc.text(label, tX + x + 3, tY + 7, { width: w, align, lineBreak: false });
        return x + w + (label === 'Libellé' ? 2 : 0);
      }, 0);
    tY += 22;

    let grandTotal = 0;
    fsdieLines.forEach((line, idx) => {
      const isRefuse = line.validation_status === 'REFUSE';
      const amt = getAmt(line);
      if (!isRefuse) grandTotal += amt;
      const rowH = 20;
      drawRect(tX, tY, COL_W, rowH, isRefuse ? '#fef2f2' : idx%2===0 ? '#f8fafc' : 'white');
      doc.save().rect(tX, tY, COL_W, rowH).strokeColor('#e2e8f0').lineWidth(0.5).stroke().restore();

      doc.fill(isRefuse ? '#9ca3af' : '#1e293b').fontSize(7.5).font('Helvetica')
        .text(line.category||'—', tX+cols.cat+3, tY+6, { width:85, lineBreak:false });
      const lbl = isRefuse ? `[REFUSÉ] ${line.label}` : line.label;
      doc.text(lbl, tX+cols.label+3, tY+6, { width:178, lineBreak:false, ellipsis:true });
      doc.fill(GRAY).text(Number(line.actual_amount)>0?'Réel':'Prév.', tX+cols.ref+3, tY+6, { width:70, lineBreak:false });
      doc.fill(isRefuse?'#9ca3af':'#1e293b').font('Helvetica-Bold')
        .text(fmtAmt(amt), tX+cols.amt+3, tY+6, { width:66, align:'right', lineBreak:false });
      const sColor = line.validation_status==='APPROUVE' ? GREEN : line.validation_status==='REFUSE' ? RED_HEADER : '#d97706';
      const sLabel = line.validation_status==='APPROUVE' ? '✓ Approuvé' : line.validation_status==='REFUSE' ? '✗ Refusé' : '● Soumis';
      doc.fill(sColor).font('Helvetica').fontSize(7).text(sLabel, tX+cols.status+3, tY+7, { width:58, lineBreak:false });
      const pjRefs = line.attachments.map(a => `A${annexeMap.get(a.id)}`).join(', ');
      doc.fill(pjRefs ? INDIGO : RED_HEADER).fontSize(7)
        .text(pjRefs||'⚠', tX+cols.pj+3, tY+7, { width:42, align:'center', lineBreak:false });
      tY += rowH;
      if (tY > 760) { doc.addPage(); tY = MARGIN + 30; }
    });

    // Ligne total
    drawRect(tX, tY, COL_W, 24, INDIGO);
    doc.fill('white').fontSize(9).font('Helvetica-Bold')
      .text('TOTAL DEMANDÉ AU FSDIE', tX+4, tY+7, { width: 340, lineBreak:false })
      .text(fmtAmt(grandTotal), tX+cols.amt+3, tY+7, { width:66, align:'right', lineBreak:false });
    tY += 32;

    // Récap recettes + montant net
    doc.fill(GRAY).fontSize(9).font('Helvetica').text('Recettes propres de l\'événement :', tX, tY+8);
    doc.fill(GREEN).font('Helvetica-Bold').text(fmtAmt(totalRecettesPropres), tX+250, tY+8, { lineBreak:false });
    doc.fill(GRAY).font('Helvetica').text('Subvention FSDIE en recette (R14) :', tX, tY+22);
    doc.fill(INDIGO).font('Helvetica-Bold').text(fmtAmt(subventionFsdie), tX+250, tY+22, { lineBreak:false });
    doc.fill(GRAY).font('Helvetica').text('Montant net sollicité :', tX, tY+38);
    doc.fill(INDIGO).fontSize(12).font('Helvetica-Bold').text(fmtAmt(montantDemande), tX+250, tY+36, { lineBreak:false });
    tY += 62;

    // Alerte PJ manquantes (R8)
    if (fsdieLines.some(l => l.attachments.length === 0)) {
      drawRect(tX, tY, COL_W, 26, '#fef3c7');
      doc.save().rect(tX, tY, COL_W, 26).strokeColor('#f59e0b').lineWidth(1).stroke().restore();
      doc.fill('#92400e').fontSize(8).font('Helvetica-Bold')
        .text('⚠  Certaines lignes n\'ont pas de pièce justificative — dossier potentiellement incomplet.', tX+8, tY+8, { width: COL_W-16 });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 4 — TABLE DES ANNEXES
    // ══════════════════════════════════════════════════════════════════════════
    if (annexeList.length > 0) {
      doc.addPage();
      doc.fill(INDIGO).fontSize(14).font('Helvetica-Bold').text('Table des annexes', MARGIN, MARGIN);
      hline(MARGIN, MARGIN+22, MARGIN+COL_W, INDIGO);
      doc.moveDown(1.5);
      annexeList.forEach(a => {
        const ay = doc.y;
        doc.fill('#1e293b').fontSize(9).font('Helvetica-Bold').text(`A${a.num}`, MARGIN, ay, { width:32, lineBreak:false, continued:true });
        doc.fill(INDIGO).text(`${a.lineCategory}`, { width:100, lineBreak:false, continued:true });
        doc.fill('#475569').font('Helvetica').text(` — ${a.lineLabel}`, { width: COL_W-132 });
        doc.fill(GRAY).fontSize(7.5).text(`Fichier : ${a.file_name}`, MARGIN+8, doc.y, { width: COL_W });
        hline(MARGIN, doc.y+4, MARGIN+COL_W, '#f1f5f9');
        doc.moveDown(0.5);
        if (doc.y > 760) { doc.addPage(); }
      });
    }

    // Footer sur toutes les pages (R13)
    doc.end();
    const mainPdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => {
        const buf = Buffer.concat(buffers);
        // Ajouter footer via pdf-lib
        resolve(buf);
      });
      doc.on('error', reject);
    });

    // ── 3. Merger via pdf-lib ─────────────────────────────────────────────────
    const mergedPdf = await LibPDF.create();

    const mainDoc = await LibPDF.load(mainPdfBuffer);
    const helB = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
    const hel  = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const totalMainPages = mainDoc.getPageCount();

    // Copier pages du dossier + footer (R13)
    const mainPages = await mergedPdf.copyPages(mainDoc, mainDoc.getPageIndices());
    mainPages.forEach((p, i) => {
      mergedPdf.addPage(p);
      const { width } = p.getSize();
      p.drawText(`Dossier FSDIE — ${event.name} — Page ${i+1}/${totalMainPages + annexeList.length * 2}`,
        { x: 45, y: 20, size: 7, font: hel, color: rgb(0.39, 0.45, 0.55), maxWidth: width-90 });
    });

    // Annexes : séparateur + PDF réel
    for (const ann of annexeList) {
      const sep = mergedPdf.addPage([595.28, 841.89]);
      sep.drawRectangle({ x: 0, y: 791, width: 595.28, height: 51, color: rgb(0.31, 0.27, 0.9) });
      sep.drawText(`ANNEXE  A${ann.num}`, { x: 45, y: 808, size: 18, font: helB, color: rgb(1,1,1) });
      sep.drawText(`${ann.lineCategory}  —  ${ann.lineLabel}`, { x: 45, y: 690, size: 13, font: helB, color: rgb(0.12,0.12,0.12) });
      sep.drawText(`Fichier : ${ann.file_name}`, { x: 45, y: 665, size: 9, font: hel, color: rgb(0.4,0.44,0.56) });
      sep.drawLine({ start:{x:45,y:655}, end:{x:550,y:655}, thickness:1, color:rgb(0.88,0.9,0.94) });

      try {
        const pjPath = fs.existsSync(ann.file_path) ? ann.file_path : path.join(__dirname, '..', ann.file_path);
        if (fs.existsSync(pjPath)) {
          const pjDoc = await LibPDF.load(fs.readFileSync(pjPath));
          const pjPages = await mergedPdf.copyPages(pjDoc, pjDoc.getPageIndices());
          pjPages.forEach(p => mergedPdf.addPage(p));
        }
      } catch (_) { /* PJ illisible → séparateur seul */ }
    }

    const finalBytes = await mergedPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="FSDIE_${event.name.replace(/[^a-zA-Z0-9]/g,'_')}.pdf"`);
    res.send(Buffer.from(finalBytes));

  } catch (err) {
    console.error('Erreur exportFsdie:', err);
    res.status(500).json({ message: 'Erreur génération dossier FSDIE : ' + err.message });
  }
};


