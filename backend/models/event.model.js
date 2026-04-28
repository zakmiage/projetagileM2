const db = require('../config/db');

class Event {
  static async findAll() {
    // Tous les événements triés par date décroissante (plus récent/futur en premier)
    const [rows] = await db.execute(`
      SELECT * FROM events
      ORDER BY start_date DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM events WHERE id = ?', [id]);
    if (rows.length === 0) return null;

    // Récupération des inscrits (event_participants — entité indépendante des membres)
    const [participants] = await db.execute(`
      SELECT id, event_id, first_name, last_name, email,
             is_image_rights_ok, has_deposit, registered_at
      FROM event_participants
      WHERE event_id = ?
      ORDER BY last_name ASC, first_name ASC
    `, [id]);

    const event = rows[0];
    event.participants = participants.map(p => ({
      id: p.id,
      event_id: p.event_id,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      is_image_rights_ok: p.is_image_rights_ok === 1,
      has_deposit: p.has_deposit === 1,
      registered_at: p.registered_at
    }));

    return event;
  }

  static async create(data) {
    // MySQL DATETIME ne supporte pas le format ISO 8601
    const toMysql = (isoStr) => {
      if (!isoStr) return null;
      return isoStr.replace('T', ' ').substring(0, 19);
    };

    const sql = `INSERT INTO events (name, description, start_date, end_date, capacity) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name, data.description || null,
      toMysql(data.start_date),
      toMysql(data.end_date),
      data.capacity
    ]);
    return { id: result.insertId, ...data };
  }

  static async update(id, data) {
    const toMysql = (isoStr) => {
      if (!isoStr) return null;
      return isoStr.replace('T', ' ').substring(0, 19);
    };

    const [result] = await db.execute(
      `UPDATE events
       SET name = ?, description = ?, start_date = ?, end_date = ?, capacity = ?
       WHERE id = ?`,
      [
        data.name,
        data.description || null,
        toMysql(data.start_date),
        toMysql(data.end_date),
        data.capacity,
        id
      ]
    );

    if (result.affectedRows === 0) return null;
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM events WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Ajoute un inscrit à un événement.
   * Le participant n'a pas besoin d'être un adhérent (members).
   * @param {number} eventId
   * @param {{ first_name, last_name, email, is_image_rights_ok }} data
   */
  static async addParticipant(eventId, data) {
    const { first_name, last_name, email, is_image_rights_ok } = data;

    // Vérifier que l'email n'est pas déjà inscrit à cet event
    const [existing] = await db.execute(
      'SELECT id FROM event_participants WHERE event_id = ? AND email = ?',
      [eventId, email]
    );
    if (existing.length > 0) throw new Error('Cette personne est déjà inscrite à cet événement');

    const [result] = await db.execute(
      `INSERT INTO event_participants (event_id, first_name, last_name, email, is_image_rights_ok, has_deposit)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [eventId, first_name, last_name, email, is_image_rights_ok ? 1 : 0]
    );

    return {
      id: result.insertId,
      event_id: parseInt(eventId),
      first_name,
      last_name,
      email,
      is_image_rights_ok: !!is_image_rights_ok,
      has_deposit: false
    };
  }

  /**
   * Désinscrire un participant par son ID (event_participants.id)
   */
  static async removeParticipant(eventId, participantId) {
    await db.execute(
      'DELETE FROM event_participants WHERE id = ? AND event_id = ?',
      [participantId, eventId]
    );
    return true;
  }
}

module.exports = Event;
