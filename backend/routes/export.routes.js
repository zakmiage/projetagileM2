const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');

router.post('/budget', exportController.exportBudget);
router.get('/events/:id/invoices', exportController.exportInvoices);
router.get('/events/:id/fsdie', exportController.exportFsdie);

module.exports = router;
