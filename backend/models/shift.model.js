const db = require('../config/db');

class Shift {
  /**
   * Récupère tous les shifts d'un événement avec le nombre d'inscrits.
   */
  static async findByEvent(eventId) {
    const [rows] = await db.execute(`
      SELECT s.*,
        COUNT(sr.id) AS registered_count
      FROM shifts s
      LEFT JOIN shift_registrations sr ON sr.shift_id = s.id
      WHERE s.event_id = ?
      GROUP BY s.id
      ORDER BY s.start_time ASC
    `, [eventId]);
    return rows;
  }

  /**
   * Récupère les membres inscrits à un shift.
   */
  static async findRegistrations(shiftId) {
    const [rows] = await db.execute(`
      SELECT sr.id, sr.registered_at, m.id AS member_id, m.first_name, m.last_name, m.email
      FROM shift_registrations sr
      JOIN members m ON m.id = sr.member_id
      WHERE sr.shift_id = ?
      ORDER BY sr.registered_at ASC
    `, [shiftId]);
    return rows;
  }

  static async create(eventId, data) {
    const toMysql = (iso) => iso ? iso.replace('T', ' ').substring(0, 19) : null;
    const [result] = await db.execute(
      `INSERT INTO shifts (event_id, label, start_time, end_time, capacity) VALUES (?, ?, ?, ?, ?)`,
      [eventId, data.label, toMysql(data.start_time), toMysql(data.end_time), data.capacity ?? 10]
    );
    return { id: result.insertId, event_id: eventId, ...data };
  }

  static async update(id, data) {
    const toMysql = (iso) => iso ? iso.replace('T', ' ').substring(0, 19) : null;
    await db.execute(
      `UPDATE shifts SET label = ?, start_time = ?, end_time = ?, capacity = ? WHERE id = ?`,
      [data.label, toMysql(data.start_time), toMysql(data.end_time), data.capacity, id]
    );
    return this.findById(id);
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM shifts WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM shifts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Inscrit un membre à un shift.
   * Vérifie : doublon, capacité max, conflit horaire.
   */
  static async register(shiftId, memberId) {
    // Récupérer les infos du shift cible
    const shift = await this.findById(shiftId);
    if (!shift) throw Object.assign(new Error('Créneau introuvable'), { status: 404 });

    // Vérifier doublon
    const [existing] = await db.execute(
      'SELECT id FROM shift_registrations WHERE shift_id = ? AND member_id = ?',
      [shiftId, memberId]
    );
    if (existing.length > 0) throw Object.assign(new Error('Vous êtes déjà inscrit à ce créneau'), { status: 409 });

    // Vérifier capacité
    const [countRows] = await db.execute(
      'SELECT COUNT(*) AS cnt FROM shift_registrations WHERE shift_id = ?', [shiftId]
    );
    if (countRows[0].cnt >= shift.capacity) {
      throw Object.assign(new Error('Ce créneau est complet'), { status: 409 });
    }

    // Vérifier conflits horaires avec les autres shifts du même event
    const [conflicts] = await db.execute(`
      SELECT s.label, s.start_time, s.end_time
      FROM shift_registrations sr
      JOIN shifts s ON s.id = sr.shift_id
      WHERE sr.member_id = ?
        AND s.event_id = ?
        AND s.id != ?
        AND s.start_time < ?
        AND s.end_time > ?
    `, [memberId, shift.event_id, shiftId, shift.end_time, shift.start_time]);

    if (conflicts.length > 0) {
      const c = conflicts[0];
      throw Object.assign(
        new Error(`Conflit horaire avec le créneau "${c.label}"`),
        { status: 409 }
      );
    }

    const [result] = await db.execute(
      'INSERT INTO shift_registrations (shift_id, member_id) VALUES (?, ?)',
      [shiftId, memberId]
    );
    return { id: result.insertId, shift_id: shiftId, member_id: memberId };
  }

  /**
   * Désinscrire un membre d'un shift.
   */
  static async unregister(shiftId, memberId) {
    const [result] = await db.execute(
      'DELETE FROM shift_registrations WHERE shift_id = ? AND member_id = ?',
      [shiftId, memberId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Shift;
