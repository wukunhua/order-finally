const express = require('express');
const multer = require('multer');
const path = require('path');
const { wrap } = require('../utils/async');
const { auth, requireAdmin } = require('../middlewares/auth');
const ctrl = require('../controllers/uploadController');

const router = express.Router();

// 仅允许图片
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(null, false);
  },
});

router.post('/', auth, requireAdmin, upload.single('file'), wrap(ctrl.upload));

module.exports = router;
