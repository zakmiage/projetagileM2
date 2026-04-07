const DashboardService = require('../services/dashboard.service');

exports.getStats = async (req, res) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};
