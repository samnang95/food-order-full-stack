const { flavor, shortFlavor } = require('./config/env');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./db/database');
const cors = require('cors');
const { initSocket } = require('./socket/socketManager');
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
initSocket(server);

// Enable CORS for web and mobile clients
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Root & Health Check endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Food Ordering API is running',
    flavor: shortFlavor,
    environment: flavor,
  });
});

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

app.get('/health', (req, res) => {
  const dbState = DB_STATES[mongoose.connection.readyState] || 'unknown';
  res.json({
    status: 'ok',
    database: dbState,
    flavor: shortFlavor,
    environment: flavor,
    port: Number(port),
    timestamp: new Date().toISOString(),
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const groupOrderRoutes = require('./routes/groupOrderRoutes');
const driverTipRoutes = require('./routes/driverTipRoutes');
const dietaryRoutes = require('./routes/dietaryRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const accountRoutes = require('./routes/accountRoutes');
const supportRoutes = require('./routes/supportRoutes');

// Public Auth Routes
app.use('/auth', authRoutes);

// Protected User Routes
app.use('/users', userRoutes);

// Food/Product Routes
app.use('/foods', foodRoutes);

// Category Routes
app.use('/categories', categoryRoutes);

// Order Routes
app.use('/orders', orderRoutes);

// Upload Routes
app.use('/upload', uploadRoutes);

// Voucher & Promo Code Routes
app.use('/vouchers', voucherRoutes);

// In-App Push Notification Routes
app.use('/notifications', notificationRoutes);

// Collaborative Group Order Routes
app.use('/group-orders', groupOrderRoutes);

// Driver Tip & Feedback Routes
app.use('/driver-tips', driverTipRoutes);

// Dietary & Allergen Profile Routes
app.use('/dietary', dietaryRoutes);

// Live Delivery Tracking Routes
app.use('/tracking', trackingRoutes);

// Customer Reviews & Food Ratings Routes
app.use('/reviews', reviewRoutes);

// Cloud Account Sync (Saved Addresses & Favorite Dishes)
app.use('/account', accountRoutes);

// Customer Support, Help Center & Issue Reporting Routes
app.use('/support', supportRoutes);

// Payment & Bakong KHQR Routes
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/payments', paymentRoutes);

// 404 Route Handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Centralized JSON Error Handler (prevents stack leak in production)
app.use((err, req, res, next) => {
  console.error('💥 [Server Error]:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Connect to MongoDB
connectDB();

// Start the HTTP server (Express + Socket.IO) bound to 0.0.0.0
server.listen(port, host, () => {
  console.log(`Food Ordering API is running at http://${host}:${port}`);
});

// Graceful shutdown handling for container and cloud deployments
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 [Shutdown] Received ${signal}. Closing HTTP and WebSocket connections...`);
  server.close(async () => {
    console.log('🔌 [Shutdown] HTTP/WebSocket server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('🍃 [Shutdown] MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('❌ [Shutdown] Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });

  // Force shutdown if connections do not close within 10s
  setTimeout(() => {
    console.error('⚠️ [Shutdown] Forced shutdown after 10s timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));