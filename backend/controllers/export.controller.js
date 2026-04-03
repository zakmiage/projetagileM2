const exceljs = require('exceljs');

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
