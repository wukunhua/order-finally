# 后端 server (Express + Sequelize)

## 运行
```bash
npm install
cp .env.example .env      # 修改 DB_PASSWORD 等
npm run seed              # 创建默认管理员 admin/admin123
npm run dev               # http://localhost:3000
```

## 目录
```
src/
├── config/        # 环境配置 + sequelize 实例
├── models/        # User/Category/Dish/Order/OrderItem
├── routes/        # 路由
├── controllers/   # 请求处理 + 业务逻辑
├── services/      # orderService(事务下单)
├── middlewares/   # auth(JWT) / requireAdmin / error
├── utils/         # jwt / wechat(code2session) / response / async
├── app.js         # express 实例
└── server.js      # 启动 + 数据库连接
scripts/seed.js    # 初始化管理员
```

## API 一览 (前缀 `/api`,响应 `{code,message,data}`,code=0 成功)

| 方法 | 路径 | 说明 | 权限 |
|---|---|---|---|
| POST | `/auth/wx-login` | 小程序登录(code→openid) | 公开 |
| POST | `/auth/mock-login` | 开发兜底登录 | 公开 |
| POST | `/auth/admin/login` | 管理端登录 | 公开 |
| GET  | `/auth/profile` | 当前用户 | 登录 |
| GET  | `/categories` | 分类列表 | 登录 |
| POST/PUT/DELETE | `/categories[/:id]` | 分类增删改 | 管理员 |
| GET  | `/dishes` | 菜品列表(支持 categoryId/keyword/withCategory/all) | 登录 |
| GET  | `/dishes/:id` | 菜品详情 | 登录 |
| POST/PUT/DELETE | `/dishes[/:id]` | 菜品增删改 | 管理员 |
| POST | `/upload` | 上传图片(field=file) | 管理员 |
| GET  | `/orders?scope=today\|history&userId&status&page` | 订单列表 | 登录(普通用户仅自己) |
| GET  | `/orders/:id` | 订单详情 | 登录 |
| POST | `/orders` | 下单 `{items:[{dishId,quantity}],remark}` | 登录 |
| PATCH| `/orders/:id/status` | 改订单状态 | 管理员 |
| GET  | `/users` | 用户列表(分页+搜索) | 管理员 |
| PATCH| `/users/:id/status` | 禁用/启用登录 | 管理员 |
| PATCH| `/users/:id/role` | 改角色 | 管理员 |

## 说明
- 建表以 `db/init.sql` 为准;如需模型自动建表可设 `DB_SYNC=true`(开发便利)。
- 微信登录需在 `.env` 配 `WX_APPID`/`WX_SECRET`;未配置时调用会提示,前端会回退 mock 登录。
- 上传的图片存于 `server/uploads/`,通过 `/uploads/<file>` 访问。
