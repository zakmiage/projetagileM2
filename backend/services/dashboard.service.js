const Dashboard = require('../models/dashboard.model');

class DashboardService {
  static async getDashboardStats() {
    const [totalMembers, upcomingEventsCount, financialBalance, upcomingEvents] = await Promise.all([
      Dashboard.getTotalMembers(),
      Dashboard.getUpcomingEventsCount(),
      Dashboard.getFinancialBalance(),
      Dashboard.getUpcomingEvents()
    ]);

    return {
      totalMembers,
      upcomingEventsCount,
      financialBalance,
      upcomingEvents
    };
  }
}

module.exports = DashboardService;
