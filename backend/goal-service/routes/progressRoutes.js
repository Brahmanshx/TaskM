const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// Mounted at root in goal-service (Gateway strips /goals)
// Matches: POST /goals/:goalId/progress
router.post('/:goalId/progress', progressController.createProgressEntry);
router.get('/:goalId/progress', progressController.getProgressEntries);

// These might need /progress prefix in Gateway or different mounting
// Matches: PUT /progress/:id
router.put('/items/:id', progressController.updateProgressEntry);
router.delete('/items/:id', progressController.deleteProgressEntry);

module.exports = router;
