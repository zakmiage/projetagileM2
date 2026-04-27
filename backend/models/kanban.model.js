const db = require('../config/db');

class Kanban {
  /**
   * Récupère le tableau complet d'un événement (colonnes + cartes + membres assignés).
   */
  static async findByEvent(eventId) {
    const [columns] = await db.execute(
      'SELECT * FROM kanban_columns WHERE event_id = ? ORDER BY position ASC',
      [eventId]
    );

    for (const col of columns) {
      const [cards] = await db.execute(
        'SELECT * FROM kanban_cards WHERE column_id = ? ORDER BY position ASC',
        [col.id]
      );
      for (const card of cards) {
        const [members] = await db.execute(`
          SELECT m.id, m.first_name, m.last_name
          FROM kanban_card_members kcm
          JOIN members m ON m.id = kcm.member_id
          WHERE kcm.card_id = ?
        `, [card.id]);
        card.members = members;
      }
      col.cards = cards;
    }

    return columns;
  }

  // --- Colonnes ---

  static async createColumn(eventId, data) {
    const [posRow] = await db.execute(
      'SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM kanban_columns WHERE event_id = ?',
      [eventId]
    );
    const pos = posRow[0].pos;
    const [result] = await db.execute(
      'INSERT INTO kanban_columns (event_id, title, position, color) VALUES (?, ?, ?, ?)',
      [eventId, data.title, pos, data.color || '#6366f1']
    );
    return { id: result.insertId, event_id: eventId, title: data.title, position: pos, color: data.color || '#6366f1', cards: [] };
  }

  static async updateColumn(id, data) {
    await db.execute(
      'UPDATE kanban_columns SET title = ?, color = ? WHERE id = ?',
      [data.title, data.color, id]
    );
    const [rows] = await db.execute('SELECT * FROM kanban_columns WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async deleteColumn(id) {
    const [result] = await db.execute('DELETE FROM kanban_columns WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // --- Cartes ---

  static async createCard(columnId, data) {
    const [posRow] = await db.execute(
      'SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM kanban_cards WHERE column_id = ?',
      [columnId]
    );
    const pos = posRow[0].pos;
    const [result] = await db.execute(
      `INSERT INTO kanban_cards (column_id, title, description, position, label, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [columnId, data.title, data.description || null, pos, data.label || null, data.due_date || null]
    );
    return { id: result.insertId, column_id: columnId, ...data, position: pos, members: [] };
  }

  static async updateCard(id, data) {
    await db.execute(
      `UPDATE kanban_cards SET title = ?, description = ?, label = ?, due_date = ? WHERE id = ?`,
      [data.title, data.description || null, data.label || null, data.due_date || null, id]
    );
    const [rows] = await db.execute('SELECT * FROM kanban_cards WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Déplacer une carte : change de colonne et réajuste les positions.
   */
  static async moveCard(cardId, targetColumnId, targetPosition) {
    await db.execute(
      'UPDATE kanban_cards SET column_id = ?, position = ? WHERE id = ?',
      [targetColumnId, targetPosition, cardId]
    );
    // Réordonner les autres cartes de la colonne cible
    await db.execute(`
      UPDATE kanban_cards
      SET position = position + 1
      WHERE column_id = ? AND id != ? AND position >= ?
    `, [targetColumnId, cardId, targetPosition]);
    return true;
  }

  static async deleteCard(id) {
    const [result] = await db.execute('DELETE FROM kanban_cards WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // --- Membres assignés ---

  static async setCardMembers(cardId, memberIds) {
    await db.execute('DELETE FROM kanban_card_members WHERE card_id = ?', [cardId]);
    for (const mid of memberIds) {
      await db.execute('INSERT IGNORE INTO kanban_card_members (card_id, member_id) VALUES (?, ?)', [cardId, mid]);
    }
    return true;
  }
}

module.exports = Kanban;
