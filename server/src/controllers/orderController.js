const { Op, Sequelize } = require('sequelize');
const { Order, OrderItem, User } = require('../models');
const { success, ApiError } = require('../utils/response');
const { createOrder } = require('../services/orderService');

// 列表
//   query: scope=today|history|all, userId, status, page, pageSize
//   - 普通用户: 只能看自己的; 管理员: 不传 userId 则看所有人的
async function list(req, res) {
  const { scope, status } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));

  const where = {};

  // 权限: 非管理员只能看自己
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  } else if (req.query.userId) {
    where.user_id = Number(req.query.userId);
  }

  if (status) where.status = status;

  // 按天过滤
  if (scope === 'today') {
    where.order_date = { [Op.eq]: Sequelize.literal('CURDATE()') };
  } else if (scope === 'history') {
    where.order_date = { [Op.lt]: Sequelize.literal('CURDATE()') };
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: OrderItem, as: 'items' },
      ...(req.user.role === 'admin'
        ? [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar_url'] }]
        : []),
    ],
    order: [['created_at', 'DESC'], ['id', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize,
    distinct: true,
  });

  res.json(success({ rows, total: count, page, pageSize }));
}

async function detail(req, res) {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: 'items' }],
  });
  if (!order) throw new ApiError(404, '订单不存在', 404);

  // 权限: 非管理员只能看自己的
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    throw new ApiError(403, '无权查看该订单', 403);
  }
  res.json(success(order));
}

// 创建订单
async function create(req, res) {
  const order = await createOrder(req.user, req.body || {});
  res.json(success(order, '下单成功'));
}

// 管理员: 修改订单状态
async function updateStatus(req, res) {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw new ApiError(404, '订单不存在', 404);

  const { status } = req.body || {};
  const allowed = ['pending', 'preparing', 'served', 'cancelled'];
  if (!allowed.includes(status)) throw new ApiError(400, '非法的订单状态');

  order.status = status;
  await order.save();
  res.json(success(order));
}

module.exports = { list, detail, create, updateStatus };
