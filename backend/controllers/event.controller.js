const EventService = require('../services/event.service');

exports.getIcsFeed = async (req, res) => {
    try {
        const events = await EventService.getAllEvents();
        let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Kubik ERP//Events//FR\r\nCALSCALE:GREGORIAN\r\n";
        
        events.forEach(event => {
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };
            
            const startStr = formatDate(event.start_date);
            const endStr = formatDate(event.end_date);
            const creationStr = formatDate(new Date());

            icsContent += "BEGIN:VEVENT\r\n";
            icsContent += `DTSTAMP:${creationStr}\r\n`;
            icsContent += `DTSTART:${startStr}\r\n`;
            if (endStr) {
                icsContent += `DTEND:${endStr}\r\n`;
            }
            icsContent += `SUMMARY:${event.name}\r\n`;
            if (event.description) {
                const desc = event.description.replace(/(\r\n|\n|\r)/gm, "\\n");
                icsContent += `DESCRIPTION:${desc}\r\n`;
            }
            icsContent += `UID:event-${event.id}@kubik.local\r\n`;
            icsContent += "END:VEVENT\r\n";
        });
        
        icsContent += "END:VCALENDAR\r\n";

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="feed.ics"');
        res.status(200).send(icsContent);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await EventService.getAllEvents();
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await EventService.getEventById(req.params.id);
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const newEvent = await EventService.createEvent(req.body);
        res.status(201).json({ success: true, data: newEvent });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const updatedEvent = await EventService.updateEvent(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedEvent });
    } catch (error) {
        if (error.message === 'Événement introuvable') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        await EventService.deleteEvent(req.params.id);
        res.status(200).json({ success: true, message: 'Événement supprimé avec succès' });
    } catch (error) {
        if (error.message === 'Événement introuvable') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.addParticipant = async (req, res) => {
    try {
        const { first_name, last_name, email, is_image_rights_ok } = req.body;
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ success: false, message: 'Prénom, nom et email sont requis.' });
        }
        const participant = await EventService.addParticipant(
            req.params.id,
            { first_name, last_name, email, is_image_rights_ok: !!is_image_rights_ok }
        );
        res.status(201).json({ success: true, data: participant });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.removeParticipant = async (req, res) => {
    try {
        await EventService.removeParticipant(req.params.id, req.params.participantId);
        res.status(200).json({ success: true, message: 'Désinscription réussie' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};