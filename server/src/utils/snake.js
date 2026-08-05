// 统一把响应对象 key 转成 snake_case。
// 原因:Sequelize 序列化普通列为 camelCase(orderNo/itemCount/createdAt/dishName…),
// 而前端(管理端 + 小程序)一律按 snake_case 取值(order_no/item_count/created_at/dish_name…),
// 不转换会导致这些字段在前端为空。这里在 res.json 出口统一深转换,前端零改动。

function snakeKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function toSnakeCaseDeep(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(toSnakeCaseDeep);
  if (value instanceof Date || Buffer.isBuffer(value)) return value;
  if (typeof value === 'object') {
    // Sequelize 实例先 toJSON 拿到普通对象
    const obj = typeof value.toJSON === 'function' ? value.toJSON() : value;
    const out = {};
    for (const key of Object.keys(obj)) {
      out[snakeKey(key)] = toSnakeCaseDeep(obj[key]);
    }
    return out;
  }
  return value;
}

module.exports = { toSnakeCaseDeep, snakeKey };
