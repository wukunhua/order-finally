const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define(
  'order',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    orderNo: { type: DataTypes.STRING(32), allowNull: false, field: 'order_no' },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'served', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    remark: { type: DataTypes.STRING(255), allowNull: true },
    orderDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'order_date' },
    itemCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'item_count' },
  },
  { tableName: 'orders' }
);

module.exports = Order;
