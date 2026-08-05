// 统一 JSON 响应格式: { code, message, data }
// code === 0 表示成功,非 0 表示业务/系统错误
function success(data = null, message = 'ok') {
  return { code: 0, message, data };
}

// 用业务错误码抛错,会被 errorHandler 捕获并按相同结构返回
class ApiError extends Error {
  constructor(code, message, httpStatus = 400, data = null) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.data = data;
  }
}

module.exports = { success, ApiError };
