const { Goal, SubGoal } = require('../models');

exports.createGoal = async (req, res) => {
  try {
    const { title, description, targetDate, status, progress } = req.body;
    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const goal = await Goal.create({ 
        title, 
        description, 
        targetDate, 
        status, 
        progress, 
        userId 
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const where = userId ? { userId } : {};
    const goals = await Goal.findAll({ 
      where,
      include: [{ model: SubGoal, as: 'subGoals' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, status, progress } = req.body;
    const goal = await Goal.findByPk(id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await goal.update({ title, description, targetDate, status, progress });
    res.json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findByPk(id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await goal.destroy();
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
