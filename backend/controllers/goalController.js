const Goal = require('../models/Goal');
const Task = require('../models/Task');

// POST /api/goals
const createGoal = async (req, res) => {
  try {
    const goalData = { ...req.body, userId: req.userId };
    const goal = await Goal.create(goalData);
    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Failed to create goal' });
  }
};

// GET /api/goals
const getGoals = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = { userId: req.userId };

    if (type) filter.type = type;
    if (status) filter.status = status || 'active';

    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .populate('parentGoalId', 'title type');

    // Attach task counts and child goal counts
    const goalsWithMeta = await Promise.all(
      goals.map(async (goal) => {
        const totalTasks = await Task.countDocuments({ goalId: goal._id });
        const completedTasks = await Task.countDocuments({ goalId: goal._id, status: 'completed' });
        const childGoals = await Goal.countDocuments({ parentGoalId: goal._id });

        return {
          ...goal.toObject(),
          totalTasks,
          completedTasks,
          childGoals,
        };
      })
    );

    res.json(goalsWithMeta);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Failed to fetch goals' });
  }
};

// GET /api/goals/:id
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId })
      .populate('parentGoalId', 'title type');

    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const tasks = await Task.find({ goalId: goal._id }).sort({ priorityScore: -1 });
    const childGoals = await Goal.find({ parentGoalId: goal._id });

    res.json({ ...goal.toObject(), tasks, childGoals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goal' });
  }
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('parentGoalId', 'title type');

    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Failed to update goal' });
  }
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    // Unlink tasks from this goal
    await Task.updateMany({ goalId: goal._id }, { $set: { goalId: null } });

    // Unlink child goals
    await Goal.updateMany({ parentGoalId: goal._id }, { $set: { parentGoalId: null } });

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete goal' });
  }
};

// GET /api/goals/:id/children
const getGoalChildren = async (req, res) => {
  try {
    const childGoals = await Goal.find({ parentGoalId: req.params.id, userId: req.userId });
    const tasks = await Task.find({ goalId: req.params.id, userId: req.userId }).sort({ priorityScore: -1 });
    res.json({ childGoals, tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch children' });
  }
};

module.exports = { createGoal, getGoals, getGoal, updateGoal, deleteGoal, getGoalChildren };
