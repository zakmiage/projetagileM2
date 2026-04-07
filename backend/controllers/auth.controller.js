const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, role } = req.body;

        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }

        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Cet email est deja utilise.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = `
            INSERT INTO users (email, password_hash, role, first_name, last_name)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.execute(sql, [email, hashedPassword, role || 'user', first_name, last_name]);

        return res.status(201).json({ message: 'Utilisateur cree avec succes.' });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis.' });
        }

        const [rows] = await db.execute(
            'SELECT id, email, password_hash, role, first_name, last_name FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET manquant dans .env.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return res.status(200).json({
            message: 'Connexion reussie.',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
};