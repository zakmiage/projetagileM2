const Dashboard = require('../models/dashboard.model');

class DashboardService {
  /**
   * Retourne la liste de tous les événements (pour le sélecteur).
   */
  static async getAllEvents() {
    return Dashboard.getAllEvents();
  }

  /**
   * Retourne les stats complètes d'un événement donné par son ID.
   */
  static async getEventStats(eventId) {
    const event = await Dashboard.getEventById(eventId);
    if (!event) {
      return { hasEvent: false };
    }

    const isPast = new Date(event.end_date) < new Date();

    const [registrationsCount, missingDepositsCount, tShirtSizes, fsdieTotal, fsdieUnjustifiedCount] = await Promise.all([
      Dashboard.getRegistrationsCount(event.id),
      Dashboard.getMissingDepositsCount(event.id),
      Dashboard.getTShirtSizes(event.id),
      Dashboard.getFsdieTotal(event.id),
      isPast ? Dashboard.getFsdieUnjustifiedCount(event.id) : Promise.resolve(null)
    ]);

    return {
      hasEvent: true,
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        capacity: event.capacity
      },
      kpis: {
        registrationsCount,
        capacity: event.capacity,
        fillRate: event.capacity > 0
          ? Math.round((registrationsCount / event.capacity) * 100)
          : null,
        missingDepositsCount,
        tShirtSizes,
        fsdieTotal,
        // null si l'événement n'est pas encore terminé
        fsdieUnjustifiedCount: isPast ? fsdieUnjustifiedCount : null
      }
    };
  }

  /**
   * Récupère les stats du prochain événement à venir.
   * Si aucun événement futur, prend le dernier événement passé.
   * @deprecated Préférer getEventStats(eventId) avec le sélecteur frontend.
   */
  static async getNextEventStats() {
    let event = await Dashboard.getNextEvent();

    // Fallback : si aucun événement futur, récupérer le dernier événement passé
    if (!event) {
      const allEvents = await Dashboard.getAllEvents();
      event = allEvents.length > 0 ? allEvents[0] : null;
    }

    if (!event) {
      return { hasEvent: false };
    }

    return DashboardService.getEventStats(event.id);
  }
}

module.exports = DashboardService;
