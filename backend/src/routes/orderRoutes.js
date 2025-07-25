const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');
const paymobService = require('../services/paymobService'); // Add this import

// Protected routes (require authentication)
router.use('/create', authenticateToken);
router.use('/complete', authenticateToken);
router.use('/history', authenticateToken);

// Create order from cart
router.post('/create', orderController.createOrder);

// Complete order (after payment)
router.post('/complete/:orderId', orderController.completeOrder);

// Get user order history
router.get('/history', orderController.getUserOrders);

// Paymob webhook (no authentication needed)
router.post('/webhook/paymob', orderController.handlePaymobWebhook);

// Mobile Wallet Payment Route
router.post('/mobile-wallet-pay', authenticateToken, async (req, res) => {
  try {
    const { paymentKey, walletNumber } = req.body;
    
    if (!paymentKey || !walletNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment key and wallet number are required' 
      });
    }

    // Validate Egyptian mobile number format
    const walletRegex = /^(01)[0-9]{9}$/;
    if (!walletRegex.test(walletNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile wallet number. Use format: 01xxxxxxxxx'
      });
    }

    console.log('📱 Processing mobile wallet payment...');
    const paymentResult = await paymobService.createMobileWalletPayment(paymentKey, walletNumber);

    res.status(200).json({
      success: true,
      message: 'Mobile wallet payment initiated',
      payment: paymentResult
    });

  } catch (error) {
    console.error('❌ Mobile wallet payment error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process mobile wallet payment',
      error: error.message
    });
  }
});

module.exports = router;