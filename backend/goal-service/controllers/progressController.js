const { ProgressEntry, Goal } = require('../models');

exports.createProgressEntry = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { date, progressValue, notes } = req.body;
    const userId = req.headers['user-id']; // Assumes user-id is passed in headers

    // Verify goal exists and belongs to user
    const goal = await Goal.findOne({ where: { id: goalId, userId } });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const entry = await ProgressEntry.create({
      goalId,
      userId,
      date: date || new Date().toISOString().split('T')[0],
      progressValue,
      notes
    });

    // Update goal's overall progress to the latest entry
    await goal.update({ progress: progressValue });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProgressEntries = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.headers['user-id'];

    // Verify goal belongs to user
    const goal = await Goal.findOne({ where: { id: goalId, userId } });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const entries = await ProgressEntry.findAll({
      where: { goalId },
      order: [['date', 'DESC']]
    });

    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProgressEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, progressValue, notes } = req.body;
    const userId = req.headers['user-id'];

    const entry = await ProgressEntry.findOne({ where: { id, userId } });
    if (!entry) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    await entry.update({ date, progressValue, notes });
    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProgressEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    const entry = await ProgressEntry.findOne({ where: { id, userId } });
    if (!entry) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    await entry.destroy();
    res.json({ message: 'Progress entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
