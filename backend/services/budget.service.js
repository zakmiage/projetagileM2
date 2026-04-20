const BudgetLine = require('../models/budget.model');

class BudgetService {
  /**
   * Get all budget lines for a given event ID
   * @param {number} eventId 
   */
  static async getBudgetLinesByEvent(eventId) {
    if (!eventId) throw new Error('Event ID is required');
    return await BudgetLine.findByEventId(eventId);
  }

  /**
   * Create a new budget line
   * @param {Object} data 
   */
  static async createBudgetLine(data) {
    if (data.event_id === undefined || data.type === undefined || data.category === undefined || data.label === undefined) {
      throw new Error('Missing required fields');
    }
    return await BudgetLine.create(data);
  }

  /**
   * Update a budget line
   * @param {number} id 
   * @param {Object} data 
   */
  static async updateBudgetLine(id, data) {
    if (!id) throw new Error('Line ID is required');
    await BudgetLine.update(id, data);
    return { id, ...data };
  }

  /**
   * Delete a budget line
   * @param {number} id 
   */
  static async deleteBudgetLine(id) {
    if (!id) throw new Error('Line ID is required');
    return await BudgetLine.delete(id);
  }

  /**
   * Met à jour le statut de validation d'une ligne FSDIE.
   * @param {number} id
   * @param {'SOUMIS'|'APPROUVE'|'REFUSE'} status
   */
  static async updateStatus(id, status) {
    if (!id) throw new Error('Line ID is required');
    return await BudgetLine.updateStatus(id, status);
  }
}

module.exports = BudgetService;
