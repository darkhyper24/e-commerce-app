const bcrypt = require('bcrypt');
const { User } = require('../models/users');
require('dotenv').config({ path: '../../.env' });
const seedUsers = async () => {
  try {


    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '+1234567890'
      },
      {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        phone: '+1234567891'
      },
      {
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        phone: '+1234567892'
      },
      {
        username: 'bob_wilson',
        email: 'bob.wilson@example.com',
        password: hashedPassword,
        phone: '+1234567893'
      },
      {
        username: 'alice_johnson',
        email: 'alice.johnson@example.com',
        password: hashedPassword,
        phone: null 
      },
      {
        username: 'mike_brown',
        email: 'mike.brown@example.com',
        password: hashedPassword,
        phone: '+1234567894'
      },
      {
        username: 'sarah_davis',
        email: 'sarah.davis@example.com',
        password: hashedPassword,
        phone: '+1234567895'
      },
      {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        phone: '+1234567896'
      }
    ];

    await User.bulkCreate(users);
    console.log('✅ Users seeded successfully');
    console.log(`📊 Created ${users.length} users`);
    console.log('🔑 Default password for all users: password123');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
};

module.exports = { seedUsers };