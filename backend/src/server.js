const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./database/db');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const cartRoutes = require('./routes/cartRoutes');
const { products } = require('./models/products');
const orderRoutes = require('./routes/orderRoutes');
const { cart_items } = require('./models/cart_items');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 

app.get('/', (req, res) => {
  res.send('Welcome to Payment Gateway API');
});

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', homeRoutes);
app.use('/api/orders', orderRoutes);

const startServer = async () => {
  try {
    console.log('🔄 Syncing database models...');
    
    // Sync all models
    await products.sync({ force: false });
    console.log('✅ Products table synced successfully');
    
    await cart_items.sync({ force: false });
    console.log('✅ Cart items table synced successfully');
    
    // Add orders sync
    const { orders } = require('./models/orders');
    const { order_items } = require('./models/order_items');
    
    await orders.sync({ force: false });
    console.log('✅ Orders table synced successfully');
    
    await order_items.sync({ force: false });
    console.log('✅ Order items table synced successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();