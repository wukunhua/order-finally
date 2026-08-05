const express = require('express');
const { wrap } = require('../utils/async');
const { auth } = require('../middlewares/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post('/wx-login', wrap(ctrl.wxLogin));
router.post('/mock-login', wrap(ctrl.mockLogin)); // 开发兜底,无需微信凭证
router.post('/admin/login', wrap(ctrl.adminLogin));
router.get('/profile', auth, wrap(ctrl.profile));

module.exports = router;
