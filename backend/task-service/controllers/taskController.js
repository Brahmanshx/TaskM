const { Task } = require('../models');

// Create Task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    // Assume userId comes from auth middleware (header) or body for now.
    const userId = req.headers['x-user-id'] || req.body.userId; 
    
    if (!userId) {
       // Handle missing user ID
    }

    const task = await Task.create({ title, description, status, userId, dueDate });
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const { dueDate } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (dueDate) where.dueDate = dueDate;

    const tasks = await Task.findAll({ where });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    await task.save();
    
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
