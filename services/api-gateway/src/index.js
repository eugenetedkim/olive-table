// services/api-gateway/src/index.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware } = require('./middleware/auth');
const config = require('./config');

const app = express();

// Global middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health check (define before the proxy to ensure it's handled locally)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth verification middleware - returns Promise<boolean>
const isAuthenticated = async (req, res) => {
  return new Promise((resolve) => {
    authMiddleware(req, res, () => {
      // If we reach here, auth passed
      resolve(true);
    });
  }).catch(() => {
    // If auth middleware threw or called next(err)
    return false;
  });
};

// Single proxy at root level that handles all routes
app.use('/', async (req, res, next) => {
  const path = req.originalUrl;
  
  // Skip the health endpoint
  if (path === '/health') {
    return next();
  }
  
  // Auth paths - no auth required
  if (path.startsWith('/api/auth')) {
    createProxyMiddleware({
      target: config.services.identity,
      changeOrigin: true,
      // No path rewrite needed for auth routes
    })(req, res, next);
    return;
  }
  
  // Protected routes need auth check
  if (path.startsWith('/api/events') || path.startsWith('/api/invitations')) {
    try {
      // Apply auth middleware
      const authed = await new Promise((resolve) => {
        authMiddleware(req, res, () => resolve(true));
      }).catch(() => false);
      
      if (!authed) {
        // Auth middleware would have responded with 401/403
        return;
      }
      
      // Auth passed, determine target and path rewriting
      let target;
      let pathRewrite;
      
      if (path.startsWith('/api/events')) {
        target = config.services.events;
        req.url = req.url.replace(/^\/api\/events/, '/events');
        console.log(`Rewriting ${path} to ${req.url}`);
      } else if (path.startsWith('/api/invitations')) {
        target = config.services.invitations;
        req.url = req.url.replace(/^\/api\/invitations/, '/api');
        console.log(`Rewriting ${path} to ${req.url}`);
      }
      
      // Forward the request
      createProxyMiddleware({
        target,
        changeOrigin: true
      })(req, res, next);
    } catch (err) {
      next(err);
    }
    return;
  }
  
  // Pass through for any other routes
  next();
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});