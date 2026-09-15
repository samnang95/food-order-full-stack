const users = require('../data/users');
const User = require('../models/userModel');

const userRepository = {
  findByUsername: (username) => {
    return users.find(u => u.username === username);
  },
  
  findById: (id) => {
    return users.find(u => u.id === id);
  },
  
  create: (username, hashedPassword) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = new User(newId, username, hashedPassword);
    users.push(newUser);
    return newUser;
  }
};

module.exports = userRepository;
