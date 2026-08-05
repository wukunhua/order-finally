const app = require('./app');
const config = require('./config');
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[db] MySQL 连接成功');

    if (config.dbSync) {
      // 开发便利:按模型建表(已存在的表不会被破坏)
      await sequelize.sync();
      console.log('[db] 模型同步完成(如需以 SQL 为准则关闭 DB_SYNC)');
    }
  } catch (err) {
    console.error('[db] MySQL 连接失败:', err.message);
    console.error('请检查 .env 中的 DB_* 配置,并确保已执行 db/init.sql 建库建表。');
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`[server] 已启动: http://localhost:${config.port}`);
    console.log(`[server] 健康检查: http://localhost:${config.port}/api/health`);
  });
}

start();
