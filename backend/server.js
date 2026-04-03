const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement AVANT d'importer les modules qui les utilisent
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const db = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const exportRoutes = require('./routes/export.routes');
const budgetRoutes = require('./routes/budget.routes');
const memberRoutes = require('./routes/member.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/budget-lines', budgetRoutes);
app.use('/api/members', memberRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await db.execute('SELECT 1');
    return res.status(200).json({ success: true, message: 'API operationnelle.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur / base de donnees'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});