const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false,
  define: {
    underscored: true,    // created_at / updated_at
    timestamps: true,
    freezeTableName: true,
  },
});

module.exports = sequelize;
