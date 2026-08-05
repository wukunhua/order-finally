const { ApiError } = require('../utils/response');

// 统一错误处理:把 ApiError / 未知异常统一成 { code, message, data }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.httpStatus || 400).json({
      code: err.code,
      message: err.message,
      data: err.data || null,
    });
  }

  // 参数校验等常见错误
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ code: 400, message: '请求体格式错误', data: null });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
}

// 404
function notFound(req, res) {
  res.status(404).json({ code: 404, message: `接口不存在: ${req.method} ${req.originalUrl}`, data: null });
}

module.exports = { errorHandler, notFound };
