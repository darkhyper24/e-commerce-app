const { Sequelize } = require('sequelize');
const { products } = require('../models/products');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const home = async (req, res) => {
  try {
    const allProducts = await products.findAll({
      attributes: ['id', 'name', 'quantity', 'description', 'category', 'photo', 'price']
    });

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: allProducts,
      count: allProducts.length
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: error.message
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // First check if any products exist in this category
    const categoryProducts = await products.findAll({
      where: {
        category: {
          [Sequelize.Op.iLike]: category // Case-insensitive search
        }
      },
      attributes: ['id', 'name', 'quantity', 'description', 'category', 'photo', 'price'],
      order: [['name', 'ASC']]
    });

    if (categoryProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found in category: ${category}`,
        data: [],
        count: 0
      });
    }

    res.status(200).json({
      success: true,
      message: `Products in ${category} category retrieved successfully`,
      data: categoryProducts,
      count: categoryProducts.length,
      category: category
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products by category',
      error: error.message
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await products.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(cat => ({
      name: cat.dataValues.category,
      count: parseInt(cat.dataValues.count)
    }));

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categoryList,
      count: categoryList.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await products.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product',
      error: error.message
    });
  }
};

module.exports = {
  home,
  getProductsByCategory,
  getProductById,
  getCategories
};