const express = require('express');
const router = express.Router();
const { createGoal, getGoals, getGoal, updateGoal, deleteGoal, getGoalChildren } = require('../controllers/goalController');
const { validateGoal } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateGoal, createGoal);
router.get('/', getGoals);
router.get('/:id', getGoal);
router.get('/:id/children', getGoalChildren);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
