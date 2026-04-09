const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Liste de tous les événements (pour le sélecteur du dashboard)
router.get('/events', dashboardController.getAllEvents);

// Statistiques d'un événement spécifique par son ID
router.get('/stats/:eventId', dashboardController.getEventStats);

// Route principale : statistiques du prochain événement (conservée pour rétrocompatibilité)
router.get('/next-event-stats', dashboardController.getNextEventStats);

// Ancienne route conservée pour rétrocompatibilité
router.get('/stats', dashboardController.getStats);

module.exports = router;
