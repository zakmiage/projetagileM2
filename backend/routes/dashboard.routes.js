const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Nouvelle route principale : statistiques du prochain événement
router.get('/next-event-stats', dashboardController.getNextEventStats);

// Ancienne route conservée pour rétrocompatibilité
router.get('/stats', dashboardController.getStats);

module.exports = router;
