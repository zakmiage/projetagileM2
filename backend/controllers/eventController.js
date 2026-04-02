const db = require('../config/db');

exports.createEvent = async (req, res) => {
    try {
        const { name, description, start_date, end_date, capacity } = req.body;

        if (!name || !start_date || !end_date || capacity === undefined) {
            return res.status(400).json({
                message: 'Les champs name, start_date, end_date et capacity sont requis.'
            });
        }

        const sql = `
            INSERT INTO events (name, description, start_date, end_date, capacity)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            name,
            description || null,
            start_date,
            end_date,
            capacity
        ]);

        return res.status(201).json({
            message: 'Événement créé avec succès.',
            eventId: result.insertId
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur.',
            error: error.message
        });
    }
};