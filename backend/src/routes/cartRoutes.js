const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get('/', cartController.getCart);

// Add product to cart
router.post('/add', cartController.addToCart);

// Update product quantity in cart
router.put('/update', cartController.updateCartItem);

// Remove product from cart
router.delete('/remove/:productId', cartController.removeFromCart);

module.exports = router;