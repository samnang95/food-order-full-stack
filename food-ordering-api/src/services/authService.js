const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';

const authService = {
  register: async (username, password) => {
    // 1. Check if user already exists
    const existingUser = userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // 2. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 3. Save the new user
    const newUser = userRepository.create(username, hashedPassword);
    
    // Return user without password
    return { id: newUser.id, username: newUser.username };
  },
  
  login: async (username, password) => {
    // 1. Find the user
    const user = userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // 3. Generate JWT Token
    // We include the user ID and username in the token payload
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    
    return { token, user: { id: user.id, username: user.username } };
  }
};

module.exports = {
  authService,
  JWT_SECRET
};
