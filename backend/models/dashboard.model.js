const db = require('../config/db');

class Dashboard {
  static async getTotalMembers() {
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM members');
    return rows[0].total;
  }

  static async getUpcomingEventsCount() {
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM events WHERE start_date > NOW()');
    return rows[0].total;
  }

  static async getFinancialBalance() {
    const [rows] = await db.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'REVENUE' THEN actual_amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN actual_amount ELSE 0 END), 0) as balance
      FROM budget_lines 
      WHERE actual_amount IS NOT NULL
    `);
    return rows[0].balance || 0;
  }

  static async getUpcomingEvents() {
    // using LIMIT 3 directly to avoid mysql2 placeholder string casting issues with LIMIT
    const [rows] = await db.execute('SELECT id, name, start_date, capacity FROM events WHERE start_date > NOW() ORDER BY start_date ASC LIMIT 3');
    return rows;
  }
}

module.exports = Dashboard;
