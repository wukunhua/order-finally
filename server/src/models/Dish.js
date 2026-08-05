const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Dish = sequelize.define(
  'dish',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'category_id' },
    name: { type: DataTypes.STRING(128), allowNull: false },
    description: { type: DataTypes.STRING(512), allowNull: true },
    cookingMethod: { type: DataTypes.STRING(128), allowNull: true, field: 'cooking_method' },
    calories: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, comment: '热量(千卡)' },
    imageUrl: { type: DataTypes.STRING(512), allowNull: true, field: 'image_url' },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
  },
  { tableName: 'dishes' }
);

module.exports = Dish;
