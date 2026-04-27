const BudgetService = require('../services/budget.service');
const BudgetLine    = require('../models/budget.model');
const db            = require('../config/db');

// ─────────────────────────────────────────────────────────────────
// Helper : récupère event_id d'une ligne par son id
// ─────────────────────────────────────────────────────────────────
async function getEventIdForLine(lineId) {
  const [[row]] = await db.execute(
    'SELECT event_id FROM budget_lines WHERE id = ?', [lineId]
  );
  return row?.event_id;
}

// ─────────────────────────────────────────────────────────────────
// GET /api/budget-lines?eventId=X
// ─────────────────────────────────────────────────────────────────
exports.getBudgetLines = async (req, res) => {
  try {
    const eventId = req.query.eventId;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }
    const lines = await BudgetService.getBudgetLinesByEvent(eventId);
    res.status(200).json({ success: true, data: lines });
  } catch (error) {
    console.error('Error in getBudgetLines:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/budget-lines
// ─────────────────────────────────────────────────────────────────
exports.createBudgetLine = async (req, res) => {
  try {
    const newLine = await BudgetService.createBudgetLine(req.body);

    // Sync R14 si la nouvelle ligne est une dépense FSDIE éligible
    if (req.body.type === 'EXPENSE' && req.body.is_fsdie_eligible) {
      await BudgetLine.syncFsdieSubvention(req.body.event_id);
    }

    res.status(201).json({ success: true, data: newLine });
  } catch (error) {
    console.error('Error in createBudgetLine:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid Request' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT /api/budget-lines/:id
// ─────────────────────────────────────────────────────────────────
exports.updateBudgetLine = async (req, res) => {
  try {
    const id = req.params.id;

    // Récupérer la ligne AVANT la mise à jour (pour event_id et catégorie)
    const [[lineRow]] = await db.execute(
      'SELECT event_id, category, type FROM budget_lines WHERE id = ?', [id]
    );
    const eventId = lineRow?.event_id;

    const updatedLine = await BudgetService.updateBudgetLine(id, req.body);

    // Sync R14 uniquement si ce n'est PAS la ligne Subvention FSDIE elle-même
    // (évite de recalculer inutilement et d'écraser les montants saisis manuellement)
    const isSubventionLine = lineRow?.category === 'Subvention FSDIE' && lineRow?.type === 'REVENUE';
    if (eventId && !isSubventionLine) {
      await BudgetLine.syncFsdieSubvention(eventId);
    }

    // Retourner les lignes complètes à jour pour que le front puisse refresh
    const allLines = eventId
      ? await BudgetLine.findByEventId(eventId)
      : null;

    res.status(200).json({ success: true, data: updatedLine, lines: allLines });
  } catch (error) {
    console.error('Error in updateBudgetLine:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid Request' });
  }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /api/budget-lines/:id
// ─────────────────────────────────────────────────────────────────
exports.deleteBudgetLine = async (req, res) => {
  try {
    const id = req.params.id;

    // Récupérer event_id AVANT la suppression
    const eventId = await getEventIdForLine(id);

    await BudgetService.deleteBudgetLine(id);

    // Sync R14 après suppression
    if (eventId) {
      await BudgetLine.syncFsdieSubvention(eventId);
    }

    res.status(200).json({ success: true, message: 'Budget line deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBudgetLine:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid Request' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PATCH /api/budget-lines/:id/status
// ─────────────────────────────────────────────────────────────────
exports.updateValidationStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Le champ "status" est requis.' });
    }

    // Récupérer event_id avant la mise à jour
    const eventId = await getEventIdForLine(id);

    await BudgetService.updateStatus(id, status);

    // Sync R14 : un REFUSE/APPROUVE change le total éligible
    if (eventId) {
      await BudgetLine.syncFsdieSubvention(eventId);
    }

    // Retourner les lignes complètes à jour
    const allLines = eventId
      ? await BudgetLine.findByEventId(eventId)
      : null;

    res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${status}`,
      lines: allLines
    });
  } catch (error) {
    console.error('Error in updateValidationStatus:', error);
    res.status(400).json({ success: false, message: error.message || 'Statut invalide' });
  }
};
