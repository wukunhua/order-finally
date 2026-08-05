# 小程序端 miniapp (uni-app + Vue3)

## 运行

### 微信小程序
```bash
npm install
npm run dev:mp-weixin      # 产物: dist/dev/mp-weixin
```
用**微信开发者工具**导入 `dist/dev/mp-weixin` 目录预览。
- 详情 → 本地设置 → 勾选「不校验合法域名」(本地联调)。
- `manifest.json` 的 `mp-weixin.appid` 改成你自己的 AppID(默认 `touristappid` 仅用于无账号体验)。

### H5(浏览器调试)
```bash
npm run dev:h5
```

## 页面
- `pages/order/order.vue` **点菜页**:左侧分类 + 右侧菜品,加入购物车选份数,结算下单。
- `pages/mine/mine.vue` **我的页**:今天/历史订单;管理员可切换「查看所有人的订单」。

## 登录流程
1. 进入小程序自动 `ensureLogin()`:
2. 先尝试微信登录(`uni.login` → `/auth/wx-login`);
3. 后端未配置微信凭证等失败时,**开发期自动回退 mock 登录**(`/auth/mock-login`),无需账号即可联调;
4. 账号被禁用/无权限不会回退,保持拦截。

## 配置
- `utils/request.js` 顶部 `BASE`:小程序端默认 `http://localhost:3000/api`,**部署时改成你的服务器域名**。
- `pages.json`:tabBar 两个页签(点菜 / 我的)、全局导航栏配色。
