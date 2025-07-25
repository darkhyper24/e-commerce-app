const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging:false
});

const order_items = sequelize.define('order_items', {
    id:{
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    order_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    quantity:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
},
{
    tableName: 'order_items',
    timestamps: false
}
);

// Set up associations
order_items.associate = (models) => {
    order_items.belongsTo(models.orders, { foreignKey: 'order_id' });
    order_items.belongsTo(models.products, { foreignKey: 'product_id' });
};

module.exports = { order_items };