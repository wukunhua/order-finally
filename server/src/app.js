const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error');
const { toSnakeCaseDeep } = require('./utils/snake');

const app = express();

// CORS: 允许 Web 管理端(小程序请求域在微信后台配置,不依赖 CORS)
app.use(cors({ origin: config.corsOrigin, credentials: true }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// 统一把响应 key 转成 snake_case,前端可按 snake_case 取值
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson(toSnakeCaseDeep(body));
  next();
});

// 静态托管上传的图片
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 业务路由
app.use('/api', routes);

// 404 + 错误处理
app.use(notFound);
app.use(errorHandler);

module.exports = app;
