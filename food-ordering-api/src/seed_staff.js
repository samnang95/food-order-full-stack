require('./config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db/database');
const User = require('./models/userModel');

const staffAccounts = [
  {
    username: 'admin',
    email: 'admin@foodhub.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    username: 'manager',
    email: 'manager@foodhub.com',
    password: 'manager123',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
  },
  {
    username: 'kitchen',
    email: 'kitchen@foodhub.com',
    password: 'kitchen123',
    role: 'kitchen',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80',
  },
  {
    username: 'staff',
    email: 'staff@foodhub.com',
    password: 'staff123',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
  },
];

async function seedStaff() {
  try {
    await connectDB();
    console.log('🌱 Connected to database, seeding staff accounts...\n');

    const salt = await bcrypt.genSalt(10);

    for (const acc of staffAccounts) {
      const existing = await User.findOne({ username: acc.username });
      const hashedPassword = await bcrypt.hash(acc.password, salt);

      if (existing) {
        existing.password = hashedPassword;
        existing.role = acc.role;
        existing.email = acc.email;
        existing.avatar = acc.avatar;
        await existing.save();
        console.log(`✅ Updated existing staff user: ${acc.username} (role: ${acc.role})`);
      } else {
        const newUser = new User({
          username: acc.username,
          email: acc.email,
          password: hashedPassword,
          role: acc.role,
          avatar: acc.avatar,
        });
        await newUser.save();
        console.log(`🎉 Created staff user: ${acc.username} (role: ${acc.role})`);
      }
    }

    console.log('\n✨ Staff account seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed staff accounts:', err);
    process.exit(1);
  }
}

seedStaff();
