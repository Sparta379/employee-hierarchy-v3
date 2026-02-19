const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Employee = require('../models/employee');
const auth = require('../middleware/auth');

// ok this handles logging in and tokens
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // console.log('Login attempt for:', email);

    const emp = await Employee.findOne({ where: { email } });
    if (!emp || !emp.isActive) {
      return res.status(401).json({ error: 'invalid id or account inactive' });
    }

    const isOk = await emp.checkPass(password);
    if (!isOk) {
      return res.status(401).json({ error: 'invalid key' });
    }

    const token = jwt.sign(
      { id: emp.id, permissionLevel: emp.permissionLevel },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        permissionLevel: emp.permissionLevel
      },
      token
    });
  } catch (err) {
    // ok this will show up in vercel logs
    console.error('--- CRITICAL AUTH ERROR ---');
    console.error(err);
    res.status(500).json({ error: 'auth server error', detail: err.message });
  }
});

// change own password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const emp = await Employee.findByPk(req.user.id);

    const isOk = await emp.checkPass(oldPassword);
    if (!isOk) return res.status(400).json({ error: 'wrong current key' });

    await emp.update({ password: newPassword });
    res.json({ message: 'updated' });
  } catch (err) {
    console.error('Password change failed:', err);
    res.status(400).json({ error: 'failed' });
  }
});

// admin reset
router.post('/reset-password/:id', auth, async (req, res) => {
  try {
    if (req.user.permissionLevel !== 'admin') return res.status(403).json({ error: 'denied' });
    const emp = await Employee.findByPk(req.params.id);
    await emp.update({ password: 'EpiUse123!' });
    res.json({ message: 'reset ok' });
  } catch (err) {
    console.error('Reset failed:', err);
    res.status(400).json({ error: 'failed' });
  }
});

module.exports = router;
