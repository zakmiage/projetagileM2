const db = require('../config/db');

class Dashboard {
  /**
   * Étape 1 : Trouve le prochain événement à venir (start_date > NOW())
   */
  static async getNextEvent() {
    const [rows] = await db.execute(
      'SELECT * FROM events WHERE start_date > NOW() ORDER BY start_date ASC LIMIT 1'
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Étape 2 : Compte les inscrits à un événement (remplissage)
   */
  static async getRegistrationsCount(eventId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as total FROM event_registrations WHERE event_id = ?',
      [eventId]
    );
    return parseInt(rows[0].total, 10);
  }

  /**
   * Étape 3 : Compte les inscrits sans caution (has_deposit = false)
   */
  static async getMissingDepositsCount(eventId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as total FROM event_registrations WHERE event_id = ? AND has_deposit = 0',
      [eventId]
    );
    return parseInt(rows[0].total, 10);
  }

  /**
   * Étape 4 : Résumé des tailles de t-shirt pour les inscrits à un événement
   */
  static async getTShirtSizes(eventId) {
    const [rows] = await db.execute(
      `SELECT m.t_shirt_size, COUNT(*) as count
       FROM event_registrations er
       JOIN members m ON er.member_id = m.id
       WHERE er.event_id = ?
       GROUP BY m.t_shirt_size
       ORDER BY m.t_shirt_size ASC`,
      [eventId]
    );
    // Retourne un objet { XS: 2, S: 10, M: 25, L: 5, XL: 1 }
    const sizes = {};
    for (const row of rows) {
      const key = row.t_shirt_size || 'Non renseignée';
      sizes[key] = parseInt(row.count, 10);
    }
    return sizes;
  }

  /**
   * Étape 5 : Total FSDIE (forecast_amount, is_fsdie_eligible = true) pour un événement
   */
  static async getFsdieTotal(eventId) {
    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(forecast_amount), 0) as total
       FROM budget_lines
       WHERE event_id = ? AND is_fsdie_eligible = 1`,
      [eventId]
    );
    return parseFloat(rows[0].total) || 0;
  }
}

module.exports = Dashboard;
