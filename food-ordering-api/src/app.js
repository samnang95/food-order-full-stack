require('dotenv').config();
const express = require('express');
const connectDB = require('./db/database');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

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



// Connect to MongoDB
connectDB();

// Start the Express server
app.listen(port, () => {
  console.log(`Food Ordering API is running at http://localhost:${port}`);
});