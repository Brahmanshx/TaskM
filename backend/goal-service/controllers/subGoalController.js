const { SubGoal, Goal } = require('../models');
const { analyzeGoal } = require('../services/aiService');

exports.generateSubGoals = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.headers['user-id'];

    // Verify goal exists and belongs to user
    const goal = await Goal.findOne({ where: { id: goalId, userId } });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if sub-goals already exist
    const existingSubGoals = await SubGoal.findAll({ where: { goalId } });
    if (existingSubGoals.length > 0) {
      return res.status(400).json({ 
        message: 'Sub-goals already exist for this goal. Delete them first to regenerate.' 
      });
    }

    // Use AI to analyze and generate sub-goals
    const aiSubGoals = await analyzeGoal(goal.title, goal.description);

    // Create sub-goals in database
    const createdSubGoals = await SubGoal.bulkCreate(
      aiSubGoals.map(sg => ({
        goalId,
        title: sg.title,
        description: sg.description,
        order: sg.order,
        completed: false
      }))
    );

    res.status(201).json(createdSubGoals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSubGoals = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.headers['user-id'];

    // Verify goal belongs to user
    const goal = await Goal.findOne({ where: { id: goalId, userId } });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const subGoals = await SubGoal.findAll({
      where: { goalId },
      order: [['order', 'ASC']]
    });

    res.json(subGoals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleSubGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    const subGoal = await SubGoal.findByPk(id, {
      include: [{ model: Goal, as: 'goal' }]
    });

    if (!subGoal || subGoal.goal.userId.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Sub-goal not found' });
    }

    await subGoal.update({ completed: !subGoal.completed });

    // Update parent goal progress
    await updateGoalProgress(subGoal.goalId);

    res.json(subGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSubGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, reminderTime } = req.body;
    const userId = req.headers['user-id'];

    const subGoal = await SubGoal.findByPk(id, {
      include: [{ model: Goal, as: 'goal' }]
    });

    if (!subGoal || subGoal.goal.userId.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Sub-goal not found' });
    }

    await subGoal.update({ 
      title: title !== undefined ? title : subGoal.title, 
      description: description !== undefined ? description : subGoal.description,
      reminderTime: reminderTime !== undefined ? reminderTime : subGoal.reminderTime
    });
    res.json(subGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSubGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    const subGoal = await SubGoal.findByPk(id, {
      include: [{ model: Goal, as: 'goal' }]
    });

    if (!subGoal || subGoal.goal.userId.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Sub-goal not found' });
    }

    const goalId = subGoal.goalId;
    await subGoal.destroy();

    // Update parent goal progress
    await updateGoalProgress(goalId);

    res.json({ message: 'Sub-goal deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createSubGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { title, description, reminderTime } = req.body;
    const userId = req.headers['user-id'];

    // Verify goal belongs to user
    const goal = await Goal.findOne({ where: { id: goalId, userId } });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Get the highest order number
    const maxOrder = await SubGoal.max('order', { where: { goalId } }) || -1;

    const subGoal = await SubGoal.create({
      goalId,
      title,
      description,
      order: maxOrder + 1,
      completed: false,
      reminderTime
    });

    res.status(201).json(subGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update goal progress based on sub-goals
async function updateGoalProgress(goalId) {
  const subGoals = await SubGoal.findAll({ where: { goalId } });
  console.log(`Updating Progress for Goal ${goalId}:`);
  console.log(`- Total Sub-goals: ${subGoals.length}`);
  
  if (subGoals.length === 0) {
    return;
  }

  const completedCount = subGoals.filter(sg => !!sg.completed).length;
  console.log(`- Completed: ${completedCount}`);
  
  const progress = Math.round((completedCount / subGoals.length) * 100);
  console.log(`- Calculated Progress: ${progress}%`);

  const goal = await Goal.findByPk(goalId);
  if (goal) {
    await goal.update({ 
      progress,
      status: progress === 100 ? 'completed' : 'in-progress'
    });
    console.log(`- Goal ${goalId} updated successfully`);
  }
}
