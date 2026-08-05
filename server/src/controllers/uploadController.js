const path = require('path');
const config = require('../config');
const { success, ApiError } = require('../utils/response');

// multer 处理后的文件 -> 返回可访问 URL
async function upload(req, res) {
  if (!req.file) throw new ApiError(400, '请上传文件(field 名为 file)');
  const url = `${config.publicBaseUrl}/uploads/${req.file.filename}`;
  res.json(success({ url, filename: req.file.filename }));
}

module.exports = { upload };
