const db = require('../config/db');

class Member {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM members ORDER BY id DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM members WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const sql = `
      INSERT INTO members 
      (first_name, last_name, email, t_shirt_size, allergies, is_certificate_ok, is_waiver_ok, is_image_rights_ok) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.first_name,
      data.last_name,
      data.email,
      data.t_shirt_size || null,
      data.allergies || null,
      data.is_certificate_ok ? 1 : 0,
      data.is_waiver_ok ? 1 : 0,
      data.is_image_rights_ok ? 1 : 0
    ];
    const [result] = await db.execute(sql, values);
    return { id: result.insertId, ...data };
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    
    const fieldsMap = {
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      t_shirt_size: 't_shirt_size',
      allergies: 'allergies',
      is_certificate_ok: 'is_certificate_ok',
      is_waiver_ok: 'is_waiver_ok',
      is_image_rights_ok: 'is_image_rights_ok'
    };

    for (const [key, value] of Object.entries(data)) {
      if (fieldsMap[key] !== undefined) {
        updates.push(`${fieldsMap[key]} = ?`);
        if (typeof value === 'boolean') {
           values.push(value ? 1 : 0);
        } else {
           values.push(value);
        }
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE members SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, values);
    return true;
  }

  static async delete(id) {
    await db.execute('DELETE FROM members WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Member;
