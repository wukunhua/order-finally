const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define(
  'user',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    openid: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    nickname: { type: DataTypes.STRING(64), allowNull: true },
    avatarUrl: { type: DataTypes.STRING(512), allowNull: true, field: 'avatar_url' },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
    username: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: true, field: 'password_hash' },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active',
    },
    sessionKey: { type: DataTypes.STRING(128), allowNull: true, field: 'session_key' },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: 'last_login_at' },
  },
  { tableName: 'users' }
);

module.exports = User;
