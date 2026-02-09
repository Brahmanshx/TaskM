const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cors());
// app.use(express.json()); // Removed to fix proxy issue with POST requests

// Routes
app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

// Proxy routes
const services = [
  { route: '/users', target: process.env.USER_SERVICE_URL },
  { route: '/tasks', target: process.env.TASK_SERVICE_URL },
  { route: '/goals', target: process.env.GOAL_SERVICE_URL },
  { route: '/subgoals', target: process.env.GOAL_SERVICE_URL },
  { route: '/progress', target: process.env.GOAL_SERVICE_URL },
  { route: '/analytics', target: process.env.ANALYTICS_SERVICE_URL },
  { route: '/ai', target: process.env.AI_SERVICE_URL },
  { route: '/notifications', target: process.env.NOTIFICATION_SERVICE_URL },
];

services.forEach(({ route, target }) => {
  const proxyOptions = {
    target,
    changeOrigin: true,
  };

  // Only rewrite if it's not a generic prefix we want to keep
  if (route !== '/subgoals' && route !== '/progress') {
    proxyOptions.pathRewrite = {
      [`^${route}`]: '',
    };
  }

  app.use(route, createProxyMiddleware(proxyOptions));
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
