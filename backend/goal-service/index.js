const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const goalRoutes = require('./routes/goalRoutes');
const progressRoutes = require('./routes/progressRoutes');
const subGoalRoutes = require('./routes/subGoalRoutes');
const subGoalItemRoutes = require('./routes/subGoalItemRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Routes - API Gateway strips /goals, /subgoals, /progress prefixes
app.use('/', goalRoutes); // Handles /goals/...
app.use('/', progressRoutes); // Handles /goals/:id/progress
app.use('/', subGoalRoutes); // Handles /goals/:id/generate-subgoals
app.use('/subgoals', subGoalItemRoutes); // Handles /subgoals/...

// Basic Route
app.get('/health', (req, res) => {
  res.send('Goal Service is running');
});

// Sync DB and Start Server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database connected and synced...');
    app.listen(PORT, () => {
      console.log(`Goal Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('Error: ' + err);
  });
