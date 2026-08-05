const { Op, Sequelize } = require('sequelize');
const { sequelize, Order, OrderItem, Dish } = require('../models');
const { ApiError } = require('../utils/response');

// 生成业务单号: OD + YYYYMMDD + 6位时间戳尾
function genOrderNo() {
  const now = new Date();
  const ymd =
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}` +
    `${String(now.getDate()).padStart(2, '0')}`;
  const tail = String(Date.now()).slice(-6);
  return `OD${ymd}${tail}`;
}

// 创建订单(事务):校验菜品在售 -> 写 order + items
async function createOrder(user, { items, remark }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, '请至少选择一道菜');
  }

  // 规整入参
  const cleaned = items
    .map((it) => ({ dishId: Number(it.dishId), quantity: Math.max(1, Number(it.quantity) || 1) }))
    .filter((it) => Number.isInteger(it.dishId));

  if (cleaned.length === 0) throw new ApiError(400, '菜品参数不合法');

  const dishIds = [...new Set(cleaned.map((it) => it.dishId))];
  const dishes = await Dish.findAll({ where: { id: { [Op.in]: dishIds } } });
  const dishMap = new Map(dishes.map((d) => [d.id, d]));

  // 校验
  for (const it of cleaned) {
    const dish = dishMap.get(it.dishId);
    if (!dish) throw new ApiError(400, `菜品不存在(id=${it.dishId})`);
    if (dish.status !== 1) throw new ApiError(400, `菜品「${dish.name}」已停售`);
  }

  const itemCount = cleaned.reduce((sum, it) => sum + it.quantity, 0);

  const result = await sequelize.transaction(async (t) => {
    const order = await Order.create(
      {
        orderNo: genOrderNo(),
        userId: user.id,
        status: 'pending',
        remark: remark || null,
        orderDate: Sequelize.literal('CURDATE()'),
        itemCount,
      },
      { transaction: t }
    );

    const rows = cleaned.map((it) => {
      const dish = dishMap.get(it.dishId);
      return {
        orderId: order.id,
        dishId: dish.id,
        dishName: dish.name,
        cookingMethod: dish.cookingMethod,
        quantity: it.quantity,
      };
    });
    await OrderItem.bulkCreate(rows, { transaction: t });

    return order;
  });

  // 返回带明细的完整订单
  return Order.findByPk(result.id, { include: [{ model: OrderItem, as: 'items' }] });
}

module.exports = { createOrder, genOrderNo };
