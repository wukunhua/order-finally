# Web 管理端 admin (Vue3 + Vite + Element Plus)

## 运行
```bash
npm install
npm run dev          # http://localhost:5173
```
默认账号 `admin` / `admin123`(由后端 `npm run seed` 创建)。已配置 `/api`、`/uploads` 代理到 `http://localhost:3000`。

## 功能模块
- **登录** `/login`
- **概览** `/dashboard` 用户/分类/菜品/今日订单 数量
- **用户管理** `/users` 搜索、禁用/启用登录、调整角色
- **菜品分类** `/categories` 增删改查、排序、上下架
- **菜品管理** `/dishes` 增删改查、上传图片、按分类/名称筛选、上下架
- **订单查看** `/orders` 按时间/状态筛选,改制作状态

## 结构
```
src/
├── api/index.js     # 接口封装
├── utils/request.js # axios + token + 统一错误
├── stores/auth.js   # pinia 鉴权状态
├── router/          # 路由 + 守卫
├── layout/Layout.vue
└── views/           # Login/Dashboard/Users/Categories/Dishes/Orders
```

构建:`npm run build` → `dist/`。
