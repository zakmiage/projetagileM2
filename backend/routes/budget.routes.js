const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');

router.get('/', budgetController.getBudgetLines);
router.post('/', budgetController.createBudgetLine);
router.put('/:id', budgetController.updateBudgetLine);
router.delete('/:id', budgetController.deleteBudgetLine);

module.exports = router;
