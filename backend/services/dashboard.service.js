const Dashboard = require('../models/dashboard.model');

class DashboardService {
  /**
   * Récupère toutes les stats du prochain événement en un seul appel.
   * Retourne un objet avec un flag `hasEvent: false` si aucun événement à venir.
   */
  static async getNextEventStats() {
    const nextEvent = await Dashboard.getNextEvent();

    if (!nextEvent) {
      return { hasEvent: false };
    }

    const eventId = nextEvent.id;

    // Lancer les 4 requêtes KPI en parallèle pour optimiser les performances
    const [registrationsCount, missingDepositsCount, tShirtSizes, fsdieTotal] = await Promise.all([
      Dashboard.getRegistrationsCount(eventId),
      Dashboard.getMissingDepositsCount(eventId),
      Dashboard.getTShirtSizes(eventId),
      Dashboard.getFsdieTotal(eventId)
    ]);

    return {
      hasEvent: true,
      event: {
        id: nextEvent.id,
        name: nextEvent.name,
        description: nextEvent.description,
        start_date: nextEvent.start_date,
        end_date: nextEvent.end_date,
        capacity: nextEvent.capacity
      },
      kpis: {
        // Remplissage : inscrits / capacité
        registrationsCount,
        capacity: nextEvent.capacity,
        fillRate: nextEvent.capacity > 0
          ? Math.round((registrationsCount / nextEvent.capacity) * 100)
          : null,

        // Cautions manquantes
        missingDepositsCount,

        // Tailles T-Shirts
        tShirtSizes,

        // Potentiel FSDIE
        fsdieTotal
      }
    };
  }
}

module.exports = DashboardService;
