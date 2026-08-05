const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Dish = require('./Dish');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// ---- 关联 ----
Category.hasMany(Dish, { foreignKey: 'category_id', as: 'dishes' });
Dish.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Dish, { foreignKey: 'dish_id', as: 'dish' });

module.exports = { sequelize, User, Category, Dish, Order, OrderItem };
