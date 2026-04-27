const express = require('express');
const router = express.Router({ mergeParams: true });
const kanbanController = require('../controllers/kanban.controller');

// /api/events/:id/kanban
router.get('/', kanbanController.getKanban);
router.post('/columns', kanbanController.createColumn);
router.put('/columns/:colId', kanbanController.updateColumn);
router.delete('/columns/:colId', kanbanController.deleteColumn);

router.post('/columns/:colId/cards', kanbanController.createCard);
router.put('/cards/:cardId', kanbanController.updateCard);
router.put('/cards/:cardId/move', kanbanController.moveCard);
router.delete('/cards/:cardId', kanbanController.deleteCard);
router.put('/cards/:cardId/members', kanbanController.setCardMembers);

module.exports = router;
