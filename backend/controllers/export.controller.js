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
 * Génère un dossier PDF FSDIE complet et professionnel.
 * Règles métier :
 *   R1  — Seules les lignes is_fsdie_eligible = true de type EXPENSE
 *   R2  — SOUMIS + APPROUVE → inclus dans total. REFUSE → barré, exclu du total
 *   R3  — Montant = actual_amount si > 0, sinon forecast_amount
 *   R4  — Total demandé = Σ lignes non REFUSE
 *   R5  — Recettes = toutes lignes REVENUE (autofinancement)
 *   R6  — Besoin net FSDIE = Total FSDIE éligible − Total recettes
 *   R7  — Chaque ligne référence ses PJ [A1], [A2]… dans le tableau
 *   R8  — Ligne sans PJ → ⚠ Justificatif manquant
 *   R9  — Blocage si aucune ligne FSDIE éligible → 400
 *   R10 — PJ concaténées dans l'ordre des lignes, numérotées séquentiellement
 *   R11 — Structure : Couverture → Récapitulatif → Tableau détaillé → Annexes
 *   R12 — Couverture : nom asso, événement, dates, montant demandé, date génération
 *   R13 — Footer sur chaque page dossier
 * GET /api/export/events/:id/fsdie
 */
exports.exportFsdie = async (req, res) => {
  try {
    const eventId = req.params.id;
    const PDFDocument = require('pdfkit');
    const { PDFDocument: LibPDF, rgb, StandardFonts } = require('pdf-lib');

    // ── 1. Données ────────────────────────────────────────────────────────────
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

    // Dédoublonnage lignes
    const lineMap = new Map();
    rows.forEach(r => {
      if (!lineMap.has(r.id)) {
        lineMap.set(r.id, { ...r, attachments: [] });
      }
      if (r.att_id) lineMap.get(r.id).attachments.push({ id: r.att_id, file_name: r.file_name, file_path: r.file_path });
    });
    const allLines = Array.from(lineMap.values());

    // R1 — Lignes FSDIE éligibles
    const fsdieLines = allLines.filter(l => l.is_fsdie_eligible && l.type === 'EXPENSE');
    // R9 — Blocage
    if (fsdieLines.length === 0) {
      return res.status(400).json({ message: 'Aucune ligne FSDIE éligible pour cet événement.' });
    }
    // R5 — Recettes
    const revenues = allLines.filter(l => l.type === 'REVENUE');

    // R3 — Montant par ligne
    const getAmt = l => Number(l.actual_amount) > 0 ? Number(l.actual_amount) : Number(l.forecast_amount) || 0;

    // R4 — Total demandé (R2 : exclure REFUSE)
    const totalFsdie = fsdieLines
      .filter(l => l.validation_status !== 'REFUSE')
      .reduce((s, l) => s + getAmt(l), 0);
    const totalRevenues = revenues.reduce((s, l) => s + getAmt(l), 0);
    // R6 — Besoin net
    const besoinNet = Math.max(0, totalFsdie - totalRevenues);

    // R7 — Numérotation des annexes (PJ dans l'ordre des lignes)
    let annexeCounter = 0;
    const annexeMap = new Map(); // att.id → numéro annexe
    const annexeList = []; // [{num, file_name, file_path, lineLabel}]
    for (const line of fsdieLines) {
      for (const att of line.attachments) {
        annexeCounter++;
        annexeMap.set(att.id, annexeCounter);
        annexeList.push({ num: annexeCounter, ...att, lineLabel: line.label, lineCategory: line.category });
      }
    }

    // ── 2. Helpers graphiques ────────────────────────────────────────────────
    const INDIGO = '#4f46e5';
    const INDIGO_LIGHT = '#eff6ff';
    const RED = '#dc2626';
    const GREEN = '#059669';
    const GRAY = '#64748b';
    const PAGE_W = 595.28;
    const MARGIN = 50;
    const COL_W = PAGE_W - MARGIN * 2;

    const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const fmtAmt = n => `${n.toFixed(2)} €`;

    // ── 3. Génération PDF (pdfkit) ────────────────────────────────────────────
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
    const buffers = [];
    doc.on('data', d => buffers.push(d));

    let pageNum = 0;
    const addFooter = (label) => {
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor(GRAY)
          .text(`Dossier FSDIE — ${event.name} — Page ${i + 1}/${totalPages}`,
            MARGIN, doc.page.height - 35, { width: COL_W, align: 'center' });
      }
    };

    const drawRect = (x, y, w, h, fillHex) => {
      doc.rect(x, y, w, h).fill(fillHex);
    };
    const drawLine = (x1, y1, x2, y2, color = '#e2e8f0') => {
      doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).stroke();
    };

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COUVERTURE (R11, R12)
    // ══════════════════════════════════════════════════════════════════════════
    pageNum++;

    // Bandeau en-tête
    drawRect(0, 0, PAGE_W, 120, INDIGO);
    doc.fill('white').fontSize(11).font('Helvetica')
      .text('KUBIK — BDE KEDGE Bordeaux', MARGIN, 25, { width: COL_W });
    doc.fontSize(22).font('Helvetica-Bold')
      .text('DOSSIER DE DEMANDE DE SUBVENTION', MARGIN, 48, { width: COL_W });
    doc.fontSize(14).font('Helvetica')
      .text('Fonds de Solidarité et de Développement des Initiatives Étudiantes', MARGIN, 80, { width: COL_W });

    doc.fill('#1e293b');

    // Encart événement
    const evBoxY = 145;
    drawRect(MARGIN, evBoxY, COL_W, 130, INDIGO_LIGHT);
    doc.rect(MARGIN, evBoxY, COL_W, 130).strokeColor(INDIGO).stroke();
    doc.fontSize(18).font('Helvetica-Bold').fill(INDIGO)
      .text(event.name, MARGIN + 16, evBoxY + 14, { width: COL_W - 32 });
    doc.fontSize(11).font('Helvetica').fill('#475569')
      .text(`Date de l'événement : ${fmtDate(event.start_date)} → ${fmtDate(event.end_date)}`, MARGIN + 16, evBoxY + 46);
    if (event.description) {
      doc.text(event.description, MARGIN + 16, evBoxY + 68, { width: COL_W - 32, height: 48, ellipsis: true });
    }

    // Encart montant demandé
    const amtBoxY = 305;
    drawRect(MARGIN, amtBoxY, COL_W, 90, INDIGO);
    doc.fontSize(12).font('Helvetica').fill('white')
      .text('Montant total demandé au FSDIE', MARGIN, amtBoxY + 12, { width: COL_W, align: 'center' });
    doc.fontSize(32).font('Helvetica-Bold').fill('white')
      .text(fmtAmt(besoinNet), MARGIN, amtBoxY + 34, { width: COL_W, align: 'center' });

    // Récap rapide sous le montant
    const recapY = 420;
    const col3 = COL_W / 3;
    [
      { label: 'Dépenses FSDIE éligibles', val: fmtAmt(totalFsdie), color: RED },
      { label: 'Recettes propres', val: fmtAmt(totalRevenues), color: GREEN },
      { label: 'Besoin net FSDIE', val: fmtAmt(besoinNet), color: INDIGO },
    ].forEach((item, i) => {
      const x = MARGIN + i * col3;
      drawRect(x, recapY, col3 - 8, 70, item.i === 2 ? '#f8fafc' : '#f8fafc');
      doc.rect(x, recapY, col3 - 8, 70).strokeColor('#e2e8f0').stroke();
      doc.fontSize(9).font('Helvetica').fill(GRAY)
        .text(item.label, x + 8, recapY + 10, { width: col3 - 24, align: 'center' });
      doc.fontSize(18).font('Helvetica-Bold').fill(item.color)
        .text(item.val, x + 8, recapY + 30, { width: col3 - 24, align: 'center' });
    });

    // Lignes stats
    const statsY = 520;
    doc.fontSize(10).font('Helvetica').fill('#475569')
      .text(`Nombre de lignes FSDIE éligibles : ${fsdieLines.length}`, MARGIN, statsY)
      .text(`Pièces justificatives jointes : ${annexeList.length}`, MARGIN, statsY + 18)
      .text(`Dossier généré le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, MARGIN, statsY + 36);

    if (annexeList.some(a => !a.file_path)) {
      doc.fontSize(10).fill(RED).text('⚠ Certaines lignes sont sans justificatif — dossier incomplet', MARGIN, statsY + 60);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — TABLEAU DÉTAILLÉ FSDIE (R7, R8, R2, R3)
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageNum++;

    doc.fontSize(16).font('Helvetica-Bold').fill(INDIGO)
      .text('Détail des dépenses éligibles FSDIE', MARGIN, MARGIN, { width: COL_W });
    drawLine(MARGIN, MARGIN + 26, MARGIN + COL_W, MARGIN + 26, INDIGO);
    doc.moveDown(1.5);

    // En-tête tableau
    const cols = { cat: 0, label: 90, ref: 270, amt: 350, status: 415, pj: 470 };
    const tableX = MARGIN;
    let tY = doc.y;

    drawRect(tableX, tY, COL_W, 22, INDIGO);
    doc.fontSize(8).font('Helvetica-Bold').fill('white');
    doc.text('Catégorie', tableX + cols.cat + 4, tY + 7, { width: 85 });
    doc.text('Libellé', tableX + cols.label + 4, tY + 7, { width: 175 });
    doc.text('Réf.', tableX + cols.ref + 4, tY + 7, { width: 75 });
    doc.text('Montant', tableX + cols.amt + 4, tY + 7, { width: 60, align: 'right' });
    doc.text('Statut', tableX + cols.status + 4, tY + 7, { width: 50 });
    doc.text('PJ', tableX + cols.pj + 4, tY + 7, { width: 25, align: 'center' });
    tY += 22;

    let grandTotal = 0;
    fsdieLines.forEach((line, idx) => {
      const isRefuse = line.validation_status === 'REFUSE';
      const amt = getAmt(line);
      if (!isRefuse) grandTotal += amt;

      const rowH = 20;
      const bgColor = isRefuse ? '#fef2f2' : (idx % 2 === 0 ? '#f8fafc' : 'white');
      drawRect(tableX, tY, COL_W, rowH, bgColor);
      doc.rect(tableX, tY, COL_W, rowH).strokeColor('#e2e8f0').stroke();

      const textColor = isRefuse ? '#9ca3af' : '#1e293b';
      doc.fontSize(8).font(isRefuse ? 'Helvetica' : 'Helvetica').fill(textColor);

      // Catégorie
      doc.text(line.category || '—', tableX + cols.cat + 4, tY + 6, { width: 85, lineBreak: false });
      // Libellé (barré si REFUSE)
      const labelText = isRefuse ? `[REFUSÉ] ${line.label}` : line.label;
      doc.text(labelText, tableX + cols.label + 4, tY + 6, { width: 175, lineBreak: false, ellipsis: true });
      // Référence prévisionnelle vs réel
      const hasReal = Number(line.actual_amount) > 0;
      doc.fill(GRAY).text(hasReal ? 'Réel' : 'Prév.', tableX + cols.ref + 4, tY + 6, { width: 75, lineBreak: false });
      // Montant
      doc.fill(isRefuse ? '#9ca3af' : (isRefuse ? RED : '#1e293b'))
        .font('Helvetica-Bold')
        .text(fmtAmt(amt), tableX + cols.amt + 4, tY + 6, { width: 60, align: 'right', lineBreak: false });
      // Statut
      const statusColor = line.validation_status === 'APPROUVE' ? GREEN : line.validation_status === 'REFUSE' ? RED : '#f59e0b';
      const statusLabel = line.validation_status === 'APPROUVE' ? '✓ Approuvé' : line.validation_status === 'REFUSE' ? '✗ Refusé' : '● Soumis';
      doc.fill(statusColor).font('Helvetica').fontSize(7)
        .text(statusLabel, tableX + cols.status + 4, tY + 7, { width: 50, lineBreak: false });
      // PJ
      const pjRefs = line.attachments.map(a => `A${annexeMap.get(a.id)}`).join(', ');
      const pjText = pjRefs || '⚠';
      const pjColor = pjRefs ? INDIGO : RED;
      doc.fill(pjColor).fontSize(7)
        .text(pjText, tableX + cols.pj + 4, tY + 7, { width: 40, align: 'center', lineBreak: false });

      tY += rowH;
      if (tY > 750) { doc.addPage(); tY = MARGIN + 30; pageNum++; }
    });

    // Ligne total
    drawRect(tableX, tY, COL_W, 24, INDIGO);
    doc.fontSize(10).font('Helvetica-Bold').fill('white')
      .text('TOTAL DEMANDÉ AU FSDIE', tableX + 4, tY + 7, { width: 340, lineBreak: false })
      .text(fmtAmt(grandTotal), tableX + cols.amt + 4, tY + 7, { width: 60, align: 'right', lineBreak: false });
    tY += 34;

    // Bloc récapitulatif recettes + besoin net
    doc.fontSize(10).font('Helvetica').fill('#475569').text('Recettes propres de l\'événement :', tableX, tY + 10);
    doc.fill(GREEN).font('Helvetica-Bold').text(fmtAmt(totalRevenues), tableX + 240, tY + 10, { lineBreak: false });
    doc.fill('#475569').font('Helvetica').text('Besoin net sollicité au FSDIE :', tableX, tY + 28);
    doc.fill(INDIGO).font('Helvetica-Bold').fontSize(13).text(fmtAmt(besoinNet), tableX + 240, tY + 26, { lineBreak: false });

    if (fsdieLines.some(l => l.attachments.length === 0)) {
      tY += 55;
      drawRect(tableX, tY, COL_W, 28, '#fef3c7');
      doc.rect(tableX, tY, COL_W, 28).strokeColor('#f59e0b').stroke();
      doc.fontSize(9).fill('#92400e').font('Helvetica-Bold')
        .text('⚠  Attention : certaines lignes ne disposent d\'aucune pièce justificative. Le dossier pourra être refusé ou incomplet.', tableX + 8, tY + 8, { width: COL_W - 16 });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 3 — TABLE DES ANNEXES
    // ══════════════════════════════════════════════════════════════════════════
    if (annexeList.length > 0) {
      doc.addPage();
      pageNum++;
      doc.fontSize(16).font('Helvetica-Bold').fill(INDIGO)
        .text('Table des annexes', MARGIN, MARGIN);
      drawLine(MARGIN, MARGIN + 26, MARGIN + COL_W, MARGIN + 26, INDIGO);
      doc.moveDown(1.5);

      annexeList.forEach(a => {
        const aY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').fill('#1e293b')
          .text(`Annexe A${a.num}`, MARGIN, aY, { width: 80, continued: true });
        doc.font('Helvetica').fill('#475569')
          .text(`${a.lineCategory} — ${a.lineLabel}`, { width: COL_W - 80 });
        doc.fontSize(8.5).fill(GRAY)
          .text(`Fichier : ${a.file_name}`, MARGIN + 8, doc.y, { width: COL_W - 8 });
        drawLine(MARGIN, doc.y + 4, MARGIN + COL_W, doc.y + 4, '#f1f5f9');
        doc.moveDown(0.6);
        if (doc.y > 750) { doc.addPage(); pageNum++; }
      });
    }

    // Finaliser le dossier pdfkit
    doc.end();

    // ── 4. Attendre le buffer pdfkit ──────────────────────────────────────────
    const mainPdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });

    // ── 5. Merger les PJ (pdf-lib) (R10) ─────────────────────────────────────
    const mergedPdf = await LibPDF.create();
    const { copyPages, addPage: libAddPage } = mergedPdf;

    // Charger le dossier principal
    const mainDoc = await LibPDF.load(mainPdfBuffer);
    const mainPages = await mergedPdf.copyPages(mainDoc, mainDoc.getPageIndices());
    mainPages.forEach(p => mergedPdf.addPage(p));

    // Pour chaque annexe : page de séparation + PJ réelle
    for (const ann of annexeList) {
      // Page séparateur d'annexe
      const sepPage = mergedPdf.addPage([595, 842]);
      const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
      sepPage.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: rgb(0.31, 0.27, 0.9) });
      sepPage.drawText(`ANNEXE A${ann.num}`, { x: 50, y: 808, size: 16, font: helveticaBold, color: rgb(1, 1, 1) });
      sepPage.drawText(`${ann.lineCategory} — ${ann.lineLabel}`, { x: 50, y: 700, size: 14, font: helveticaBold, color: rgb(0.19, 0.19, 0.19) });
      sepPage.drawText(`Fichier : ${ann.file_name}`, { x: 50, y: 675, size: 10, font: helvetica, color: rgb(0.4, 0.44, 0.56) });
      sepPage.drawLine({ start: { x: 50, y: 665 }, end: { x: 545, y: 665 }, thickness: 1, color: rgb(0.88, 0.9, 0.94) });

      // Tenter de charger et merger le PDF de PJ
      try {
        const pjPath = fs.existsSync(ann.file_path)
          ? ann.file_path
          : path.join(__dirname, '..', ann.file_path);
        if (fs.existsSync(pjPath)) {
          const pjBytes = fs.readFileSync(pjPath);
          const pjDoc = await LibPDF.load(pjBytes);
          const pjPages = await mergedPdf.copyPages(pjDoc, pjDoc.getPageIndices());
          pjPages.forEach(p => mergedPdf.addPage(p));
        }
      } catch (e) {
        // PJ non lisible → on laisse juste le séparateur
      }
    }

    // Sauvegarder le PDF final
    const finalBytes = await mergedPdf.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dossier_fsdie_${event.name.replace(/\s+/g, '_')}.pdf"`);
    res.send(Buffer.from(finalBytes));

  } catch (err) {
    console.error('Erreur exportFsdie:', err);
    res.status(500).json({ message: 'Erreur lors de la génération du dossier FSDIE.' });
  }
};
