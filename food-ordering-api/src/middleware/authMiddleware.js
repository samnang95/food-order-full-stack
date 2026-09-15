const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../services/authService');

const protect = (req, res, next) => {
  let token;
  
  // Check if Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Add the user data from the token to the request object
      // so other routes can use it (e.g., req.user.id)
      req.user = decoded;
      
      // Move to the next middleware or controller
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
