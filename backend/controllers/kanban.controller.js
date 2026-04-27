const Kanban = require('../models/kanban.model');

exports.getKanban = async (req, res) => {
  try {
    const data = await Kanban.findByEvent(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createColumn = async (req, res) => {
  try {
    const col = await Kanban.createColumn(req.params.id, req.body);
    res.status(201).json({ success: true, data: col });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateColumn = async (req, res) => {
  try {
    const col = await Kanban.updateColumn(req.params.colId, req.body);
    res.json({ success: true, data: col });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteColumn = async (req, res) => {
  try {
    await Kanban.deleteColumn(req.params.colId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCard = async (req, res) => {
  try {
    const card = await Kanban.createCard(req.params.colId, req.body);
    res.status(201).json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const card = await Kanban.updateCard(req.params.cardId, req.body);
    res.json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.moveCard = async (req, res) => {
  try {
    const { column_id, position } = req.body;
    await Kanban.moveCard(req.params.cardId, column_id, position);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    await Kanban.deleteCard(req.params.cardId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setCardMembers = async (req, res) => {
  try {
    const { member_ids } = req.body;
    await Kanban.setCardMembers(req.params.cardId, member_ids || []);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
