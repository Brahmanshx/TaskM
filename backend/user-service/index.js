const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/', userRoutes); // Exposes /profile

// Basic Route
app.get('/health', (req, res) => {
  res.send('User Service is running');
});

// Sync DB and Start Server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database connected and synced...');
    app.listen(PORT, () => {
      console.log(`User Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('Error: ' + err);
  });
