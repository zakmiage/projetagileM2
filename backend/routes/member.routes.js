const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');

router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMember);
router.post('/', memberController.createMember);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;
