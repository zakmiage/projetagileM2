const db = require('../config/db');

class BudgetLine {
  /**
   * Fetch all budget lines for a specific event
   * @param {number} eventId 
   */
  static async findByEventId(eventId) {
    const [rows] = await db.execute('SELECT * FROM budget_lines WHERE event_id = ?', [eventId]);
    return rows;
  }

  /**
   * Create a new budget line
   * @param {Object} data 
   */
  static async create(data) {
    const sql = `
      INSERT INTO budget_lines 
      (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.event_id, 
      data.type, 
      data.category, 
      data.label, 
      data.forecast_amount || 0,
      data.actual_amount || null,
      data.is_fsdie_eligible || 0, // boolean as tinyint
      data.created_by || 1 // Fallback to 1 if no auth is fully wired
    ];
    
    const [result] = await db.execute(sql, values);
    return { id: result.insertId, ...data };
  }

  /**
   * Update an existing budget line (partial update)
   * @param {number} id 
   * @param {Object} data 
   */
  static async update(id, data) {
    const updates = [];
    const values = [];
    
    // Mapping model fields to db columns
    const fieldsMap = {
      type: 'type',
      category: 'category',
      label: 'label',
      forecast_amount: 'forecast_amount',
      actual_amount: 'actual_amount',
      is_fsdie_eligible: 'is_fsdie_eligible',
      validation_status: 'validation_status',
      updated_by: 'updated_by'
    };

    for (const [key, value] of Object.entries(data)) {
      if (fieldsMap[key] !== undefined) {
        updates.push(`${fieldsMap[key]} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE budget_lines SET ${updates.join(', ')} WHERE id = ?`;
    
    await db.execute(sql, values);
    return true;
  }

  /**
   * Delete a budget line
   * @param {number} id 
   */
  static async delete(id) {
    await db.execute('DELETE FROM budget_lines WHERE id = ?', [id]);
    return true;
  }

  /**
   * Met à jour uniquement le statut de validation d'une ligne FSDIE.
   * @param {number} id - ID de la ligne budget
   * @param {'SOUMIS'|'APPROUVE'|'REFUSE'} status
   * @param {object} [dbOverride] - Connexion DB injectable (tests uniquement)
   */
  static async updateStatus(id, status, dbOverride) {
    const validStatuses = ['SOUMIS', 'APPROUVE', 'REFUSE'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Statut invalide : ${status}. Valeurs acceptées : ${validStatuses.join(', ')}`);
    }
    const conn = dbOverride || db;
    await conn.execute(
      'UPDATE budget_lines SET validation_status = ? WHERE id = ?',
      [status, id]
    );
    return true;
  }
}

module.exports = BudgetLine;
