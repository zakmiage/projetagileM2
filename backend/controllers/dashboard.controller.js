const DashboardService = require('../services/dashboard.service');

/**
 * GET /api/dashboard/next-event-stats
 * Retourne toutes les statistiques du prochain événement à venir.
 */
exports.getNextEventStats = async (req, res) => {
  try {
    const stats = await DashboardService.getNextEventStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur dashboard next-event-stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques du prochain événement.'
    });
  }
};

/**
 * GET /api/dashboard/stats  (ancienne route, conservée pour rétrocompatibilité)
 * @deprecated Utiliser /api/dashboard/next-event-stats à la place.
 */
exports.getStats = async (req, res) => {
  return exports.getNextEventStats(req, res);
};
