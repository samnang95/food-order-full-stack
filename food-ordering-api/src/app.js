require('dotenv').config();
const express = require('express');
const connectDB = require('./db/database');
const app = express();
const port = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware to parse JSON requests
app.use(express.json());

// Public Auth Routes
app.use('/auth', authRoutes);

// Protected User Routes
app.use('/users', userRoutes);



// Connect to MongoDB
connectDB();

// Start the Express server
app.listen(port, () => {
  console.log(`Food Ordering API is running at http://localhost:${port}`);
});