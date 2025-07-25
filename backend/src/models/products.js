const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging:false
});

const products = sequelize.define('products', {
    id: {
        type:DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:true
    },
    name:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    quantity:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    description:{
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.TEXT,
        allowNull:false,
    },
    photo:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    price:{
        type:DataTypes.INTEGER,
        allowNull:false
    }

}, 
{
    tableName: 'products',
    timestamps: false
}
);
module.exports = { products };