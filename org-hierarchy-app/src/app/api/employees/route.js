import { prisma } from '../../../lib/prisma';

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Retrieve all employees or a single employee by employee_number
 *     parameters:
 *       - in: query
 *         name: employee_number
 *         schema:
 *           type: string
 *         required: false
 *         description: The employee number to retrieve
 *     responses:
 *       200:
 *         description: List of employees or single employee
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *                 - $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found (when employee_number specified but no record)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const employeeNumber = url.searchParams.get('employee_number');

    let employees;
    if (employeeNumber) {
      employees = await prisma.employee.findUnique({
        where: { employee_number: employeeNumber },
      });

      if (!employees) {
        return new Response(
          JSON.stringify({ error: 'Employee not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      employees = await prisma.employee.findMany({
        orderBy: { employee_number: 'asc' },
      });
    }

    return new Response(JSON.stringify(employees), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );

}

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Add a new employee (and create user account)
 *     requestBody:
 *       description: Employee object to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_number
 *               - dept_number
 *               - branch_number
 *               - role_number
 *               - name
 *               - surname
 *               - birth_date
 *               - salary
 *             properties:
 *               employee_number:
 *                 type: string
 *               dept_number:
 *                 type: string
 *               branch_number:
 *                 type: string
 *               role_number:
 *                 type: string
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               salary:
 *                 type: number
 *     responses:
 *       201:
 *         description: Employee added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employee added
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      employee_number,
      dept_number,
      branch_number,
      role_number,
      name,
      surname,
      birth_date,
      salary,
      email,
      password,
    } = body;

    await prisma.employee.create({
      data: {
        employee_number,
        dept_number,
        branch_number,
        role_number,
        name,
        surname,
        birth_date: new Date(birth_date),
        salary,
        user: {
          create: {
            employee_number: employee_number,
            email: email,
            password: password,
          },
        },
      },
    });

    return new Response(JSON.stringify({ message: 'Employee added' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @swagger
 * /employees:
 *   put:
 *     summary: Update an existing employee
 *     requestBody:
 *       description: Employee object with updated fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_number
 *               - dept_number
 *               - branch_number
 *               - role_number
 *               - name
 *               - surname
 *               - birth_date
 *               - salary
 *             properties:
 *               employee_number:
 *                 type: string
 *               dept_number:
 *                 type: string
 *               branch_number:
 *                 type: string
 *               role_number:
 *                 type: string
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               salary:
 *                 type: number
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employee updated
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      employee_number,
      dept_number,
      branch_number,
      role_number,
      name,
      surname,
      birth_date,
      salary,
    } = body;

    await prisma.employee.update({
      where: { employee_number: employee_number },
      data: {
        dept_number,
        branch_number,
        role_number,
        name,
        surname,
        birth_date: new Date(birth_date),
        salary,
      },
    });

    return new Response(JSON.stringify({ message: 'Employee updated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );

}

/**
 * @swagger
 * /employees:
 *   delete:
 *     summary: Delete an employee by employee_number, reassign managed employees if needed
 *     parameters:
 *       - in: query
 *         name: employee_number
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee number to delete
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employee deleted
 *       400:
 *         description: Missing employee_number or cannot reassign managed employees due to no upper manager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employee_number = searchParams.get('employee_number');

    if (!employee_number) {
      return new Response(JSON.stringify({ error: 'Employee number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const managers = await prisma.reportingLineManager.findMany({
      where: { employee_id: employee_number },
      select: { manager_id: true },
    });

    let upperManagerId = null;
    if (managers.length > 0) {
      upperManagerId = managers[0].manager_id;
    }

    const managedEmployees = await prisma.reportingLineManager.findMany({
      where: { manager_id: employee_number },
      select: { employee_id: true },
    });

    console.log('Managed Employees:', managedEmployees);
    if (managedEmployees.length > 0) {
      if (!upperManagerId) {
        return new Response(
          JSON.stringify({ error: 'Cannot reassign managed employees: no upper manager found' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      await prisma.reportingLineManager.updateMany({
        where: { manager_id: employee_number },
        data: { manager_id: upperManagerId },
      });
    }

    await prisma.user.delete({
      where: { employee_number: employee_number },
    });
    await prisma.employee.delete({
      where: { employee_number: employee_number },
    });

    await prisma.reportingLineManager.deleteMany({
      where: {
        OR: [
          { employee_id: employee_number },
          { manager_id: employee_number },
        ],
      },
    });

    return new Response(JSON.stringify({ message: 'Employee deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      console.error(err),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );

}
