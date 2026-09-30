/**
 * FashionForge — Express Server
 * Core backend entry point providing REST API and static asset hosting.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB, getDbStatus } = require('./config/db');
const designRoutes = require('./routes/designRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, '..', 'frontend');

// Core Middleware
app.use(express.json());
app.use(express.static(frontendPath));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'ok',
    message: 'FashionForge backend is running',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// REST API Routes
app.use('/api/designs', designRoutes);

// HTML Page Route Handlers
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/design', (req, res) => {
  res.sendFile(path.join(frontendPath, 'design.html'));
});

app.get('/my-designs', (req, res) => {
  res.sendFile(path.join(frontendPath, 'my-designs.html'));
});

// Global Error Handler
app.use(errorHandler);

let server = null;

// Initialize Database Connection and start server if executed directly
const startServer = async () => {
  try {
    await connectDB();
  } catch (dbErr) {
    console.error('[FashionForge Startup] Warning: Running without active MongoDB connection.');
    console.error('[FashionForge Startup] API endpoints requiring MongoDB will return error states.');
  }

  server = app.listen(PORT, () => {
    console.log(`FashionForge atelier backend is running on http://localhost:${PORT}`);
  });
  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer
};