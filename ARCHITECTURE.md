# 项目架构总览 · 微信小程序点菜系统 (order-sys)

> 一份读完就能读懂这个项目的浓缩文档。运行步骤见 [README.md](README.md)。

## 1. 一句话定位

一个**三端点菜系统**：小程序给用户点菜，Web 后台给管理员管理，Node 提供统一 API，数据存 MySQL。典型场景是公司食堂 / 餐厅内网点餐（**无金额、无库存**）。

## 2. 架构

```
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  小程序端     │   │  Web 管理端       │   │  (未实现:真机微信) │
│ uni-app/Vue3 │   │ Vue3+Element Plus │   │                  │
│ order/mine   │   │ 用户/分类/菜品/订单│   │                  │
└──────┬───────┘   └────────┬─────────┘   └──────────────────┘
       │ /api (HTTP+JWT)    │ /api (HTTP+JWT)
       └──────────┬─────────┘
            ┌─────▼─────┐
            │  后端 API  │  Express + Sequelize
            │  /api/*    │  鉴权/分类/菜品/订单/用户/上传
            └─────┬─────┘
            ┌─────▼─────┐
            │   MySQL    │  order_sys
            └───────────┘
```

- 三端都是**独立可单独部署**的工程，单仓共存（`server/` `admin/` `miniapp/`）。
- 前后端**完全解耦**：所有数据通过 `/api` 的 JSON 接口（统一格式 `{code,message,data}`，`code=0` 成功）。
- 鉴权统一用 **JWT**，小程序用户和 Web 管理员**共用一张 users 表**。

## 3. 技术栈

| 部分 | 技术 | 关键依赖 |
|---|---|---|
| 小程序 | uni-app + Vue3 + Vite | `@dcloudio/*` 全部钉在 `3.0.0-alpha-5020120260706001` |
| 管理端 | Vue3 + Vite + Element Plus + Pinia | element-plus、vue-router、axios |
| 后端 | Node + Express + Sequelize + JS(commonjs) | express、sequelize、mysql2、jsonwebtoken、bcryptjs、multer(2.x) |
| 数据库 | MySQL 8（utf8mb4） | 建表以 `db/init.sql` 为准 |

## 4. 目录结构

```
order-sys/
├── db/init.sql              # 建表+示例数据(建表唯一依据)
├── ARCHITECTURE.md          # 本文件
├── README.md                # 运行手册
├── server/                  # 后端
│   ├── src/
│   │   ├── config/          # index(env) + db(sequelize 实例)
│   │   ├── models/          # User/Category/Dish/Order/OrderItem + 关联
│   │   ├── routes/          # auth/category/dish/order/user/upload
│   │   ├── controllers/     # 请求处理+业务逻辑(薄)
│   │   ├── services/        # orderService(事务下单)
│   │   ├── middlewares/     # auth(JWT) / requireAdmin / error
│   │   ├── utils/           # jwt / wechat(code2session) / response / async
│   │   ├── app.js / server.js
│   ├── scripts/seed.js      # 创建默认管理员 admin/admin123
│   └── uploads/             # 菜品图片(multer,静态托管)
├── admin/                   # 管理端
│   └── src/{api,views,router,stores,layout,utils}
└── miniapp/                 # 小程序(注意:源码在 src/ 下)
    └── src/{pages/{order,mine},api,store,utils,App.vue,pages.json,manifest.json}
```

## 5. 数据模型（5 张表）

```
users ──< orders ──< order_items >── dishes >── categories
```

| 表 | 作用 | 关键字段 |
|---|---|---|
| **users** | 小程序用户+管理员合一 | `openid`(小程序) / `username`+`password_hash`(管理员) / `role`(user·admin) / `status`(active·disabled) |
| **categories** | 菜品分类 | `name` / `icon` / `sort_order` / `status`(1上架0下架) |
| **dishes** | 菜品 | `category_id` / `name` / `description`(简介) / `cooking_method`(做法) / `calories`(热量·千卡,可空) / `image_url` / `status` |
| **orders** | 订单 | `order_no` / `user_id` / `status`(pending·preparing·served·cancelled) / `remark` / `order_date` / `item_count` |
| **order_items** | 订单明细(下单时快照菜名/做法) | `order_id` / `dish_id` / `dish_name` / `cooking_method` / **`quantity`(点了多少份)** |

> ⚠️ 三条易踩的设计口径，详见第 8 节：① 菜品**无数量字段**，数量在订单明细；② 不含价格/库存；③ users 单表承载两类身份。

## 6. 鉴权与权限模型

- **两套登录入口，同一张 users 表**：
  - 小程序：`POST /api/auth/wx-login`（code→后端 `code2session`→openid→upsert 用户）。开发期 `POST /api/auth/mock-login` 兜底（无需微信凭证）。
  - 管理端：`POST /api/auth/admin/login`（username+bcrypt）。
- 登录后发 **JWT**（payload `{id, role}`），前端存本地，每次请求带 `Authorization: Bearer <token>`。
- 中间件 `auth`：解析 token → 查用户 → **`status=disabled` 直接 403**（被禁用的用户即使 token 没过期也拦）。
- 中间件 `requireAdmin`：`role≠admin` → 403。
- **谁能看谁的订单**（核心需求）：订单列表接口按 `role` 自适应——普通用户**只能返回自己的**，管理员**返回所有人的**（前端"我的"页给管理员一个开关切回只看自己）。

## 7. API 速查（前缀 `/api`，响应 `{code,message,data}`）

| 分组 | 方法 路径 | 权限 |
|---|---|---|
| 鉴权 | `POST /auth/wx-login` · `POST /auth/mock-login` · `POST /auth/admin/login` · `GET /auth/profile` | 前三公开 |
| 分类 | `GET /categories` · `POST/PUT/DELETE /categories[/:id]` | 读=登录；写=管理员 |
| 菜品 | `GET /dishes` (categoryId/keyword/withCategory/all) · `GET /dishes/:id` · `POST/PUT/DELETE` | 读=登录；写=管理员 |
| 订单 | `GET /orders?scope=today\|history&userId&status` · `GET /orders/:id` · `POST /orders` · `PATCH /orders/:id/status` | 登录(普通用户仅自己)；改状态=管理员 |
| 用户 | `GET /users` · `PATCH /users/:id/status` · `PATCH /users/:id/role` | 管理员 |
| 上传 | `POST /upload` (field=file) | 管理员 |

- 下单 body：`{ items:[{dishId,quantity}], remark }`，后端校验菜品在售→建 order+order_items（**不扣库存**）。

## 8. 关键设计决策（非显而易见，先读这里）

1. **"数量"归属订单，不是菜品**：菜品属性 = 名称/分类/简介/做法/**热量 calories(千卡)**（**无 quantity**）；用户点的份数存在 `order_items.quantity`。下单不涉及库存。
2. **不含价格**：按食堂/员工点餐场景，订单只记"点了哪些菜各几份"。要加金额，给 `dishes`/`order_items` 各加 `price` 即可。
3. **一张 users 表两类身份**：小程序用户用 `openid` 登录、管理员用 `username/password` 登录，`role` 字段区分；把某个小程序用户 `role` 改成 admin，他就能在小程序里看到所有人的订单。"禁用登录" = `status=disabled`。
4. **建表以 SQL 为准，ORM 只读**：`db/init.sql` 是 schema 唯一来源；Sequelize 模型与之严格对齐，默认不 sync（`DB_SYNC=true` 可让后端自动建表，仅开发便利）。
5. **管理员密码不在 SQL 里硬编码**：`db/init.sql` 不含 admin；由 `server/scripts/seed.js` 用 bcrypt 写入 `admin/admin123`（可重复执行，会重置密码）。

## 9. 核心业务流程

**点菜下单**（小程序 order 页）
进入 → `ensureLogin()`（已登录跳过；否则微信登录，失败回退 mock）→ 拉分类+菜品 → 选份数入购物车(store) → 结算弹层确认 → `POST /orders` → 清购物车、Toast 成功。

**我的订单**（小程序 mine 页）
今天/历史 tab（`scope` 参数）→ 管理员多一个"查看所有人的订单"开关（开=不带 userId 看全部，关=`userId=self` 只看自己）。

**管理端**
登录(admin/admin123) → 用户管理(禁用/启用/改角色)、分类管理、菜品管理(含图片上传)、订单查看(筛选+改状态)。

## 10. 快速运行（详见 README）

```bash
# 0) 建库导表
mysql -u root -p -e "CREATE DATABASE order_sys DEFAULT CHARACTER SET utf8mb4;"
mysql -u root -p order_sys < db/init.sql
# 1) 后端
cd server && cp .env.example .env && npm i && npm run seed && npm run dev   # :3000
# 2) 管理端
cd admin && npm i && npm run dev                                            # :5173  admin/admin123
# 3) 小程序
cd miniapp && npm i && npm run dev:mp-weixin   # 微信开发者工具导入 dist/dev/mp-weixin(勾"不校验合法域名")
```

## 11. 验证状态

- 后端：require 链通过；**MySQL 真实库端到端跑通，21/21 断言通过**（登录/CRUD/下单/权限隔离/禁用登录拦截/订单状态流转）。
- 管理端：`npm run build` 生产构建通过（7 个页面全部编译）。
- 小程序：`npm run build:mp-weixin` 微信小程序构建通过（无报错无警告）。

## 12. 易踩环境坑（Windows + 本机）

- `npm install miniapp` 偶发 esbuild `EBUSY`（Defender 扫描 .exe）→ 直接重跑即可。
- uni-app 源码必须在 `miniapp/src/`（vite-plugin-uni 默认 inputDir）。
- 组件 `<style>` 不要写 `lang="scss"`（除非装 sass）；本项目样式是纯 CSS。
- 小程序请求后端默认 `http://localhost:3000/api`，部署改 `miniapp/src/utils/request.js` 的 `BASE`。
- 微信登录需真实 AppID/Secret；没有就用 `/api/auth/mock-login`，前端已自动回退。
- **H5 跑空白页/404 的两大原因**：① 缺 `miniapp/index.html`（vite 的 H5 入口，mp-weixin 不需要它所以容易被漏）；② 端口被残留 `node.exe` 占用，vite 偷偷换端口、你照旧端口打不开。已在 `vite.config.js` 设 `host:true`（localhost/127.0.0.1 都通）+ `strictPort:true`（被占就报错而非换端口）；真打不开先在任务管理器杀掉残留 node.exe 再重启。
- **API 字段统一 snake_case**：Sequelize 默认把普通列序列化成 camelCase（`orderNo`/`itemCount`/`createdAt`/`dishName`…），而前端按 snake_case 取值，不处理会整片空白。已在 `app.js` 用 `utils/snake.js` 包了 `res.json`，出口统一深转 snake_case——**改后端模型/字段不用动前端**。新加接口直接返回 Sequelize 实例即可，会自动转换。
