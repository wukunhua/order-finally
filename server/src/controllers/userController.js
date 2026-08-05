const { Op } = require('sequelize');
const { User, Order } = require('../models');
const { success, ApiError } = require('../utils/response');

// 用户列表(默认只列登录过小程序的用户 openid IS NOT NULL)
//   query: keyword / page / pageSize / all=1
async function list(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
  const where = {};

  if (req.query.all !== '1') {
    where.openid = { [Op.ne]: null };
  }
  if (req.query.keyword) {
    const kw = `%${req.query.keyword}%`;
    where[Op.or] = [{ nickname: { [Op.like]: kw } }, { openid: { [Op.like]: kw } }];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password_hash', 'session_key'] },
    order: [['created_at', 'DESC'], ['id', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize,
    distinct: true,
  });

  res.json(success({ rows, total: count, page, pageSize }));
}

// 禁用 / 启用登录
async function updateStatus(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, '用户不存在', 404);

  const { status } = req.body || {};
  if (!['active', 'disabled'].includes(status)) {
    throw new ApiError(400, '非法状态');
  }
  user.status = status;
  await user.save();
  res.json(success({ id: user.id, status: user.status }, status === 'disabled' ? '已禁用登录' : '已启用登录'));
}

// 修改角色(user <-> admin)
async function updateRole(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, '用户不存在', 404);

  const { role } = req.body || {};
  if (!['user', 'admin'].includes(role)) {
    throw new ApiError(400, '非法角色');
  }
  user.role = role;
  await user.save();
  res.json(success({ id: user.id, role: user.role }, '角色已更新'));
}

// 单个用户下单数(管理端用户详情用)
async function stats(req, res) {
  const total = await Order.count({ where: { user_id: req.params.id } });
  res.json(success({ total }));
}

module.exports = { list, updateStatus, updateRole, stats };
