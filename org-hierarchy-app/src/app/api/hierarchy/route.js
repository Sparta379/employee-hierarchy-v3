import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * /reporting_line_managers:
 *   get:
 *     summary: Retrieve reporting lines for all employees or a specific employee
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Employee ID to filter reporting lines
 *     responses:
 *       200:
 *         description: Reporting line(s) retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportingLineManager'
 *       404:
 *         description: Employee not found (if employee_id specified but no data)
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
    const employee_id = url.searchParams.get('employee_id');
    let reportingLines;

    if (employee_id) {
      reportingLines = await prisma.reportingLineManager.findMany({
        where: { employee_id: employee_id },
      });

      if (reportingLines.length === 0) {
        return new Response(JSON.stringify({ error: 'Employee not found in reporting lines' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      reportingLines = await prisma.reportingLineManager.findMany();
    }

    return new Response(JSON.stringify(reportingLines), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Database error in GET:', err);
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @swagger
 * /reporting_line_managers:
 *   post:
 *     summary: Add a reporting line manager relationship
 *     requestBody:
 *       description: Reporting line relationship to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - manager_id
 *             properties:
 *               employee_id:
 *                 type: string
 *                 description: Employee ID
 *               manager_id:
 *                 type: string
 *                 description: Manager ID
 *     responses:
 *       201:
 *         description: Manager added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Manager added successfully
 *       400:
 *         description: Invalid input or circular reference detected
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

export async function POST(request) {
  try {
    const data = await request.json();
    const { employee_id, manager_id } = data;

    if (!employee_id || !manager_id) {
      return new Response(
        JSON.stringify({ error: 'employee_id and manager_id are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the relationship would create a circular reference
    const isCircular = await checkCircularReference(employee_id, manager_id);
    if (isCircular) {
      return new Response(
        JSON.stringify({ error: 'Cannot create circular reporting relationship' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if employee and manager exist
    const employeeCheck = await prisma.employee.count({
      where: { employee_number: employee_id },
    });
    const managerCheck = await prisma.employee.count({
      where: { employee_number: manager_id },
    });

    if (employeeCheck === 0) {
      return new Response(
        JSON.stringify({ error: 'Employee does not exist' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (managerCheck === 0) {
      return new Response(
        JSON.stringify({ error: 'Manager does not exist' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if relationship already exists
    const existingCheck = await prisma.reportingLineManager.count({
      where: { employee_id: employee_id, manager_id: manager_id },
    });

    if (existingCheck > 0) {
      return new Response(
        JSON.stringify({ message: 'Relationship already exists' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.reportingLineManager.create({
      data: { employee_id, manager_id },
    });

    return new Response(JSON.stringify({ message: 'Manager added successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Database error in POST:', err);
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @swagger
 * /reporting_line_managers:
 *   delete:
 *     summary: Delete a reporting line manager relationship
 *     requestBody:
 *       description: Reporting line relationship to delete
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - manager_id
 *             properties:
 *               employee_id:
 *                 type: string
 *               manager_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Manager removed successfully
 *       400:
 *         description: Missing employee_id or manager_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No matching record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function DELETE(request) {
  try {
    const data = await request.json();
    const { employee_id, manager_id } = data;

    if (!employee_id || !manager_id) {
      return new Response(
        JSON.stringify({ error: 'employee_id and manager_id are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await prisma.reportingLineManager.delete({
      where: {
        employee_id_manager_id: {
          employee_id: employee_id,
          manager_id: manager_id,
        },
      },
    });

    return new Response(JSON.stringify({ message: 'Manager removed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return new Response(JSON.stringify({ error: 'No matching record found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('Database error in DELETE:', err);
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @swagger
 * /reporting_line_managers:
 *   put:
 *     summary: Update a reporting line manager relationship
 *     requestBody:
 *       description: Reporting line relationship update info
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - manager_id
 *             properties:
 *               employee_id:
 *                 type: string
 *               manager_id:
 *                 type: string
 *               old_manager_id:
 *                 type: string
 *                 description: Previous manager ID to remove (optional)
 *     responses:
 *       200:
 *         description: Manager updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Manager updated successfully
 *       400:
 *         description: Invalid input or circular reference detected
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

export async function PUT(request) {
  try {
    const data = await request.json();
    const { employee_id, manager_id, old_manager_id } = data;

    if (!employee_id || !manager_id) {
      return new Response(
        JSON.stringify({ error: 'employee_id and manager_id are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for circular reference
    const isCircular = await checkCircularReference(employee_id, manager_id);
    if (isCircular) {
      return new Response(
        JSON.stringify({ error: 'Cannot create circular reporting relationship' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Remove old relationship if specified
      if (old_manager_id) {
        await tx.reportingLineManager.delete({
          where: {
            employee_id_manager_id: {
              employee_id: employee_id,
              manager_id: old_manager_id,
            },
          },
        });
      } else {
        // Remove any existing relationships for this employee
        await tx.reportingLineManager.deleteMany({
          where: { employee_id: employee_id },
        });
      }

      // Add new relationship
      await tx.reportingLineManager.create({
        data: { employee_id, manager_id },
      });
    });

    return new Response(JSON.stringify({ message: 'Manager updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Database error in PUT:', err);
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to check for circular references
async function checkCircularReference(employeeId, managerId) {
  // If employee is trying to report to themselves
  if (employeeId === managerId) {
    return true;
  }

  // Check if the new manager is already reporting to the employee (directly or indirectly)
  const visited = new Set();
  const queue = [managerId];

  while (queue.length > 0) {
    const currentEmployee = queue.shift();
    
    if (visited.has(currentEmployee)) {
      continue;
    }
    
    visited.add(currentEmployee);

    // If we find the employee in the manager's reporting chain, it's circular
    if (currentEmployee === employeeId) {
      return true;
    }

    // Get all managers of the current employee
    const managers = await prisma.reportingLineManager.findMany({
      where: { employee_id: currentEmployee },
      select: { manager_id: true },
    });

    for (const manager of managers) {
      if (!visited.has(manager.manager_id)) {
        queue.push(manager.manager_id);
      }
    }
  }

  return false;
}