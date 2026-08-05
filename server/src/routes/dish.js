const express = require('express');
const { wrap } = require('../utils/async');
const { auth, requireAdmin } = require('../middlewares/auth');
const ctrl = require('../controllers/dishController');

const router = express.Router();

// 公开(已登录用户可读,小程序点菜用)
router.get('/', auth, wrap(ctrl.list));
router.get('/:id', auth, wrap(ctrl.detail));

// 仅管理员
router.post('/', auth, requireAdmin, wrap(ctrl.create));
router.put('/:id', auth, requireAdmin, wrap(ctrl.update));
router.delete('/:id', auth, requireAdmin, wrap(ctrl.remove));

module.exports = router;
