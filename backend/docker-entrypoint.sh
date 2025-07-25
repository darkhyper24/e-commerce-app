echo "Waiting for database..."
sleep 10

echo "Checking if database needs seeding..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkAndSeed() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Check if products table exists and has data
    const result = await client.query('SELECT COUNT(*) FROM products');
    const productCount = parseInt(result.rows[0].count);
    client.release();
    
    console.log(\`Found \${productCount} products in database\`);
    
    if (productCount === 0) {
      console.log('🌱 No products found. Running seeders...');
      const { runSeeders } = require('./src/seeder/main');
      await runSeeders();
      console.log('✅ Seeding completed');
    } else {
      console.log('✅ Database already seeded. Skipping seeder.');
    }
  } catch (err) {
    console.error('Error checking database:', err);
    console.log('⚠️ Continuing without seeding...');
  }
}

checkAndSeed();
"

echo "Starting Node.js server..."
node src/server.js