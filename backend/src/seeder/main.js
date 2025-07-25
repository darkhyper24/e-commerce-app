require('dotenv').config({ path: '../../.env' });
const { seedProducts } = require('./products');
const { seedUsers } = require('./users');

const runSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await seedUsers();
    await seedProducts();
    
    console.log('✅ All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeeders();
}

module.exports = { runSeeders };