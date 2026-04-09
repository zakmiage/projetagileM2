const db = require('../config/db');

class Dashboard {
  /**
   * Retourne tous les événements triés par date décroissante (le plus récent en premier)
   */
  static async getAllEvents() {
    const [rows] = await db.execute(
      'SELECT id, name, start_date, end_date, capacity FROM events ORDER BY start_date DESC'
    );
    return rows;
  }

  /**
   * Retourne le prochain événement à venir (start_date > NOW()).
   * Utilisé pour initialiser le dashboard sur l'event le plus récent à venir.
   */
  static async getNextEvent() {
    const [rows] = await db.execute(
      'SELECT * FROM events WHERE start_date > NOW() ORDER BY start_date ASC LIMIT 1'
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Retourne un événement par son ID
   */
  static async getEventById(eventId) {
    const [rows] = await db.execute(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Compte les inscrits à un événement (remplissage)
   */
  static async getRegistrationsCount(eventId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as total FROM event_registrations WHERE event_id = ?',
      [eventId]
    );
    return parseInt(rows[0].total, 10);
  }

  /**
   * Compte les inscrits sans caution (has_deposit = false)
   */
  static async getMissingDepositsCount(eventId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as total FROM event_registrations WHERE event_id = ? AND has_deposit = 0',
      [eventId]
    );
    return parseInt(rows[0].total, 10);
  }

  /**
   * Résumé des tailles de t-shirt pour les inscrits à un événement
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
    const sizes = {};
    for (const row of rows) {
      const key = row.t_shirt_size || 'Non renseignée';
      sizes[key] = parseInt(row.count, 10);
    }
    return sizes;
  }

  /**
   * Total FSDIE (forecast_amount, is_fsdie_eligible = true) pour un événement
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

  /**
   * Compte les lignes FSDIE éligibles sans justificatif joint (budget_attachments).
   * Une ligne est non justifiée si aucun fichier n'est attaché dans budget_attachments.
   * Pertinent uniquement pour les événements passés (end_date < NOW()).
   */
  static async getFsdieUnjustifiedCount(eventId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total
       FROM budget_lines bl
       WHERE bl.event_id = ?
         AND bl.is_fsdie_eligible = 1
         AND NOT EXISTS (
           SELECT 1 FROM budget_attachments ba WHERE ba.budget_line_id = bl.id
         )`,
      [eventId]
    );
    return parseInt(rows[0].total, 10);
  }
}

module.exports = Dashboard;
