const BudgetService = require('../services/budget.service');

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

exports.createBudgetLine = async (req, res) => {
  try {
    const newLine = await BudgetService.createBudgetLine(req.body);
    res.status(201).json({ success: true, data: newLine });
  } catch (error) {
    console.error('Error in createBudgetLine:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid Request' });
  }
};

exports.updateBudgetLine = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedLine = await BudgetService.updateBudgetLine(id, req.body);
    res.status(200).json({ success: true, data: updatedLine });
  } catch (error) {
    console.error('Error in updateBudgetLine:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid Request' });
  }
};

exports.deleteBudgetLine = async (req, res) => {
  try {
    const id = req.params.id;
    await BudgetService.deleteBudgetLine(id);
    res.status(200).json({ success: true, message: 'Budget line deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBudgetLine:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid Request' });
  }
};

exports.updateValidationStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Le champ "status" est requis.' });
    }

    await BudgetService.updateStatus(id, status);
    res.status(200).json({ success: true, message: `Statut mis à jour : ${status}` });
  } catch (error) {
    console.error('Error in updateValidationStatus:', error);
    res.status(400).json({ success: false, message: error.message || 'Statut invalide' });
  }
};
