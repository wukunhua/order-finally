// 初始化默认管理员账号(可重复执行,只会创建/更新密码)
// 用法: cd server && npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Dish } = require('../src/models');
const config = require('../src/config');

async function seedAdmin() {
  const { username, password } = config.admin;
  const passwordHash = await bcrypt.hash(password, 10);

  const [user, created] = await User.findOrCreate({
    where: { username },
    defaults: {
      username,
      passwordHash,
      role: 'admin',
      status: 'active',
      nickname: '系统管理员',
    },
  });

  if (!created) {
    // 已存在则更新密码与角色,确保可用
    user.passwordHash = passwordHash;
    user.role = 'admin';
    user.status = 'active';
    await user.save();
    console.log(`[seed] 管理员已存在,已重置密码: ${username} / ${password}`);
  } else {
    console.log(`[seed] 已创建管理员: ${username} / ${password}`);
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    await seedAdmin();
    console.log('[seed] 完成');
    process.exit(0);
  } catch (err) {
    console.error('[seed] 失败:', err.message);
    console.error('请先建库并执行 db/init.sql,再运行本脚本。');
    process.exit(1);
  }
}

main();
