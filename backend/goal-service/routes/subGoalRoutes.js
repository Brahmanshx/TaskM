const express = require('express');
const router = express.Router();
const subGoalController = require('../controllers/subGoalController');

// Mounted at root in goal-service (Gateway strips /goals)
router.post('/:goalId/generate-subgoals', subGoalController.generateSubGoals);
router.get('/:goalId/subgoals', subGoalController.getSubGoals);
router.post('/:goalId/subgoals', subGoalController.createSubGoal);

module.exports = router;
