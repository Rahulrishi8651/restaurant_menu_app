/**
 * RestaurantOS — Express Server Entry Point
 * Configures middleware, routes, and starts the HTTP server.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Route imports
const authRoutes   = require('./routes/authRoutes');
const menuRoutes   = require('./routes/menuRoutes');
const orderRoutes  = require('./routes/orderRoutes');
const adminRoutes  = require('./routes/adminRoutes');
const userRoutes   = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Parsing Middleware ─────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image serving
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ── Static file serving (uploaded images) ────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate Limiting ─────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/menu',  menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// ── Error Handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 RestaurantOS server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app; // for testing
