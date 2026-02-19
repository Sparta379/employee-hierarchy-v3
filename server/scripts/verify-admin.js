require('dotenv').config();
const Employee = require('../models/employee');
const sequelize = require('../config/database');

async function verifyAdmin() {
  try {
    await sequelize.authenticate();
    const admin = await Employee.findOne({ where: { email: 'admin@epiuseapp.com' } });
    
    if (admin) {
      console.log('✅ Admin Verified:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Permission: ${admin.permissionLevel}`);
      console.log(`   Role: ${admin.role}`);
      console.log('   Password: Set to EpiUse123! during seed.');
    } else {
      console.log('❌ Admin NOT found. Re-creating now...');
      await Employee.create({
        employeeNumber: 'SYS-VERIFY',
        name: 'System',
        surname: 'Administrator',
        email: 'admin@epiuseapp.com',
        birthDate: '1990-01-01',
        salary: 950000,
        role: 'System Administrator',
        permissionLevel: 'admin',
        password: 'EpiUse123!',
        managerId: null
      });
      console.log('✅ Admin account successfully established.');
    }
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    process.exit();
  }
}

verifyAdmin();
