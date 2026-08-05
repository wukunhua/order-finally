const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define(
  'order_item',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'order_id' },
    dishId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'dish_id' },
    dishName: { type: DataTypes.STRING(128), allowNull: false, field: 'dish_name' },
    cookingMethod: { type: DataTypes.STRING(128), allowNull: true, field: 'cooking_method' },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  { tableName: 'order_items', timestamps: true, updatedAt: false }
);

module.exports = OrderItem;
