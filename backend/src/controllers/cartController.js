const { Sequelize } = require('sequelize');
const { cart_items } = require('../models/cart_items');
const { products } = require('../models/products');
const { User } = require('../models/users');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get cart items with product details
    const cartItems = await cart_items.findAll({
      where: { user_id: userId },
      include: [{
        model: products,
        attributes: ['id', 'name', 'price', 'photo', 'quantity', 'description', 'category']
      }]
    });

    // Transform cart items to match frontend format
    const transformedItems = cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price / 100, // Convert from cents to dollars
      image: item.product.photo,
      description: item.product.description,
      category: item.product.category,
      quantity: item.quantity,
      maxStock: item.product.quantity // Include available stock
    }));

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: transformedItems
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: error.message
    });
  }
};

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and has enough stock
    const product = await products.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if requested quantity is valid
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Check if there's enough stock
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available',
        availableStock: product.quantity
      });
    }

    // Check if product already exists in cart
    const existingCartItem = await cart_items.findOne({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (existingCartItem) {
      // Calculate new quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      // Check if new quantity exceeds available stock
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Adding this quantity would exceed available stock',
          availableStock: product.quantity,
          currentQuantity: existingCartItem.quantity
        });
      }

      // Update existing cart item
      await existingCartItem.update({
        quantity: newQuantity
      });

      return res.status(200).json({
        success: true,
        message: 'Product quantity updated in cart',
        data: {
          productId,
          quantity: newQuantity
        }
      });
    }

    // Add new product to cart
    const cartItem = await cart_items.create({
      user_id: userId,
      product_id: productId,
      quantity,
      added_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Product added to cart',
      data: {
        productId,
        quantity
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
      error: error.message
    });
  }
};

// Update product quantity in cart
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    // Check if requested quantity is valid
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove item from cart
      return removeFromCart(req, res);
    }

    // Check if product exists and has enough stock
    const product = await products.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if there's enough stock
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available',
        availableStock: product.quantity
      });
    }

    // Check if product exists in cart
    const cartItem = await cart_items.findOne({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    // Update cart item
    await cartItem.update({
      quantity
    });

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        productId,
        quantity
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Remove product from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Handle both DELETE request params and POST/PUT request body
    const productId = req.params.productId || req.body.productId;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists in cart
    const cartItem = await cart_items.findOne({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    // Remove product from cart
    await cartItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      data: {
        productId
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};