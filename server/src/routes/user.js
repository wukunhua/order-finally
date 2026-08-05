const express = require('express');
const { wrap } = require('../utils/async');
const { auth, requireAdmin } = require('../middlewares/auth');
const ctrl = require('../controllers/userController');

const router = express.Router();

// 全部仅管理员
router.get('/', auth, requireAdmin, wrap(ctrl.list));
router.get('/:id/stats', auth, requireAdmin, wrap(ctrl.stats));
router.patch('/:id/status', auth, requireAdmin, wrap(ctrl.updateStatus));
router.patch('/:id/role', auth, requireAdmin, wrap(ctrl.updateRole));

module.exports = router;
