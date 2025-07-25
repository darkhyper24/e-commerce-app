const users = require('./users');
const products = require('./products');
const orders = require('./orders');
const order_items = require('./order_items');
const cart_items = require('./cart_items');

products.hasMany(cart_items, { foreignKey: 'product_id' });
users.hasMany(cart_items, { foreignKey: 'user_id' });
users.hasMany(orders, { foreignKey: 'user_id' });
orders.hasMany(order_items, { foreignKey: 'order_id' });
products.hasMany(order_items, { foreignKey: 'product_id' });


cart_items.belongsTo(products, { foreignKey: 'product_id' });
cart_items.belongsTo(users, { foreignKey: 'user_id' });
orders.belongsTo(users, { foreignKey: 'user_id' });
order_items.belongsTo(orders, { foreignKey: 'order_id' });
order_items.belongsTo(products, { foreignKey: 'product_id' });

module.exports = {users, products, orders, order_items, cart_items};