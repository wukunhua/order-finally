# 微信小程序点菜系统 (order-sys)

一个完整的三端点菜系统: **小程序端**(uni-app + Vue3)给用户点菜,**Web 管理端**(Vue3 + Element Plus)给管理员管理,**后端**(Node.js + Express)提供 API,数据存储于 **MySQL**。

> 📐 想快速读懂本项目(架构/数据模型/权限/设计决策)请看 **[ARCHITECTURE.md](ARCHITECTURE.md)**;本文档是**运行手册**。

## 目录结构

```
order-sys/
├── server/      # Node.js + Express 后端 + Sequelize
├── admin/       # Vue3 + Vite + Element Plus 管理端
├── miniapp/     # uni-app(Vue3)微信小程序
├── db/
│   └── init.sql # MySQL 建表 + 示例数据(建库后执行)
└── README.md
```

## 功能总览

### 小程序端(用户)
- **点菜页**:左侧分类 + 右侧菜品列表;每道菜含 名称/简介/做法;加号加入购物车并选份数,去结算下单。
- **我的页**:**今天**点的菜 + **历史**订单;**普通用户只能看自己的**,**管理员**可一键查看所有人的订单。

### Web 管理端(管理员)
- 登录(账号 `admin` / `admin123`)
- **用户管理**:查看所有登录过小程序的用户,**禁用/启用登录**,调整角色。
- **菜品分类**:增删改查、排序、上下架。
- **菜品管理**:增删改查、上传图片、上下架。
- **订单查看**:所有订单,按 用户/今日/历史/状态 筛选,更新制作状态。

### 后端
- JWT 鉴权(小程序微信登录 + 管理员账号密码)
- 微信 `code2session` 登录,**开发期提供 mock-login 兜底**(无微信凭证也能跑通)
- 分类/菜品/订单/用户/图片上传 全套 API
- 角色权限:普通用户只能看自己订单,管理员可看所有

## 数据库模型

`users`(用户,小程序+管理员合一) · `categories`(分类) · `dishes`(菜品:名称/简介/做法/图片/上下架) · `orders`(订单) · `order_items`(明细,含**数量 quantity** 与菜名/做法快照)。

> 菜品不含库存字段——"数量"指下单份数,属于订单明细。系统不做库存扣减。

---

## 快速开始

### 0) 准备
- Node.js ≥ 18(已在 Node 24 验证)
- MySQL ≥ 5.7(推荐 8.x)
- 微信开发者工具(预览小程序用)

### 1) 建库并导入 SQL
```bash
mysql -u root -p -e "CREATE DATABASE order_sys DEFAULT CHARACTER SET utf8mb4;"
mysql -u root -p order_sys < db/init.sql
```

### 2) 启动后端
```bash
cd server
cp .env.example .env      # 按需修改 DB_PASSWORD / JWT_SECRET / 微信凭证
npm install
npm run seed              # 创建默认管理员 admin / admin123
npm run dev               # http://localhost:3000
```
健康检查: <http://localhost:3000/api/health>

### 3) 启动 Web 管理端
```bash
cd admin
npm install
npm run dev               # http://localhost:5173  (已配置 /api 代理到 3000)
```
浏览器打开,用 `admin / admin123` 登录。

### 4) 启动小程序
```bash
cd miniapp
npm install
npm run dev:mp-weixin     # 产物在 dist/dev/mp-weixin
```
用**微信开发者工具**导入 `miniapp/dist/dev/mp-weixin` 目录预览。
- 本地调试请在开发者工具 → 详情 → 本地设置,勾选「**不校验合法域名**」。
- 登录默认走微信登录;后端未配置真实 AppID/Secret 时会自动回退到 mock 登录,便于本地联调。

> 也可 `npm run dev:h5` 直接在浏览器里调试小程序界面。

---

## 关键配置

| 位置 | 配置项 | 说明 |
|---|---|---|
| `server/.env` | `DB_*` | 数据库连接 |
| `server/.env` | `JWT_SECRET` | 生产务必改成随机串 |
| `server/.env` | `WX_APPID` / `WX_SECRET` | 微信小程序凭证(真机登录需要) |
| `server/.env` | `CORS_ORIGIN` | Web 管理端地址 |
| `miniapp/utils/request.js` | `BASE` | 小程序请求后端的完整地址(部署时改成你的域名) |
| `miniapp/manifest.json` | `mp-weixin.appid` | 你的小程序 AppID |

## 默认账号
- 管理员:`admin` / `admin123`(由 `server/scripts/seed.js` 创建,可重复执行)

## 技术栈
- 后端:Express · Sequelize · mysql2 · JWT · bcryptjs · multer
- 管理端:Vue 3 · Vite · Element Plus · Pinia · Vue Router · Axios
- 小程序:uni-app(Vue3)· Vite
- 数据库:MySQL 8
