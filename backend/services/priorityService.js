const Task = require('../models/Task');
const Goal = require('../models/Goal');

const EFFORT_MAP = { small: 1, medium: 2, large: 3 };

const calculatePriorityScore = (task, goal = null) => {
  // Urgency: based on deadline proximity (0-10 scale)
  const now = new Date();
  const deadline = new Date(task.deadline);
  const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

  let urgency;
  if (hoursUntilDeadline <= 0) {
    urgency = 10; // Overdue
  } else if (hoursUntilDeadline <= 6) {
    urgency = 9;
  } else if (hoursUntilDeadline <= 12) {
    urgency = 8;
  } else if (hoursUntilDeadline <= 24) {
    urgency = 7;
  } else if (hoursUntilDeadline <= 48) {
    urgency = 5;
  } else if (hoursUntilDeadline <= 168) { // 1 week
    urgency = 3;
  } else {
    urgency = 1;
  }

  // Importance: user-defined 1-5, normalize to 0-10
  const importance = (task.importance || 3) * 2;

  // Goal impact: higher if linked to a goal
  let goalImpact = 0;
  if (goal) {
    if (goal.type === 'long-term') goalImpact = 10;
    else if (goal.type === 'short-term') goalImpact = 7;
    else goalImpact = 4;
  } else if (task.goalId) {
    goalImpact = 5; // Has a goal but not loaded
  }

  // Effort: small=1, medium=2, large=3, normalize to 0-10
  const effort = (EFFORT_MAP[task.effort] || 2) * 3.33;

  // Blocked penalty
  const blockedPenalty = task.isBlocked ? 5 : 0;

  // Formula: priorityScore = (urgency * 0.4) + (importance * 0.3) + (goalImpact * 0.2) - (effort * 0.1) - blockedPenalty
  const score = (urgency * 0.4) + (importance * 0.3) + (goalImpact * 0.2) - (effort * 0.1) - blockedPenalty;

  return Math.round(score * 100) / 100;
};

const recalculateTaskPriorities = async (userId) => {
  const tasks = await Task.find({ userId, status: 'pending' });
  const goalIds = [...new Set(tasks.filter(t => t.goalId).map(t => t.goalId.toString()))];
  const goals = await Goal.find({ _id: { $in: goalIds } });
  const goalMap = {};
  goals.forEach(g => { goalMap[g._id.toString()] = g; });

  const bulkOps = tasks.map(task => {
    const goal = task.goalId ? goalMap[task.goalId.toString()] : null;
    const score = calculatePriorityScore(task, goal);
    return {
      updateOne: {
        filter: { _id: task._id },
        update: { $set: { priorityScore: score } },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Task.bulkWrite(bulkOps);
  }
};

module.exports = { calculatePriorityScore, recalculateTaskPriorities };
