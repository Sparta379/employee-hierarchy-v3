import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";


async function main() {
  console.log('Starting seed...');

  // --- Create Branches ---
  const branchA = await prisma.branch.upsert({
    where: { name: 'Headquarters' },
    update: {},
    create: { name: 'Headquarters' },
  });
  const branchB = await prisma.branch.upsert({
    where: { name: 'Regional Office East' },
    update: {},
    create: { name: 'Regional Office East' },
  });
  console.log(`Created branches: ${branchA.name}, ${branchB.name}`);

  // --- Create Departments ---
  const deptHR = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: { name: 'Human Resources' },
  });
  const deptIT = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: { name: 'Information Technology' },
  });
  const deptSales = await prisma.department.upsert({
    where: { name: 'Sales' },
    update: {},
    create: { name: 'Sales' },
  });
  console.log(`Created departments: ${deptHR.name}, ${deptIT.name}, ${deptSales.name}`);

  // --- Create Roles ---
  const roleCEO = await prisma.role.upsert({
    where: { name: 'Chief Executive Officer' },
    update: {},
    create: { name: 'Chief Executive Officer' },
  });
  const roleManager = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: { name: 'Manager' },
  });
  const roleAssociate = await prisma.role.upsert({
    where: { name: 'Associate' },
    update: {},
    create: { name: 'Associate' },
  });
  console.log(`Created roles: ${roleCEO.name}, ${roleManager.name}, ${roleAssociate.name}`);

  // --- Create Employees and Users ---
  const defaultPassword = 'password123'; // Example password

  // Employee 1 (CEO) - Alice Smith
  const emp1Number = 'E001';
  const emp1Email = 'alice.smith@epiuse.com';
  const emp1HashedPass = await bcrypt.hash(defaultPassword + emp1Email + emp1Number, 10);
  const emp1 = await prisma.employee.upsert({
    where: { employee_number: emp1Number },
    update: {
      name: 'Alice', surname: 'Smith', birth_date: new Date('1970-01-15'), salary: 150000.00,
      branch_number: branchA.branch_id, dept_number: deptHR.dept_id, role_number: roleCEO.role_id,
      user: {
        upsert: {
          create: { email: emp1Email, password: emp1HashedPass },
          update: { email: emp1Email, password: emp1HashedPass },
        }
      }
    },
    create: {
      employee_number: emp1Number,
      name: 'Alice',
      surname: 'Smith',
      birth_date: new Date('1970-01-15'),
      salary: 150000.00,
      branch_number: branchA.branch_id,
      dept_number: deptHR.dept_id,
      role_number: roleCEO.role_id,
      user: {
        create: {
          email: emp1Email,
          password: emp1HashedPass,
        },
      },
    },
  });
  console.log(`Created/updated employee: ${emp1.name} ${emp1.surname}`);

  // Employee 2 (Manager under CEO) - Bob Johnson
  const emp2Number = 'E002';
  const emp2Email = 'bob.johnson@epiuse.com';
  const emp2HashedPass = await bcrypt.hash(defaultPassword + emp2Email + emp2Number, 10);
  const emp2 = await prisma.employee.upsert({
    where: { employee_number: emp2Number },
    update: {
      name: 'Bob', surname: 'Johnson', birth_date: new Date('1980-05-20'), salary: 90000.00,
      branch_number: branchA.branch_id, dept_number: deptIT.dept_id, role_number: roleManager.role_id,
      user: {
        upsert: {
          create: { email: emp2Email, password: emp2HashedPass },
          update: { email: emp2Email, password: emp2HashedPass },
        }
      }
    },
    create: {
      employee_number: emp2Number,
      name: 'Bob',
      surname: 'Johnson',
      birth_date: new Date('1980-05-20'),
      salary: 90000.00,
      branch_number: branchA.branch_id,
      dept_number: deptIT.dept_id,
      role_number: roleManager.role_id,
      user: {
        create: {
          email: emp2Email,
          password: emp2HashedPass,
        },
      },
    },
  });
  console.log(`Created/updated employee: ${emp2.name} ${emp2.surname}`);

  // Employee 3 (Associate under Bob) - Charlie Brown
  const emp3Number = 'E003';
  const emp3Email = 'charlie.brown@epiuse.com';
  const emp3HashedPass = await bcrypt.hash(defaultPassword + emp3Email + emp3Number, 10);
  const emp3 = await prisma.employee.upsert({
    where: { employee_number: emp3Number },
    update: {
      name: 'Charlie', surname: 'Brown', birth_date: new Date('1990-11-01'), salary: 60000.00,
      branch_number: branchA.branch_id, dept_number: deptIT.dept_id, role_number: roleAssociate.role_id,
      user: {
        upsert: {
          create: { email: emp3Email, password: emp3HashedPass },
          update: { email: emp3Email, password: emp3HashedPass },
        }
      }
    },
    create: {
      employee_number: emp3Number,
      name: 'Charlie',
      surname: 'Brown',
      birth_date: new Date('1990-11-01'),
      salary: 60000.00,
      branch_number: branchA.branch_id,
      dept_number: deptIT.dept_id,
      role_number: roleAssociate.role_id,
      user: {
        create: {
          email: emp3Email,
          password: emp3HashedPass,
        },
      },
    },
  });
  console.log(`Created/updated employee: ${emp3.name} ${emp3.surname}`);

  // Employee 4 (Manager under CEO, different branch/dept) - Diana Prince
  const emp4Number = 'E004';
  const emp4Email = 'diana.prince@epiuse.com';
  const emp4HashedPass = await bcrypt.hash(defaultPassword + emp4Email + emp4Number, 10);
  const emp4 = await prisma.employee.upsert({
    where: { employee_number: emp4Number },
    update: {
      name: 'Diana', surname: 'Prince', birth_date: new Date('1975-03-10'), salary: 100000.00,
      branch_number: branchB.branch_id, dept_number: deptSales.dept_id, role_number: roleManager.role_id,
      user: {
        upsert: {
          create: { email: emp4Email, password: emp4HashedPass },
          update: { email: emp4Email, password: emp4HashedPass },
        }
      }
    },
    create: {
      employee_number: emp4Number,
      name: 'Diana',
      surname: 'Prince',
      birth_date: new Date('1975-03-10'),
      salary: 100000.00,
      branch_number: branchB.branch_id,
      dept_number: deptSales.dept_id,
      role_number: roleManager.role_id,
      user: {
        create: {
          email: emp4Email,
          password: emp4HashedPass,
        },
      },
    },
  });
  console.log(`Created/updated employee: ${emp4.name} ${emp4.surname}`);

  // Employee 5 (Unassigned Employee) - Eve Adams
  const emp5Number = 'E005';
  const emp5Email = 'eve.adams@epiuse.com';
  const emp5HashedPass = await bcrypt.hash(defaultPassword + emp5Email + emp5Number, 10);
  const emp5 = await prisma.employee.upsert({
    where: { employee_number: emp5Number },
    update: {
      name: 'Eve', surname: 'Adams', birth_date: new Date('1995-07-25'), salary: 55000.00,
      branch_number: branchA.branch_id, dept_number: deptHR.dept_id, role_number: roleAssociate.role_id,
      user: {
        upsert: {
          create: { email: emp5Email, password: emp5HashedPass },
          update: { email: emp5Email, password: emp5HashedPass },
        }
      }
    },
    create: {
      employee_number: emp5Number,
      name: 'Eve',
      surname: 'Adams',
      birth_date: new Date('1995-07-25'),
      salary: 55000.00,
      branch_number: branchA.branch_id,
      dept_number: deptHR.dept_id,
      role_number: roleAssociate.role_id,
      user: {
        create: {
          email: emp5Email,
          password: emp5HashedPass,
        },
      },
    },
  });
  console.log(`Created/updated employee: ${emp5.name} ${emp5.surname}`);


  // --- Create Reporting Line Managers (Hierarchy) ---
  console.log('Creating/updating hierarchy...');
  // Bob (E002) reports to Alice (E001)
  await prisma.reportingLineManager.upsert({
    where: { employee_id_manager_id: { employee_id: emp2.employee_number, manager_id: emp1.employee_number } },
    update: {},
    create: { employee_id: emp2.employee_number, manager_id: emp1.employee_number },
  });

  // Charlie (E003) reports to Bob (E002)
  await prisma.reportingLineManager.upsert({
    where: { employee_id_manager_id: { employee_id: emp3.employee_number, manager_id: emp2.employee_number } },
    update: {},
    create: { employee_id: emp3.employee_number, manager_id: emp2.employee_number },
  });

  // Diana (E004) reports to Alice (E001)
  await prisma.reportingLineManager.upsert({
    where: { employee_id_manager_id: { employee_id: emp4.employee_number, manager_id: emp1.employee_number } },
    update: {},
    create: { employee_id: emp4.employee_number, manager_id: emp1.employee_number },
  });
  console.log('Hierarchy created/updated.');

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
