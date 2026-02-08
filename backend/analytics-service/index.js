const express = require('express');
const cors = require('cors');
const analyticsRoutes = require('./routes/analyticsRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Routes
app.use('/', analyticsRoutes); // Gateway routes /analytics -> /

// Basic Route
app.get('/health', (req, res) => {
  res.send('Analytics Service is running');
});

app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
});
