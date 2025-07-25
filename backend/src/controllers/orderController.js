const { Sequelize } = require('sequelize');
const { cart_items } = require('../models/cart_items');
const { products } = require('../models/products');
const { orders } = require('../models/orders');
const { order_items } = require('../models/order_items');
const { User } = require('../models/users');
const paymobService = require('../services/paymobService');

// Create order from cart items
const createOrder = async (req, res) => {
  const transaction = await products.sequelize.transaction();
  
  try {
    const userId = req.user.id;

    // Get cart items with product details
    const cartItems = await cart_items.findAll({
      where: { user_id: userId },
      include: [{
        model: products,
        attributes: ['id', 'name', 'price', 'quantity', 'description']
      }],
      transaction
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate total and validate stock
    let totalAmount = 0;
    for (const cartItem of cartItems) {
      const product = cartItem.product;
      
      if (product.quantity < cartItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
          availableStock: product.quantity
        });
      }
      totalAmount += (product.price * cartItem.quantity);
    }

    // Create order
    const order = await orders.create({
      user_id: userId,
      total_amount: totalAmount,
      status: 'pending'
    }, { transaction });

    // Create order items
    for (const cartItem of cartItems) {
      await order_items.create({
        order_id: order.id,
        product_id: cartItem.product.id,
        quantity: cartItem.quantity
      }, { transaction });
    }

    // Create Paymob payment
    try {
      console.log('🔄 Creating Paymob payment...');
      
      // Get auth token
      const authToken = await paymobService.getAuthToken();
      console.log('✅ Got Paymob auth token');
      
      // Prepare order data for Paymob
      const paymobOrderData = {
        totalAmount: totalAmount / 100, // Convert from cents to EGP
        items: cartItems.map(item => ({
          name: item.product.name,
          price: item.product.price / 100, // Convert from cents
          quantity: item.quantity,
          description: item.product.description || ''
        }))
      };

      // Create order on Paymob
      const paymobOrder = await paymobService.createOrder(authToken, paymobOrderData);
      console.log('✅ Created Paymob order:', paymobOrder.id);
      
      // Get user info for payment
      const user = await User.findByPk(userId);
      const userInfo = {
        email: user.email || 'customer@example.com',
        firstName: user.username?.split(' ')[0] || 'Customer',
        lastName: user.username?.split(' ')[1] || '',
        phone: user.phone || '+201000000000'
      };

      // Get payment key
      const paymentKey = await paymobService.getPaymentKey(
        authToken,
        paymobOrder.id,
        paymobOrderData,
        userInfo
      );
      console.log('✅ Got payment key');

      // Update order with Paymob order ID
      await order.update({
        paymob_order_id: paymobOrder.id
      }, { transaction });

      await transaction.commit();

      // Return payment URL for Mobile Wallet integration
      const paymentUrl = paymobService.generatePaymentUrl(paymentKey, paymobOrderData);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.id,
          totalAmount: totalAmount / 100,
          status: order.status,
          paymentKey: paymentKey,
          paymobOrderId: paymobOrder.id,
          paymentUrl: paymentUrl
        }
      });

    } catch (paymobError) {
      console.error('❌ Paymob error:', paymobError);
      
      // Keep the order but mark payment as failed
      await order.update({
        status: 'payment_failed'
      }, { transaction });

      await transaction.commit();

      return res.status(500).json({
        success: false,
        message: 'Order created but payment processing failed',
        orderId: order.id,
        error: paymobError.message
      });
    }

  } catch (error) {
    // Only rollback if transaction hasn't been committed
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Complete order after successful payment
const completeOrder = async (req, res) => {
  const transaction = await products.sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await orders.findOne({
      where: { id: orderId, user_id: userId },
      include: [{
        model: order_items,
        include: [{ model: products }]
      }],
      transaction
    });

    if (!order || order.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Order not found or already processed'
      });
    }

    // Update product stock
    for (const orderItem of order.order_items) {
      await orderItem.product.update({
        quantity: orderItem.product.quantity - orderItem.quantity
      }, { transaction });
    }

    // Clear cart
    await cart_items.destroy({
      where: { user_id: userId },
      transaction
    });

    // Update order status
    await order.update({ status: 'completed' }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Order completed successfully'
    });

  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({
      success: false,
      message: 'Failed to complete order'
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const userOrders = await orders.findAll({
      where: { user_id: userId },
      include: [{
        model: order_items,
        include: [{
          model: products,
          attributes: ['name', 'photo', 'price']
        }]
      }],
      order: [['order_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: userOrders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.total_amount / 100,
        orderDate: order.order_date,
        items: order.order_items.map(item => ({
          name: item.product.name,
          photo: item.product.photo,
          price: item.product.price / 100,
          quantity: item.quantity
        }))
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders'
    });
  }
};

// Enhanced Paymob webhook handler
const handlePaymobWebhook = async (req, res) => {
  try {
    console.log('📥 Paymob webhook received:', req.body);
    
    const data = req.body;
    const signature = req.query.hmac;

    // Verify webhook signature (optional but recommended)
    if (signature) {
      try {
        const isValid = paymobService.verifyWebhookSignature(data, signature);
        if (!isValid) {
          console.warn('⚠️ Invalid webhook signature');
          return res.status(400).json({ error: 'Invalid signature' });
        }
      } catch (sigError) {
        console.warn('⚠️ Signature verification failed:', sigError.message);
      }
    }

    // Extract payment information
    const { 
      success, 
      order, 
      transaction_id,
      amount_cents,
      currency,
      integration_id 
    } = data;

    if (!order || !order.id) {
      console.error('❌ No order ID in webhook data');
      return res.status(400).json({ error: 'Missing order ID' });
    }

    // Find the order in our database
    const dbOrder = await orders.findOne({
      where: { paymob_order_id: order.id.toString() },
      include: [{
        model: order_items,
        include: [{ model: products }]
      }]
    });

    if (!dbOrder) {
      console.error(`❌ Order not found: ${order.id}`);
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log(`📦 Processing order: ${dbOrder.id} (Paymob: ${order.id})`);

    if (success === true) {
      console.log('✅ Payment successful, completing order...');
      
      const transaction = await products.sequelize.transaction();
      
      try {
        // Update product quantities
        for (const orderItem of dbOrder.order_items) {
          const product = orderItem.product;
          const newQuantity = product.quantity - orderItem.quantity;
          
          if (newQuantity < 0) {
            console.warn(`⚠️ Insufficient stock for ${product.name}`);
            // Continue anyway since payment was successful
          }

          await product.update({
            quantity: Math.max(0, newQuantity)
          }, { transaction });
        }

        // Clear user's cart
        await cart_items.destroy({
          where: { user_id: dbOrder.user_id },
          transaction
        });

        // Update order status
        await dbOrder.update({
          status: 'completed'
        }, { transaction });

        await transaction.commit();
        
        console.log('✅ Order completed successfully');
        
      } catch (error) {
        await transaction.rollback();
        console.error('❌ Error completing order:', error);
        
        // Mark as failed but don't return error to Paymob
        await dbOrder.update({ status: 'payment_confirmed_but_failed' });
      }
      
    } else {
      console.log('❌ Payment failed, marking order as failed');
      
      await dbOrder.update({
        status: 'payment_failed'
      });
    }

    // Always return success to Paymob to avoid retries
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed' 
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Return success anyway to avoid Paymob retries
    res.status(200).json({ 
      success: true, 
      error: 'Processing error but acknowledged' 
    });
  }
};

module.exports = {
  createOrder,
  completeOrder,
  getUserOrders,
  handlePaymobWebhook
};