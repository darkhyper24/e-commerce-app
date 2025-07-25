const { DataTypes } = require('sequelize');
const db = require('../database/db');
const { User } = require('./users');
const { products } = require('./products');

const sequelize = db.sequelize;

const cart_items = sequelize.define('cart_items', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  added_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'cart_items',
  timestamps: false
});

// Set up associations
cart_items.belongsTo(User, { foreignKey: 'user_id' });
cart_items.belongsTo(products, { foreignKey: 'product_id' });

module.exports = { cart_items };