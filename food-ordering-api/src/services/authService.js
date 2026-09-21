const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const userRepository = require('../repositories/userRepository');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'my_refresh_secret_key_123';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authService = {
  register: async (username, password, email) => {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    if (email) {
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        throw new Error('Email already in use');
      }
    }
    
    // 2. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 3. Save the new user
    const newUser = await userRepository.create(username, hashedPassword, email);
    
    // 4. Generate tokens for automatic login after register
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Return user and tokens
    return { token, refreshToken, user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role } };
  },
  
  login: async (username, password) => {
    // 1. Find the user by username or email
    let user = await userRepository.findByUsername(username);
    if (!user) {
      user = await userRepository.findByEmail(username);
    }
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // 3. Generate JWT Token
    // We include the user ID, username and role in the token payload
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' } // Refresh token expires in 7 days
    );
    
    return { token, refreshToken, user: { id: user._id, username: user.username, role: user.role } };
  },

  googleLogin: async (idToken) => {
    // 1. Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];
    
    // 2. Check if user exists by googleId
    let user = await userRepository.findByGoogleId(googleId);
    
    if (!user) {
      // Check if a user with this email already exists
      user = await userRepository.findByEmail(email);
      
      if (user) {
        // Link google account
        user.googleId = googleId;
        await user.save();
      } else {
        // Create new Google user
        let username = name || email.split('@')[0];
        // Ensure username uniqueness
        const existing = await userRepository.findByUsername(username);
        if (existing) {
          username = `${username}_${Date.now()}`;
        }
        
        user = await userRepository.createGoogleUser(username, email, googleId);
      }
    }
    
    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    return { token, refreshToken, user: { id: user._id, username: user.username, email: user.email, role: user.role } };
  },

  appleLogin: async (identityToken, name, clientEmail) => {
    if (!identityToken) {
      throw new Error('Apple identity token is required');
    }

    // 1. Decode Apple identity token
    const decoded = jwt.decode(identityToken, { complete: true });
    if (!decoded || !decoded.payload) {
      throw new Error('Invalid Apple identity token');
    }

    const payload = decoded.payload;
    const appleId = payload.sub;
    if (!appleId) {
      throw new Error('Apple identity token is missing user identifier');
    }

    // Email might be in token or provided on first authorization
    const email = payload.email || clientEmail;

    // 2. Check if user exists by appleId
    let user = await userRepository.findByAppleId(appleId);

    if (!user) {
      // Check if user exists by email
      if (email) {
        user = await userRepository.findByEmail(email);
      }

      if (user) {
        // Link existing account with Apple
        user.appleId = appleId;
        await user.save();
      } else {
        // Create new Apple user
        let baseUsername = name || (email ? email.split('@')[0] : `apple_${appleId.slice(0, 8)}`);
        baseUsername = baseUsername.replace(/\s+/g, '_').toLowerCase();
        let username = baseUsername;

        const existing = await userRepository.findByUsername(username);
        if (existing) {
          username = `${username}_${Date.now().toString().slice(-4)}`;
        }

        user = await userRepository.createAppleUser(username, email || undefined, appleId);
      }
    }

    // 3. Generate JWT Tokens
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  },
  
  refreshToken: async (oldRefreshToken) => {
    try {
      // 1. Verify the refresh token
      const decoded = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET);
      
      // 2. Generate new tokens
      const token = jwt.sign(
        { id: decoded.id, username: decoded.username, role: decoded.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      const newRefreshToken = jwt.sign(
        { id: decoded.id, username: decoded.username, role: decoded.role },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      
      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
};

module.exports = {
  authService,
  JWT_SECRET
};
