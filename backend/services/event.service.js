const Event = require('../models/event.model');

class EventService {
  static async getAllEvents() {
    return await Event.findAll();
  }

  static async getEventById(id) {
    const event = await Event.findById(id);
    if (!event) throw new Error('Événement introuvable');
    return event;
  }

  static async createEvent(data) {
    if (!data.name || !data.start_date || !data.end_date || data.capacity === undefined) {
      throw new Error('Les champs name, start_date, end_date et capacity sont requis.');
    }
    return await Event.create(data);
  }

  static async addParticipant(eventId, memberId) {
    return await Event.addParticipant(eventId, memberId);
  }

  static async removeParticipant(eventId, memberId) {
    return await Event.removeParticipant(eventId, memberId);
  }
}

module.exports = EventService;
