const jwt = require('jsonwebtoken');
const Employee = require('../models/employee');

// ok this checks if the user is authorized before letting them through
async function auth(req, res, next) {
  try {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'token missing - access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    // find them in the db to make sure they are still active
    const emp = await Employee.findByPk(decoded.id);

    if (!emp || !emp.isActive) {
      return res.status(401).json({ error: 'staff member invalid or off system' });
    }

    req.user = emp; // attach the person to the request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'session expired or invalid' });
  }
}

module.exports = auth;
