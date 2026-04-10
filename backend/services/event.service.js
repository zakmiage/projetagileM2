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

  static async updateEvent(id, data) {
    if (!data.name || !data.start_date || !data.end_date || data.capacity === undefined) {
      throw new Error('Les champs name, start_date, end_date et capacity sont requis.');
    }

    const updatedEvent = await Event.update(id, data);
    if (!updatedEvent) throw new Error('Événement introuvable');
    return updatedEvent;
  }

  static async deleteEvent(id) {
    const deleted = await Event.delete(id);
    if (!deleted) throw new Error('Événement introuvable');
    return true;
  }

  /**
   * @param {number} eventId
   * @param {{ first_name, last_name, email, is_image_rights_ok }} data
   */
  static async addParticipant(eventId, data) {
    return await Event.addParticipant(eventId, data);
  }

  static async removeParticipant(eventId, participantId) {
    return await Event.removeParticipant(eventId, participantId);
  }
}

module.exports = EventService;
