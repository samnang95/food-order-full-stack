require('dotenv').config();
const express = require('express');
const http = require('http');
const connectDB = require('./db/database');
const cors = require('cors');
const { initSocket } = require('./socket/socketManager');
const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
initSocket(server);

// Enable CORS for web and mobile clients
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Root & Health Check endpoints
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Food Ordering API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

// Connect to MongoDB
connectDB();

// Start the HTTP server (Express + Socket.IO)
server.listen(port, () => {
  console.log(`Food Ordering API is running at http://localhost:${port}`);
});