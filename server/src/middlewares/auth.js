const { verifyToken } = require('../utils/jwt');
const { ApiError } = require('../utils/response');
const { User } = require('../models');

// 解析 JWT 并加载用户;被禁用的账号拦截
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, '未登录', 401);

    let payload;
    try {
      payload = verifyToken(token);
    } catch (e) {
      throw new ApiError(401, '登录已过期,请重新登录', 401);
    }

    const user = await User.findByPk(payload.id);
    if (!user) throw new ApiError(401, '用户不存在', 401);
    if (user.status === 'disabled') {
      throw new ApiError(403, '账号已被禁用,请联系管理员', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// 仅管理员可访问
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, '无权限,仅管理员可访问', 403));
  }
  next();
}

module.exports = { auth, requireAdmin };
