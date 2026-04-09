const DashboardService = require('../services/dashboard.service');

/**
 * GET /api/dashboard/events
 * Retourne la liste de tous les événements (id, name, start_date, end_date, capacity)
 * pour alimenter le sélecteur côté frontend.
 */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await DashboardService.getAllEvents();
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error('Erreur dashboard getAllEvents:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des événements.' });
  }
};

/**
 * GET /api/dashboard/stats/:eventId
 * Retourne les statistiques complètes d'un événement donné.
 */
exports.getEventStats = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'ID d\'événement invalide.' });
    }
    const stats = await DashboardService.getEventStats(eventId);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Erreur dashboard getEventStats:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des statistiques.' });
  }
};

/**
 * GET /api/dashboard/next-event-stats
 * Retourne les statistiques du prochain événement à venir.
 * @deprecated Utiliser /api/dashboard/stats/:eventId à la place.
 */
exports.getNextEventStats = async (req, res) => {
  try {
    const stats = await DashboardService.getNextEventStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Erreur dashboard next-event-stats:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des statistiques du prochain événement.' });
  }
};

/**
 * GET /api/dashboard/stats  (ancienne route, conservée pour rétrocompatibilité)
 * @deprecated
 */
exports.getStats = async (req, res) => {
  return exports.getNextEventStats(req, res);
};
