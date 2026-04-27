const Shift = require('../models/shift.model');

exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.findByEvent(req.params.id);
    res.json({ success: true, data: shifts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getShiftRegistrations = async (req, res) => {
  try {
    const registrations = await Shift.findRegistrations(req.params.shiftId);
    res.json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createShift = async (req, res) => {
  try {
    const shift = await Shift.create(req.params.id, req.body);
    res.status(201).json({ success: true, data: shift });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.update(req.params.shiftId, req.body);
    if (!shift) return res.status(404).json({ success: false, message: 'Créneau introuvable' });
    res.json({ success: true, data: shift });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    await Shift.delete(req.params.shiftId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.registerToShift = async (req, res) => {
  try {
    const { member_id } = req.body;
    if (!member_id) return res.status(400).json({ success: false, message: 'member_id requis' });
    const reg = await Shift.register(req.params.shiftId, member_id);
    res.status(201).json({ success: true, data: reg });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

exports.unregisterFromShift = async (req, res) => {
  try {
    const { member_id } = req.body;
    await Shift.unregister(req.params.shiftId, member_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
