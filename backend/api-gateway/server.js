const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// JWT Authentication Middleware
// Verifies the token and injects user ID headers for downstream services
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    // Inject user ID into headers for downstream services
    req.headers['x-user-id'] = String(decoded.id);
    req.headers['user-id'] = String(decoded.id);
    next();
  });
};

// Routes that do NOT require authentication
const publicRoutes = ['/users/auth'];

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

  // Determine if route needs auth
  const isPublic = publicRoutes.some(pub => route.startsWith(pub));

  if (isPublic) {
    // For /users route: apply auth only to non-auth paths
    app.use(route, (req, res, next) => {
      // Skip auth for /users/auth/* (login, register)
      if (req.path.startsWith('/auth')) {
        return next();
      }
      // All other /users/* routes require auth
      authMiddleware(req, res, next);
    }, createProxyMiddleware(proxyOptions));
  } else {
    // All other services require auth
    app.use(route, authMiddleware, createProxyMiddleware(proxyOptions));
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
