const express = require('express');
const router = express.Router();
const subGoalController = require('../controllers/subGoalController');

// These will be mounted under /subgoals in goal-service (or directly if Gateway proxies correctly)
router.put('/:id/toggle', subGoalController.toggleSubGoal);
router.put('/:id', subGoalController.updateSubGoal);
router.delete('/:id', subGoalController.deleteSubGoal);

module.exports = router;
