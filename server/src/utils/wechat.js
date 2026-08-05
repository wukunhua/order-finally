const config = require('../config');
const { ApiError } = require('./response');

// 调用微信 code2session,用前端传来的 code 换取 openid + session_key
// 文档: https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
async function code2Session(code) {
  const { appid, secret } = config.wx;
  if (!appid || !secret) {
    throw new ApiError(501, '服务器未配置微信 AppID/Secret,无法登录(开发期可用 /api/auth/mock-login)');
  }

  const url =
    `https://api.weixin.qq.com/sns/jscode2session` +
    `?appid=${encodeURIComponent(appid)}` +
    `&secret=${encodeURIComponent(secret)}` +
    `&js_code=${encodeURIComponent(code)}` +
    `&grant_type=authorization_code`;

  const res = await fetch(url);
  const body = await res.json();

  if (body.errcode || !body.openid) {
    throw new ApiError(
      400,
      `微信登录失败: ${body.errmsg || '未返回 openid'} (errcode=${body.errcode || '-'})`
    );
  }

  return {
    openid: body.openid,
    sessionKey: body.session_key || null,
    unionid: body.unionid || null,
  };
}

module.exports = { code2Session };
