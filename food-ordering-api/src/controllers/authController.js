const { authService } = require('../services/authService');

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await authService.register(username, password, email);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const { token, user } = await authService.login(username, password);
    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }
    
    const result = await authService.googleLogin(token);
    res.json({ message: 'Google login successful', token: result.token, user: result.user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const logout = (req, res) => {
  // With JWT, the server doesn't actually store a session to destroy.
  // Logging out is typically handled on the frontend by simply deleting the token.
  // However, we can provide an endpoint to return a success message.
  res.json({ message: 'Logout successful. Please delete your token on the client side.' });
};

module.exports = {
  register,
  login,
  googleLogin,
  logout
};
