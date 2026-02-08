const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const taskRoutes = require('./routes/taskRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Routes
app.use('/', taskRoutes); // Gateway routes /tasks -> /

// Basic Route
app.get('/health', (req, res) => {
  res.send('Task Service is running');
});

// Sync DB and Start Server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database connected and synced...');
    app.listen(PORT, () => {
      console.log(`Task Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('Error: ' + err);
  });
