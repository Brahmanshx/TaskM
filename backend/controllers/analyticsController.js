const Task = require('../models/Task');
const Streak = require('../models/Streak');

// GET /api/analytics/productivity
const getProductivity = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const dailyStats = [];
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const completed = await Task.countDocuments({
        userId: req.userId,
        status: 'completed',
        completedAt: { $gte: dayStart, $lte: dayEnd },
      });

      const created = await Task.countDocuments({
        userId: req.userId,
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        completed,
        created,
      });
    }

    // Overall stats
    const totalTasks = await Task.countDocuments({ userId: req.userId });
    const completedTasks = await Task.countDocuments({ userId: req.userId, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ userId: req.userId, status: 'pending' });
    const overdueTasks = await Task.countDocuments({
      userId: req.userId,
      status: 'pending',
      deadline: { $lt: new Date() },
    });

    res.json({
      dailyStats,
      overview: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Productivity analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

// GET /api/analytics/streaks
const getStreaks = async (req, res) => {
  try {
    const latestStreak = await Streak.findOne({ userId: req.userId }).sort({ date: -1 });
    const allStreaks = await Streak.find({ userId: req.userId }).sort({ date: -1 }).limit(30);

    res.json({
      currentStreak: latestStreak?.currentStreak || 0,
      longestStreak: latestStreak?.longestStreak || 0,
      history: allStreaks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch streaks' });
  }
};

module.exports = { getProductivity, getStreaks };
