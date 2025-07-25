const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});

const orders = sequelize.define('orders', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
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
    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    status: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'pending' // pending, completed, failed, cancelled
    },
    total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    paymob_order_id: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: false
});

// Set up associations after defining the model
orders.associate = (models) => {
    orders.hasMany(models.order_items, { foreignKey: 'order_id' });
    orders.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = { orders };