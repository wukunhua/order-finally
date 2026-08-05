const express = require('express');
const authRoutes = require('./auth');
const categoryRoutes = require('./category');
const dishRoutes = require('./dish');
const orderRoutes = require('./order');
const userRoutes = require('./user');
const uploadRoutes = require('./upload');

const router = express.Router();

router.get('/health', (req, res) => res.json({ code: 0, message: 'ok', data: { status: 'up' } }));

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/dishes', dishRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
