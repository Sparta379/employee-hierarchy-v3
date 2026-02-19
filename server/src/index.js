require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('../config/database');
require('../models/employee'); // load models

// ok this is the main backend entry
const api = express();
const port = process.env.PORT || 5000;

api.use(cors());
api.use(express.json());

// ok load the routes from the folder above src
const authRoutes = require('../routes/auth');
const employeeRoutes = require('../routes/employees');
const adminRoutes = require('../routes/admin');

api.use('/api/auth', authRoutes);
api.use('/api/employees', employeeRoutes);
api.use('/api/admin', adminRoutes);

// verify server status
api.get('/api/health', (req, res) => {
  res.json({ message: 'api server is online ok' });
});

// production: serve frontend build
// fix: Express 5 needs (.*) for wildcards
if (process.env.NODE_ENV === 'production') {
  api.use(express.static(path.join(__dirname, '../../client/build')));
  api.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });
}

// connect and boot up
async function start() {
  try {
    await sequelize.authenticate();
    console.log('database connected ok');
    
    // ok sync the tables
    await sequelize.sync();
    console.log('models synced ok');
    
    // only listen if not on vercel
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      api.listen(port, () => {
        console.log(`backend is running on port ${port} ok`);
      });
    }
  } catch (err) {
    console.error('couldnt boot server:', err);
  }
}

// execute if not imported as a module (Vercel imports it)
if (require.main === module) {
  start();
} else {
  // still need to sync for vercel
  sequelize.sync().then(() => console.log('v-sync ok'));
}

module.exports = api;
