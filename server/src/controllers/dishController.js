const { Dish, Category } = require('../models');
const { success, ApiError } = require('../utils/response');
const { Op } = require('sequelize');

// 列表
//   query: categoryId / keyword / all=1(管理员看全部,含停售) / withCategory=1
async function list(req, res) {
  const { categoryId, keyword } = req.query;
  const isAdminView = req.query.all === '1';
  const where = {};

  if (!isAdminView) where.status = 1; // 小程序只看在售
  if (categoryId) where.category_id = Number(categoryId);
  if (keyword) where.name = { [Op.like]: `%${keyword}%` };

  const rows = await Dish.findAll({
    where,
    include: req.query.withCategory === '1'
      ? [{ model: Category, as: 'category' }]
      : undefined,
    order: [['sort_order', 'ASC'], ['id', 'DESC']],
  });
  res.json(success(rows));
}

async function detail(req, res) {
  const row = await Dish.findByPk(req.params.id, {
    include: [{ model: Category, as: 'category' }],
  });
  if (!row) throw new ApiError(404, '菜品不存在', 404);
  res.json(success(row));
}

async function create(req, res) {
  const { categoryId, name, description, cookingMethod, calories, imageUrl, status, sortOrder } = req.body || {};
  if (!name) throw new ApiError(400, '菜品名称不能为空');
  if (!categoryId) throw new ApiError(400, '请选择菜品分类');

  const cat = await Category.findByPk(Number(categoryId));
  if (!cat) throw new ApiError(400, '分类不存在');

  const row = await Dish.create({
    categoryId: Number(categoryId),
    name,
    description: description || null,
    cookingMethod: cookingMethod || null,
    calories: calories === undefined || calories === '' ? null : Number(calories),
    imageUrl: imageUrl || null,
    status: status === undefined ? 1 : Number(status),
    sortOrder: Number(sortOrder) || 0,
  });
  res.json(success(row));
}

async function update(req, res) {
  const row = await Dish.findByPk(req.params.id);
  if (!row) throw new ApiError(404, '菜品不存在', 404);

  const { categoryId, name, description, cookingMethod, calories, imageUrl, status, sortOrder } = req.body || {};
  if (categoryId !== undefined) {
    const cat = await Category.findByPk(Number(categoryId));
    if (!cat) throw new ApiError(400, '分类不存在');
    row.categoryId = Number(categoryId);
  }
  if (name !== undefined) row.name = name;
  if (description !== undefined) row.description = description;
  if (cookingMethod !== undefined) row.cookingMethod = cookingMethod;
  if (calories !== undefined) {
    row.calories = calories === '' || calories === null ? null : Number(calories);
  }
  if (imageUrl !== undefined) row.imageUrl = imageUrl;
  if (status !== undefined) row.status = Number(status);
  if (sortOrder !== undefined) row.sortOrder = Number(sortOrder);
  await row.save();
  res.json(success(row));
}

async function remove(req, res) {
  const row = await Dish.findByPk(req.params.id);
  if (!row) throw new ApiError(404, '菜品不存在', 404);
  await row.destroy();
  res.json(success(null, '已删除'));
}

module.exports = { list, detail, create, update, remove };
