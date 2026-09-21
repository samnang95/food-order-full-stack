const { authService } = require('../services/authService');

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const { token, refreshToken, user } = await authService.register(username, password, email);
    res.status(201).json({ message: 'User registered successfully', token, refreshToken, user });
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
    
    const { token, refreshToken, user } = await authService.login(username, password);
    res.json({ message: 'Login successful', token, refreshToken, user });
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
    res.json({ message: 'Google login successful', token: result.token, refreshToken: result.refreshToken, user: result.user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const appleLogin = async (req, res) => {
  try {
    const { token, name, email } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Apple identity token is required' });
    }
    
    const result = await authService.appleLogin(token, name, email);
    res.json({
      message: 'Apple login successful',
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user
    });
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

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    const tokens = await authService.refreshToken(refreshToken);
    res.json({ message: 'Token refreshed successfully', token: tokens.token, refreshToken: tokens.refreshToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  appleLogin,
  logout,
  refresh
};
