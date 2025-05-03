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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth routes (public) - Function-based pathRewrite
app.use('/api/auth', createProxyMiddleware({
  target: config.services.identity,
  changeOrigin: true,
  pathRewrite: function(path, req) {
    // Use originalUrl which contains the full path including the parts Express consumed
    const newPath = req.originalUrl.replace(/^\/api\/auth/, '/auth');
    console.log(`Rewriting path from ${req.originalUrl} to ${newPath}`);
    return newPath;
  },
  logLevel: 'debug'
}));

// User routes (protected) - Function-based pathRewrite
app.use('/api/users', authMiddleware, createProxyMiddleware({
  target: config.services.identity,
  changeOrigin: true,
  pathRewrite: function(path, req) {
    const newPath = req.originalUrl.replace(/^\/api\/users/, '/users');
    console.log(`Rewriting path from ${req.originalUrl} to ${newPath}`);
    return newPath;
  }
}));

// Events routes (protected) - Function-based pathRewrite
app.use('/api/events', authMiddleware, createProxyMiddleware({
  target: config.services.events,
  changeOrigin: true,
  pathRewrite: function(path, req) {
    const newPath = req.originalUrl.replace(/^\/api\/events/, '/events');
    console.log(`Rewriting path from ${req.originalUrl} to ${newPath}`);
    return newPath;
  }
}));

// Invitations routes (protected) - Function-based pathRewrite
app.use('/api/invitations', authMiddleware, createProxyMiddleware({
  target: config.services.invitations,
  changeOrigin: true,
  pathRewrite: function(path, req) {
    const newPath = req.originalUrl.replace(/^\/api\/invitations/, '/invitations');
    console.log(`Rewriting path from ${req.originalUrl} to ${newPath}`);
    return newPath;
  }
}));

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