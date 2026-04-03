const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

router.post('/budget', exportController.exportBudget);

module.exports = router;
