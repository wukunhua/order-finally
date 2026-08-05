// 创建/重置一个 Web 管理员账号
// 用法: node scripts/create-admin.js <用户名> <密码> [昵称]
// 示例: node scripts/create-admin.js boss MyPass123 老板
//   - 用户名不存在 → 新建一个 role=admin 的账号
//   - 用户名已存在 → 重置密码并确保是 admin 角色(可用来改密码)
const path = require('path');
// 用绝对路径加载 .env,任何目录下运行都能读到(配合 src/config/index.js 的同样改动)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

async function main() {
  const [, , username, password, nickname] = process.argv;
  if (!username || !password) {
    console.log('用法: node scripts/create-admin.js <用户名> <密码> [昵称]');
    console.log('示例: node scripts/create-admin.js boss MyPass123 老板');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const [user, created] = await User.findOrCreate({
    where: { username },
    defaults: {
      username,
      passwordHash: hash,
      role: 'admin',
      status: 'active',
      nickname: nickname || username,
    },
  });

  if (created) {
    console.log(`[create-admin] 已创建管理员: ${username}`);
  } else {
    // 已存在则重置密码、确保 admin
    user.passwordHash = hash;
    user.role = 'admin';
    user.status = 'active';
    if (nickname) user.nickname = nickname;
    await user.save();
    console.log(`[create-admin] 账号已存在,已重置密码并设为管理员: ${username}`);
  }

  await sequelize.close();
  process.exit(0);
}

main().catch((e) => {
  console.error('[create-admin] 失败:', e.message);
  process.exit(1);
});
