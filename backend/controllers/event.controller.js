const EventService = require('../services/event.service');

exports.getAllEvents = async (req, res) => {
    try {
        const events = await EventService.getAllEvents();
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await EventService.getEventById(req.params.id);
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const newEvent = await EventService.createEvent(req.body);
        res.status(201).json({ success: true, data: newEvent });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.addParticipant = async (req, res) => {
    try {
        const newReg = await EventService.addParticipant(req.params.id, req.body.memberId);
        res.status(201).json({ success: true, data: newReg });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.removeParticipant = async (req, res) => {
    try {
        await EventService.removeParticipant(req.params.id, req.params.memberId);
        res.status(200).json({ success: true, message: 'Désinscription réussie' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};