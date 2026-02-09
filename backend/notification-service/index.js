const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { sequelize, Notification } = require('./models');
const notificationRoutes = require('./routes/notificationRoutes');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Routes
app.use('/', notificationRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'up' }));

// Reminder Processing Worker
// Runs every minute
cron.schedule('* * * * *', async () => {
  console.log('Running reminder check...');
  try {
    const now = new Date();

    // 1. Process Task Reminders
    try {
      const isoNow = now.toISOString();
      console.log(`Checking for tasks due before ${isoNow}`);
      
      const [tasks] = await sequelize.query(
        `SELECT id, title, "userId" FROM "Tasks" 
         WHERE "reminderTime" <= :now 
         AND ("status" != 'completed' OR "status" IS NULL)
         AND "reminderTime" IS NOT NULL`,
        { replacements: { now: isoNow } }
      );

      console.log(`Found ${tasks.length} tasks due for reminder`);

      for (const task of tasks) {
        // Create notification if not already created for this specific moment
        // To prevent duplicate alerts, we'll clear the reminderTime after processing
        const message = `Reminder: ${task.title}`;
        
        await Notification.create({
          userId: task.userId,
          message,
          type: 'reminder',
          referenceId: task.id,
          referenceType: 'task'
        });

        // Clear reminderTime in Task table
        await sequelize.query(
          `UPDATE "Tasks" SET "reminderTime" = NULL WHERE id = :id`,
          { replacements: { id: task.id } }
        );
        console.log(`Notification created for Task ${task.id}`);
      }
    } catch (err) {
      console.error('Error processing task reminders:', err.message);
    }

    // 2. Process SubGoal Reminders
    try {
      const [subGoals] = await sequelize.query(
        `SELECT id, title, "goalId" FROM "SubGoals" 
         WHERE "reminderTime" <= :now 
         AND "completed" = false 
         AND "reminderTime" IS NOT NULL`,
        { replacements: { now: now.toISOString() } }
      );

      for (const sg of subGoals) {
        // We need the userId of the goal
        const [goals] = await sequelize.query(
          `SELECT "userId" FROM "Goals" WHERE id = :id`,
          { replacements: { id: sg.goalId } }
        );

        if (goals.length > 0) {
          const userId = goals[0].userId;
          const message = `Reminder: Milestone "${sg.title}" is due!`;

          await Notification.create({
            userId,
            message,
            type: 'goal',
            referenceId: sg.id,
            referenceType: 'subgoal'
          });

          // Clear reminderTime in SubGoal table
          await sequelize.query(
            `UPDATE "SubGoals" SET "reminderTime" = NULL WHERE id = :id`,
            { replacements: { id: sg.id } }
          );
          console.log(`Notification created for SubGoal ${sg.id}`);
        }
      }
    } catch (err) {
      console.error('Error processing subgoal reminders:', err.message);
    }

  } catch (error) {
    console.error('Cron job fatal error:', error.stack);
  }
});

sequelize.sync().then(async () => {
  console.log('Database synced. Testing connectivity...');
  try {
    const [result] = await sequelize.query('SELECT NOW()');
    console.log('Database connection successful. Current DB time:', result[0].now);
    
    // Check if Tasks table exists
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Available tables:', tables.map(t => t.table_name).join(', '));
  } catch (err) {
    console.error('Database connectivity test failed:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
  });
});
