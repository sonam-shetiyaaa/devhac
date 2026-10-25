const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const apiRoutes = require('./routes/api');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for visibility
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Root route info
app.get('/', (req, res) => {
  res.json({
    service: 'TripRescue AI - Travel Disruption Recovery Engine',
    version: '1.0.0',
    platform: 'TripRescue AI Autonomous Recovery System',
    endpoints: {
      trips: '/api/trips',
      disruptions: '/api/disruptions',
      recoveryAnalyze: '/api/recovery/analyze',
      status: '/api/status'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[TripRescue Server Error]', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
const server = app.listen(config.PORT, () => {
  console.log(`====================================================`);
  console.log(` TripRescue AI Backend running on port ${config.PORT}`);
  console.log(` Environment: ${config.NODE_ENV}`);
  console.log(` REST API URL: http://localhost:${config.PORT}/api`);
  console.log(`====================================================`);
});

module.exports = { app, server };
