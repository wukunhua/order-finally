const { Category, Dish } = require('../models');
const { success, ApiError } = require('../utils/response');

// 列表(默认按 sort_order, 可只看上架)
async function list(req, res) {
  const onlyActive = req.query.all !== '1'; // 小程序默认只看上架
  const where = {};
  if (onlyActive) where.status = 1;

  const rows = await Category.findAll({
    where,
    order: [['sort_order', 'ASC'], ['id', 'ASC']],
  });
  res.json(success(rows));
}

async function detail(req, res) {
  const row = await Category.findByPk(req.params.id);
  if (!row) throw new ApiError(404, '分类不存在', 404);
  res.json(success(row));
}

async function create(req, res) {
  const { name, icon, sortOrder, status } = req.body || {};
  if (!name) throw new ApiError(400, '分类名称不能为空');
  const row = await Category.create({
    name,
    icon: icon || null,
    sortOrder: Number(sortOrder) || 0,
    status: status === undefined ? 1 : Number(status),
  });
  res.json(success(row));
}

async function update(req, res) {
  const row = await Category.findByPk(req.params.id);
  if (!row) throw new ApiError(404, '分类不存在', 404);

  const { name, icon, sortOrder, status } = req.body || {};
  if (name !== undefined) row.name = name;
  if (icon !== undefined) row.icon = icon;
  if (sortOrder !== undefined) row.sortOrder = Number(sortOrder);
  if (status !== undefined) row.status = Number(status);
  await row.save();
  res.json(success(row));
}

async function remove(req, res) {
  const row = await Category.findByPk(req.params.id);
  if (!row) throw new ApiError(404, '分类不存在', 404);

  const dishCount = await Dish.count({ where: { category_id: row.id } });
  if (dishCount > 0) {
    throw new ApiError(400, `该分类下还有 ${dishCount} 个菜品,请先移除或转移菜品后再删除分类`);
  }

  await row.destroy();
  res.json(success(null, '已删除'));
}

module.exports = { list, detail, create, update, remove };
