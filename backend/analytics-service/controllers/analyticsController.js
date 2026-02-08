const axios = require('axios');

const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://task-service:3002';
const GOAL_SERVICE_URL = process.env.GOAL_SERVICE_URL || 'http://goal-service:3003';

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID required' });
    }
    
    // Fetch data from services in parallel
    const [tasksRes, goalsRes] = await Promise.all([
        axios.get(`${TASK_SERVICE_URL}/?userId=${userId}`),
        axios.get(`${GOAL_SERVICE_URL}/?userId=${userId}`)
    ]);

    const tasks = tasksRes.data;
    const goals = goalsRes.data;

    // Calculate Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Task Status Distribution
    const taskStatusDistribution = [
        { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
        { name: 'Completed', value: completedTasks },
    ].filter(i => i.value > 0);

    // Goal Progress
    const goalProgress = goals.map(g => ({
        name: g.title,
        progress: g.progress
    }));

    res.json({
        overview: {
            totalTasks,
            completedTasks,
            completionRate,
            totalGoals: goals.length
        },
        taskDistribution: taskStatusDistribution,
        goalProgress
    });

  } catch (error) {
    console.error('Error fetching analytics:', error.message);
    res.status(500).json({ message: 'Failed to aggregate analytics', error: error.message });
  }
};
