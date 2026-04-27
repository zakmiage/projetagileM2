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
 * Génère un dossier PDF FSDIE complet.
 * GET /api/export/events/:id/fsdie
 */
exports.exportFsdie = async (req, res) => {
  try {
    const eventId = req.params.id;

    const [evRows] = await db.execute('SELECT * FROM events WHERE id = ?', [eventId]);
    if (evRows.length === 0) return res.status(404).json({ message: 'Événement introuvable' });
    const event = evRows[0];

    const [lines] = await db.execute(
      'SELECT bl.*, ba.id AS att_id, ba.file_name, ba.file_path FROM budget_lines bl LEFT JOIN budget_attachments ba ON ba.budget_line_id = bl.id WHERE bl.event_id = ? ORDER BY bl.type, bl.category, bl.id, ba.id',
      [eventId]
    );

    const fsdie = lines.filter(r => r.is_fsdie_eligible || r.type === 'REVENUE');
    if (fsdie.length === 0) {
      return res.status(400).json({ message: 'Aucune ligne FSDIE éligible pour cet événement.' });
    }

    const uniqueLines = [];
    const seen = new Set();
    fsdie.forEach(r => {
      if (!seen.has(r.id)) { seen.add(r.id); uniqueLines.push(r); }
    });

    const attachments = lines.filter(r => r.att_id).map(r => ({
      id: r.att_id, file_name: r.file_name, file_path: r.file_path, label: r.label
    }));

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', d => buffers.push(d));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="dossier_fsdie_${eventId}.pdf"`);
      res.send(pdfData);
    });

    // Page 1 : En-tête FSDIE
    doc.fontSize(22).font('Helvetica-Bold').text('DOSSIER FSDIE', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Fonds de Solidarité et de Développement des Initiatives Étudiantes', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text(`Événement : ${event.name}`);
    doc.font('Helvetica').fontSize(12);
    doc.text(`Date de début : ${new Date(event.start_date).toLocaleDateString('fr-FR')}`);
    doc.text(`Date de fin   : ${new Date(event.end_date).toLocaleDateString('fr-FR')}`);
    if (event.description) doc.text(`Description   : ${event.description}`);
    doc.moveDown(2);
    doc.fontSize(11).text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`);

    // Page 2 : Budget
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Budget Prévisionnel FSDIE', { align: 'center' });
    doc.moveDown();

    const expenses = uniqueLines.filter(l => l.type === 'EXPENSE');
    const revenues = uniqueLines.filter(l => l.type === 'REVENUE');

    doc.fontSize(13).font('Helvetica-Bold').text('DÉPENSES');
    doc.moveDown(0.5);
    let totalExp = 0;
    expenses.forEach(l => {
      const amt = Number(l.forecast_amount) || 0;
      totalExp += amt;
      const status = l.validation_status || 'SOUMIS';
      doc.font('Helvetica').fontSize(10).text(`  • [${l.category}] ${l.label} — ${amt.toFixed(2)} € (${status})`);
    });
    doc.font('Helvetica-Bold').fontSize(11).text(`Total dépenses : ${totalExp.toFixed(2)} €`);
    doc.moveDown();

    doc.fontSize(13).font('Helvetica-Bold').text('RECETTES');
    doc.moveDown(0.5);
    let totalRev = 0;
    revenues.forEach(l => {
      const amt = Number(l.forecast_amount) || 0;
      totalRev += amt;
      doc.font('Helvetica').fontSize(10).text(`  • [${l.category}] ${l.label} — ${amt.toFixed(2)} €`);
    });
    doc.font('Helvetica-Bold').fontSize(11).text(`Total recettes : ${totalRev.toFixed(2)} €`);
    doc.moveDown();
    const solde = totalRev - totalExp;
    doc.fontSize(13).font('Helvetica-Bold').text(`Solde : ${solde.toFixed(2)} €`);

    // Pages suivantes : PJ
    let pjNum = 1;
    for (const att of attachments) {
      doc.addPage();
      doc.fontSize(12).font('Helvetica-Bold').text(`Annexe ${pjNum} — ${att.file_name}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(11).text(`Libellé ligne : ${att.label}`);
      doc.text(`Fichier : ${att.file_name}`);
      const filePath = path.join(__dirname, '..', att.file_path);
      if (fs.existsSync(filePath)) {
        doc.moveDown().font('Helvetica').fontSize(10).fillColor('gray').text('[Fichier joint au dossier]').fillColor('black');
      } else {
        doc.moveDown().font('Helvetica').fontSize(10).fillColor('red').text('[Fichier non disponible sur le serveur]').fillColor('black');
      }
      pjNum++;
    }

    doc.end();
  } catch (err) {
    console.error('Erreur exportFsdie:', err);
    res.status(500).json({ message: 'Erreur lors de la génération du dossier FSDIE.' });
  }
};
