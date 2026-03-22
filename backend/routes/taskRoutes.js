const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTask, updateTask, completeTask, deleteTask, getTaskSuggestions } = require('../controllers/taskController');
const { validateTask } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.get('/suggestions', getTaskSuggestions);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

module.exports = router;
