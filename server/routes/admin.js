const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');
const auth = require('../middleware/auth');

// ok admins only area
router.use(auth);
router.use((req, res, next) => {
  if (req.user.permissionLevel !== 'admin') {
    return res.status(403).json({ error: 'admins only' });
  }
  next();
});

// quick stats for the dashboard
router.get('/stats', async (req, res) => {
  try {
    const stats = await Employee.findAll({
      attributes: [
        'permissionLevel',
        [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
      ],
      group: ['permissionLevel']
    });

    const active = await Employee.count({ where: { isActive: true } });
    const inactive = await Employee.count({ where: { isActive: false } });
    const total = await Employee.count();

    const recent = await Employee.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['name', 'surname', 'role', 'createdAt']
    });

    res.json({
      permissionBreakdown: stats,
      activeEmployees: active,
      inactiveEmployees: inactive,
      totalEmployees: total,
      recentEmployees: recent
    });
  } catch (err) {
    res.status(500).json({ error: 'stats failed' });
  }
});

// update a bunch of permissions
router.put('/bulk-permissions', async (req, res) => {
  try {
    const { updates } = req.body;
    for (const item of updates) {
      await Employee.update(
        { permissionLevel: item.permissionLevel },
        { where: { id: item.id } }
      );
    }
    res.json({ message: 'updated', count: updates.length });
  } catch (err) {
    res.status(500).json({ error: 'bulk update failed' });
  }
});

// check if things are okay
router.get('/health', async (req, res) => {
  try {
    await Employee.sequelize.authenticate();
    const count = await Employee.count();
    res.json({
      status: 'ok',
      database: 'connected',
      count: count,
      time: new Date()
    });
  } catch (err) {
    res.status(500).json({ status: 'broken', error: err.message });
  }
});

module.exports = router;
