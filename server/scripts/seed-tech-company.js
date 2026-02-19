require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Employee = require('../models/employee');
const sequelize = require('../config/database');

async function seedTechCompany() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Neon DB.');
    
    // ok sync models first to make sure tables exist
    await sequelize.sync({ force: true });
    console.log('Tables recreated ok.');

    // 1. Executive Level
    const ceo = await Employee.create({
      employeeNumber: 'EPU-001',
      name: 'Alexander',
      surname: 'Sterling',
      email: 'a.sterling@epiuseapp.com',
      birthDate: '1970-05-12',
      salary: 2500000,
      role: 'Chief Executive Officer',
      permissionLevel: 'manager',
      password: 'EpiUse123!',
      managerId: null
    });

    const cto = await Employee.create({
      employeeNumber: 'EPU-002',
      name: 'Isabella',
      surname: 'Vance',
      email: 'i.vance@epiuseapp.com',
      birthDate: '1982-08-24',
      salary: 1800000,
      role: 'Chief Technology Officer',
      permissionLevel: 'manager',
      password: 'EpiUse123!',
      managerId: ceo.id
    });

    const hrDirector = await Employee.create({
      employeeNumber: 'EPU-003',
      name: 'Eleanor',
      surname: 'Richards',
      email: 'e.richards@epiuseapp.com',
      birthDate: '1978-11-30',
      salary: 1200000,
      role: 'HR Director',
      permissionLevel: 'hr',
      password: 'EpiUse123!',
      managerId: ceo.id
    });

    // 2. System Admin
    await Employee.create({
      employeeNumber: 'SYS-001',
      name: 'System',
      surname: 'Administrator',
      email: 'admin@epiuseapp.com',
      birthDate: '1990-01-01',
      salary: 950000,
      role: 'System Administrator',
      permissionLevel: 'admin',
      password: 'EpiUse123!',
      managerId: cto.id
    });

    // 3. Engineering Managers
    const engManagers = [];
    const engRoles = ['Platform Manager', 'Mobile Manager', 'Core Infrastructure Manager'];
    for (let i = 0; i < 3; i++) {
      const em = await Employee.create({
        employeeNumber: `EM-${100 + i}`,
        name: ['Marcus', 'Sophia', 'Julian'][i],
        surname: ['Chen', 'Gomez', 'Blackwood'][i],
        email: `manager.${i+1}@epiuseapp.com`,
        birthDate: '1985-01-01',
        salary: 1100000,
        role: engRoles[i],
        permissionLevel: 'manager',
        password: 'EpiUse123!',
        managerId: cto.id
      });
      engManagers.push(em);
    }

    // 4. Team Leads
    const teamLeads = [];
    const leadRoles = ['Frontend Lead', 'Backend Lead', 'DevOps Lead', 'QA Lead', 'Security Lead', 'Data Lead'];
    for (let i = 0; i < 6; i++) {
      const lead = await Employee.create({
        employeeNumber: `TL-${200 + i}`,
        name: ['Liam', 'Olivia', 'Noah', 'Emma', 'Aiden', 'Ava'][i],
        surname: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][i],
        email: `lead.${i+1}@epiuseapp.com`,
        birthDate: '1988-01-01',
        salary: 850000,
        role: leadRoles[i],
        permissionLevel: 'manager',
        password: 'EpiUse123!',
        managerId: engManagers[i % 3].id
      });
      teamLeads.push(lead);
    }

    // 5. Individual Contributors
    const firstNames = ['James', 'Charlotte', 'Benjamin', 'Mia', 'Henry', 'Amelia', 'Sebastian', 'Evelyn', 'Jack', 'Harper', 'Owen', 'Scarlett', 'Wyatt', 'Victoria', 'Luke', 'Grace', 'Daniel', 'Chloe', 'Gabriel', 'Zoe', 'Matthew', 'Lily', 'David', 'Layla', 'Joseph', 'Lillian', 'Samuel', 'Nora', 'Carter', 'Hannah', 'Anthony', 'Mila', 'Dylan', 'Stella', 'Leo', 'Maya', 'Isaac'];
    const lastNames = ['Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson'];
    
    const icRoles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'QA Analyst', 'UI/UX Designer', 'DevOps Engineer', 'Security Analyst'];

    for (let i = 0; i < 37; i++) {
      let managerId = teamLeads[i % 6].id;
      let role = icRoles[i % icRoles.length];
      let perm = 'employee';

      if (i % 10 === 0) {
        managerId = hrDirector.id;
        role = 'HR Specialist';
        perm = 'hr';
      }

      await Employee.create({
        employeeNumber: `EMP-${300 + i}`,
        name: firstNames[i % firstNames.length],
        surname: lastNames[i % lastNames.length],
        email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@epiuseapp.com`,
        birthDate: '1995-01-01',
        salary: 450000 + (Math.random() * 200000),
        role: role,
        permissionLevel: perm,
        password: 'EpiUse123!',
        managerId: managerId
      });
    }

    console.log('Success! 50 Neon DB employees established.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit();
  }
}

seedTechCompany();
