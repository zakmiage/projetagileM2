const db = require('../config/db');

class Event {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM events ORDER BY start_date DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM events WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    
    // Fetch participants as well
    const [registrations] = await db.execute(`
      SELECT er.id as registration_id, er.event_id, er.member_id, er.has_deposit, er.registered_at,
             m.id as member_id, m.first_name, m.last_name, m.email, m.t_shirt_size, m.allergies,
             m.is_certificate_ok, m.is_waiver_ok, m.is_image_rights_ok
      FROM event_registrations er
      JOIN members m ON er.member_id = m.id
      WHERE er.event_id = ?
    `, [id]);

    const event = rows[0];
    event.registrations = registrations.map(r => ({
      id: r.registration_id,
      event_id: r.event_id,
      member_id: r.member_id,
      has_deposit: r.has_deposit === 1,
      registered_at: r.registered_at,
      member: {
        id: r.member_id,
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email,
        t_shirt_size: r.t_shirt_size,
        allergies: r.allergies,
        is_certificate_ok: r.is_certificate_ok === 1,
        is_waiver_ok: r.is_waiver_ok === 1,
        is_image_rights_ok: r.is_image_rights_ok === 1
      }
    }));
    
    return event;
  }

  static async create(data) {
    const sql = `INSERT INTO events (name, description, start_date, end_date, capacity) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name, data.description || null, data.start_date, data.end_date, data.capacity
    ]);
    return { id: result.insertId, ...data };
  }

  static async addParticipant(eventId, memberId) {
    // Check if already registered
    const [existing] = await db.execute('SELECT id FROM event_registrations WHERE event_id = ? AND member_id = ?', [eventId, memberId]);
    if (existing.length > 0) throw new Error('Membre déjà inscrit à cet événement');

    const [result] = await db.execute(`INSERT INTO event_registrations (event_id, member_id, has_deposit) VALUES (?, ?, 0)`, [eventId, memberId]);
    return { id: result.insertId, event_id: eventId, member_id: memberId, has_deposit: false };
  }

  static async removeParticipant(eventId, memberId) {
    await db.execute('DELETE FROM event_registrations WHERE event_id = ? AND member_id = ?', [eventId, memberId]);
    return true;
  }
}

module.exports = Event;
