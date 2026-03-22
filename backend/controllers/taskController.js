const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Streak = require('../models/Streak');
const { calculatePriorityScore } = require('../services/priorityService');

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const taskData = { ...req.body, userId: req.userId };

    // Calculate priority score
    let goal = null;
    if (taskData.goalId) {
      goal = await Goal.findById(taskData.goalId);
    }
    taskData.priorityScore = calculatePriorityScore(taskData, goal);

    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, sort, goalId, date } = req.query;
    const filter = { userId: req.userId };

    if (status) filter.status = status;
    if (goalId) filter.goalId = goalId;

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      filter.deadline = { $gte: dayStart, $lte: dayEnd };
    }

    let sortOption = { priorityScore: -1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };
    if (sort === 'importance') sortOption = { importance: -1 };
    if (sort === 'created') sortOption = { createdAt: -1 };

    const tasks = await Task.find(filter).sort(sortOption).populate('goalId', 'title type');
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId }).populate('goalId', 'title type');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    Object.assign(task, req.body);

    // Recalculate priority
    let goal = null;
    if (task.goalId) {
      goal = await Goal.findById(task.goalId);
    }
    task.priorityScore = calculatePriorityScore(task, goal);

    await task.save();
    const populated = await task.populate('goalId', 'title type');
    res.json(populated);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// PATCH /api/tasks/:id/complete
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    task.completedAt = task.status === 'completed' ? new Date() : null;
    await task.save();

    // Update streak
    if (task.status === 'completed') {
      await updateStreak(req.userId);
    }

    // Update goal progress
    if (task.goalId) {
      await updateGoalProgress(task.goalId);
    }

    const populated = await task.populate('goalId', 'title type');
    res.json(populated);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Failed to toggle task completion' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Update goal progress
    if (task.goalId) {
      await updateGoalProgress(task.goalId);
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// GET /api/tasks/suggestions
const getTaskSuggestions = async (req, res) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Get overdue and upcoming tasks
    const urgentTasks = await Task.find({
      userId: req.userId,
      status: 'pending',
      deadline: { $lte: threeDaysLater },
    }).sort({ deadline: 1 }).limit(5);

    // Get high priority tasks
    const highPriorityTasks = await Task.find({
      userId: req.userId,
      status: 'pending',
    }).sort({ priorityScore: -1 }).limit(5);

    // Merge and deduplicate
    const taskMap = new Map();
    [...urgentTasks, ...highPriorityTasks].forEach(t => taskMap.set(t._id.toString(), t));

    res.json(Array.from(taskMap.values()).slice(0, 8));
  } catch (error) {
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
};

// Helper: Update streak
const updateStreak = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = await Streak.findOne({ userId, date: today });

  if (!streak) {
    // Check yesterday's streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStreak = await Streak.findOne({ userId, date: yesterday });

    const currentStreak = (yesterdayStreak?.currentStreak || 0) + 1;
    const longestStreak = Math.max(currentStreak, yesterdayStreak?.longestStreak || 0);

    streak = await Streak.create({
      userId,
      date: today,
      tasksCompleted: 1,
      currentStreak,
      longestStreak,
    });
  } else {
    streak.tasksCompleted += 1;
    await streak.save();
  }
};

// Helper: Update goal progress
const updateGoalProgress = async (goalId) => {
  const totalTasks = await Task.countDocuments({ goalId });
  const completedTasks = await Task.countDocuments({ goalId, status: 'completed' });
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const goal = await Goal.findByIdAndUpdate(goalId, { progress }, { new: true });

  // If goal is complete and has a parent, update parent too
  if (goal && goal.parentGoalId) {
    await updateParentGoalProgress(goal.parentGoalId);
  }
};

// Helper: Update parent goal progress (recursive)
const updateParentGoalProgress = async (parentGoalId) => {
  const childGoals = await Goal.find({ parentGoalId });
  if (childGoals.length === 0) return;

  const avgProgress = Math.round(childGoals.reduce((sum, g) => sum + g.progress, 0) / childGoals.length);
  const parent = await Goal.findByIdAndUpdate(parentGoalId, { progress: avgProgress }, { new: true });

  if (parent && parent.parentGoalId) {
    await updateParentGoalProgress(parent.parentGoalId);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, completeTask, deleteTask, getTaskSuggestions };
