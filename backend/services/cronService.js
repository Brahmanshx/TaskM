const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const Streak = require('../models/Streak');
const { sendReminderEmail, sendDailySummaryEmail } = require('./emailService');
const { recalculateTaskPriorities } = require('./priorityService');

const initCronJobs = () => {
  // Recalculate priorities every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Recalculating task priorities...');
    try {
      const users = await User.find({});
      for (const user of users) {
        await recalculateTaskPriorities(user._id);
      }
    } catch (error) {
      console.error('[CRON] Priority recalculation error:', error.message);
    }
  });

  // Task reminders — check every 30 minutes for tasks due within 1 hour
  cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Checking for upcoming deadlines...');
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const urgentTasks = await Task.find({
        status: 'pending',
        deadline: { $gte: now, $lte: oneHourLater },
      }).populate('userId');

      for (const task of urgentTasks) {
        if (task.userId && task.userId.email) {
          await sendReminderEmail(task.userId.email, task);
        }
      }
    } catch (error) {
      console.error('[CRON] Reminder error:', error.message);
    }
  });

  // Daily summary at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Sending daily summaries...');
    try {
      const users = await User.find({});
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      for (const user of users) {
        const pendingCount = await Task.countDocuments({ userId: user._id, status: 'pending' });
        const overdueCount = await Task.countDocuments({
          userId: user._id,
          status: 'pending',
          deadline: { $lt: now },
        });
        const completedYesterday = await Task.countDocuments({
          userId: user._id,
          status: 'completed',
          completedAt: { $gte: yesterday, $lt: todayStart },
        });
        const streak = await Streak.findOne({ userId: user._id }).sort({ date: -1 });

        await sendDailySummaryEmail(user.email, {
          pendingCount,
          overdueCount,
          completedYesterday,
          streak: streak?.currentStreak || 0,
        });
      }
    } catch (error) {
      console.error('[CRON] Daily summary error:', error.message);
    }
  });

  // Create recurring tasks at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Creating recurring tasks...');
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();

      // Daily recurring tasks
      const dailyTasks = await Task.find({ isRecurring: true, recurringPattern: 'daily', status: 'completed' });
      for (const task of dailyTasks) {
        const newDeadline = new Date(now);
        newDeadline.setHours(23, 59, 59, 999);

        await Task.create({
          userId: task.userId,
          title: task.title,
          description: task.description,
          deadline: newDeadline,
          importance: task.importance,
          effort: task.effort,
          goalId: task.goalId,
          isRecurring: true,
          recurringPattern: 'daily',
          timeBlock: task.timeBlock,
        });
      }

      // Weekly recurring tasks (on Mondays)
      if (dayOfWeek === 1) {
        const weeklyTasks = await Task.find({ isRecurring: true, recurringPattern: 'weekly', status: 'completed' });
        for (const task of weeklyTasks) {
          const newDeadline = new Date(now);
          newDeadline.setDate(newDeadline.getDate() + 7);
          newDeadline.setHours(23, 59, 59, 999);

          await Task.create({
            userId: task.userId,
            title: task.title,
            description: task.description,
            deadline: newDeadline,
            importance: task.importance,
            effort: task.effort,
            goalId: task.goalId,
            isRecurring: true,
            recurringPattern: 'weekly',
            timeBlock: task.timeBlock,
          });
        }
      }
    } catch (error) {
      console.error('[CRON] Recurring tasks error:', error.message);
    }
  });

  console.log('✅ Cron jobs initialized');
};

module.exports = { initCronJobs };
