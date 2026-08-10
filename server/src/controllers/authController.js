const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { signToken } = require('../utils/jwt');
const { code2Session } = require('../utils/wechat');
const { success, ApiError } = require('../utils/response');

function publicUser(user) {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    username: user.username,
  };
}

// 小程序登录: code -> openid -> upsert 用户 -> 发 token
async function wxLogin(req, res) {
  const { code } = req.body || {};
  if (!code) throw new ApiError(400, '缺少 code');

  const { openid, sessionKey } = await code2Session(code);

  let user = await User.findOne({ where: { openid } });
  if (!user) {
    user = await User.create({ openid, sessionKey, nickname: '微信用户', role: 'user' });
  } else {
    user.sessionKey = sessionKey;
    user.lastLoginAt = new Date();
    await user.save();
  }

  if (user.status === 'disabled') {
    throw new ApiError(403, '账号已被禁用,请联系管理员', 403);
  }

  const token = signToken({ id: user.id, role: user.role });
  res.json(success({ token, user: publicUser(user) }));
}

// 开发兜底登录: 不需要微信凭证,用任意 openid 创建/复用用户(便于本地联调)
async function mockLogin(req, res) {
  const openid = (req.body && req.body.openid) || 'mock_openid_demo';

  let [user] = await User.findOrCreate({
    where: { openid },
    defaults: { openid, nickname: '测试用户', role: 'user' },
  });

  if (user.status === 'disabled') {
    throw new ApiError(403, '账号已被禁用,请联系管理员', 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ id: user.id, role: user.role });
  res.json(success({ token, user: publicUser(user) }));
}

// Web 管理端登录: 用户名 + 密码
async function adminLogin(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) throw new ApiError(400, '请输入账号和密码');

  const user = await User.findOne({ where: { username } });
  if (!user || !user.passwordHash) {
    throw new ApiError(400, '账号或密码错误');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(400, '账号或密码错误');

  if (user.status === 'disabled') {
    throw new ApiError(403, '账号已被禁用', 403);
  }
  if (user.role !== 'admin') {
    throw new ApiError(403, '该账号无管理后台权限', 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ id: user.id, role: user.role });
  res.json(success({ token, user: publicUser(user) }));
}

// 当前登录用户信息
async function profile(req, res) {
  res.json(success(publicUser(req.user)));
}

// 更新用户资料(昵称/头像等)
async function updateProfile(req, res) {
  const { nickname, avatarUrl } = req.body || {};
  const user = req.user;

  if (nickname !== undefined) user.nickname = nickname;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  await user.save();

  res.json(success(publicUser(user), '资料已更新'));
}

module.exports = { wxLogin, mockLogin, adminLogin, profile, updateProfile };
