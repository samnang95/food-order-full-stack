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

// Middleware to check if the user has the required roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user comes from the `protect` middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Your role (${req.user?.role || 'unknown'}) does not have access to this resource.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
