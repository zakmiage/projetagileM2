const express = require('express');
const router = express.Router({ mergeParams: true });
const shiftController = require('../controllers/shift.controller');

// Routes sur /api/events/:id/shifts
router.get('/', shiftController.getShifts);
router.post('/', shiftController.createShift);

// Routes sur /api/events/:id/shifts/:shiftId
router.get('/:shiftId/registrations', shiftController.getShiftRegistrations);
router.put('/:shiftId', shiftController.updateShift);
router.delete('/:shiftId', shiftController.deleteShift);
router.post('/:shiftId/register', shiftController.registerToShift);
router.delete('/:shiftId/register', shiftController.unregisterFromShift);

module.exports = router;
