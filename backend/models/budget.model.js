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
  /**
   * Synchronise les lignes automatiques (Subvention FSDIE et Fonds propres).
   * Appelé automatiquement après chaque mutation.
   * @param {number} eventId
   */
  static async syncAutoLines(eventId) {
    // 1. SYNCHRONISER LA SUBVENTION FSDIE
    // Récupérer les infos de l'événement pour le calcul au forfait
    const [eventRows] = await db.execute('SELECT name, start_date, end_date, capacity FROM events WHERE id = ?', [eventId]);
    const eventInfo = eventRows[0];
    
    let isWei = false;
    let isGala = false;
    let isSport = false;
    let days = 1;

    if (eventInfo) {
      const lowerName = eventInfo.name.toLowerCase();
      isWei = lowerName.includes('wei') || lowerName.includes('intégration') || lowerName.includes('wes');
      isGala = lowerName.includes('gala');
      isSport = lowerName.includes('sport') || lowerName.includes('ski');

      if (eventInfo.start_date && eventInfo.end_date) {
        const start = new Date(eventInfo.start_date);
        const end = new Date(eventInfo.end_date);
        days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      }
    }

    let fsdieForecast = 0;
    let fsdieActual = null;

    // Calcul du nombre de participants (prévisionnel vs réel)
    const forecastCount = eventInfo?.capacity || 0;
    const [participantRows] = await db.execute('SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?', [eventId]);
    const actualCount = Number(participantRows[0].count) || 0;

    // Fonction de calcul du plafond selon le règlement de l'UB
    const calculateFsdie = (count) => {
      if (isWei) {
        // WEI / Séjours intégratifs : Plafond de 15€ par étudiant (quelle que soit la durée)
        return 15 * count;
      } else if (isGala) {
        // Gala : 15€ par étudiant jusqu'à 250, puis 7.50€ par étudiant supplémentaire
        if (count <= 250) {
          return 15 * count;
        } else {
          return (15 * 250) + (7.5 * (count - 250));
        }
      } else if (isSport) {
        // Séjours / Événements sportifs : 15€ par étudiant et par jour (max 3 jours)
        const sportDays = Math.min(days, 3);
        return 15 * count * sportDays;
      }
      // Si n'entre dans aucun critère, pas de financement FSDIE
      return 0;
    };

    fsdieForecast = calculateFsdie(forecastCount);
    // On calcule le réel seulement s'il y a des inscrits ou s'il y a eu au moins une dépense réelle (pour déclencher la logique de clôture)
    fsdieActual = (actualCount > 0) ? calculateFsdie(actualCount) : null;

    const [existingFsdie] = await db.execute(`
      SELECT id FROM budget_lines
      WHERE event_id = ? AND type = 'REVENUE' AND category = 'Subvention FSDIE'
      LIMIT 1
    `, [eventId]);

    if (existingFsdie.length > 0) {
      if (fsdieForecast === 0 && (fsdieActual === 0 || fsdieActual === null)) {
        await db.execute('DELETE FROM budget_lines WHERE id = ?', [existingFsdie[0].id]);
      } else {
        await db.execute(`
          UPDATE budget_lines
          SET forecast_amount = ?, actual_amount = ?, updated_at = NOW()
          WHERE id = ?
        `, [fsdieForecast, fsdieActual, existingFsdie[0].id]);
      }
    } else if (fsdieForecast > 0 || fsdieActual > 0) {
      await db.execute(`
        INSERT INTO budget_lines
          (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, validation_status, created_by)
        VALUES (?, 'REVENUE', 'Subvention FSDIE', 'Subvention FSDIE envisagée (R14)', ?, ?, 0, 'SOUMIS', 1)
      `, [eventId, fsdieForecast, fsdieActual]);
    }

    // 2. SYNCHRONISER LES FONDS PROPRES (Équilibrage)
    const [expenseRows] = await db.execute(`
      SELECT
        SUM(forecast_amount) AS total_forecast,
        SUM(actual_amount) AS total_actual,
        COUNT(CASE WHEN actual_amount IS NOT NULL THEN 1 END) AS has_actual_count
      FROM budget_lines
      WHERE event_id = ? AND type = 'EXPENSE'
    `, [eventId]);

    const totalExpForecast = Number(expenseRows[0]?.total_forecast) || 0;
    const hasExpActual = Number(expenseRows[0]?.has_actual_count) > 0;
    const totalExpActual = hasExpActual ? (Number(expenseRows[0]?.total_actual) || 0) : null;

    const [revenueRows] = await db.execute(`
      SELECT
        SUM(forecast_amount) AS total_forecast,
        SUM(actual_amount) AS total_actual,
        COUNT(CASE WHEN actual_amount IS NOT NULL THEN 1 END) AS has_actual_count
      FROM budget_lines
      WHERE event_id = ? AND type = 'REVENUE' AND category != 'Fonds propres'
    `, [eventId]);

    const totalRevForecast = Number(revenueRows[0]?.total_forecast) || 0;
    const hasRevActual = Number(revenueRows[0]?.has_actual_count) > 0;
    const totalRevActual = hasRevActual ? (Number(revenueRows[0]?.total_actual) || 0) : null;

    const fpForecast = Math.max(0, totalExpForecast - totalRevForecast);
    let fpActual = null;
    if (hasExpActual || hasRevActual) {
       const eActual = totalExpActual || 0;
       const rActual = totalRevActual || 0;
       fpActual = Math.max(0, eActual - rActual);
    }

    const [existingFp] = await db.execute(`
      SELECT id FROM budget_lines
      WHERE event_id = ? AND type = 'REVENUE' AND category = 'Fonds propres'
      LIMIT 1
    `, [eventId]);

    if (existingFp.length > 0) {
      await db.execute(`
        UPDATE budget_lines
        SET forecast_amount = ?, actual_amount = ?, updated_at = NOW()
        WHERE id = ?
      `, [fpForecast, fpActual, existingFp[0].id]);
    } else if (fpForecast > 0 || (fpActual !== null && fpActual > 0)) {
      await db.execute(`
        INSERT INTO budget_lines
          (event_id, type, category, label, forecast_amount, actual_amount, is_fsdie_eligible, validation_status, created_by)
        VALUES (?, 'REVENUE', 'Fonds propres', 'Apport de l\\'association', ?, ?, 0, 'APPROUVE', 1)
      `, [eventId, fpForecast, fpActual]);
    }
  }
}

module.exports = BudgetLine;
