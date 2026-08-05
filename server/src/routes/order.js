const express = require('express');
const { wrap } = require('../utils/async');
const { auth, requireAdmin } = require('../middlewares/auth');
const ctrl = require('../controllers/orderController');

const router = express.Router();

// 任意登录用户:查/下单
router.get('/', auth, wrap(ctrl.list));
router.get('/:id', auth, wrap(ctrl.detail));
router.post('/', auth, wrap(ctrl.create));

// 仅管理员:改状态
router.patch('/:id/status', auth, requireAdmin, wrap(ctrl.updateStatus));

module.exports = router;
