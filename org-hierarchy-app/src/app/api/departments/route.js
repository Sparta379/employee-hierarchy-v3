import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Retrieve all departments or a single department by ID
 *     parameters:
 *       - in: query
 *         name: dept_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: The ID of the department to retrieve
 *     responses:
 *       200:
 *         description: List of departments or a single department object
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *                 - $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found (when dept_id specified but not found)
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
    const deptId = url.searchParams.get('dept_id');
    let departments;

    if (deptId) {
      departments = await prisma.department.findUnique({
        where: { dept_id: parseInt(deptId) },
      });

      if (!departments) {
        return new Response(JSON.stringify({ error: 'Department not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      departments = await prisma.department.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return new Response(JSON.stringify(departments), {
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
 * /departments:
 *   post:
 *     summary: Add a new department
 *     requestBody:
 *       description: Department object that needs to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the new department
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department added
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
    const { name } = body;

    await prisma.department.create({
      data: { name },
    });

    return new Response(JSON.stringify({ message: 'Department added' }), {
      status: 201,
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
 * /departments:
 *   put:
 *     summary: Update an existing department by ID
 *     requestBody:
 *       description: Department object with updated information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dept_id
 *               - name
 *             properties:
 *               dept_id:
 *                 type: integer
 *                 description: ID of the department to update
 *               name:
 *                 type: string
 *                 description: New name of the department
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department updated
 *       400:
 *         description: Missing required fields
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
    const body = await request.json();
    const { dept_id, name } = body;

    if (!dept_id || !name) {
      return new Response(JSON.stringify({ error: 'Department ID and name are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await prisma.department.update({
      where: { dept_id: parseInt(dept_id) },
      data: { name },
    });

    return new Response(JSON.stringify({ message: 'Department updated' }), {
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
 * /departments:
 *   delete:
 *     summary: Delete a department by ID
 *     requestBody:
 *       description: Object containing department ID to delete
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dept_id
 *             properties:
 *               dept_id:
 *                 type: integer
 *                 description: ID of the department to delete
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department deleted
 *       400:
 *         description: Missing department ID in request
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
    const body = await request.json();
    const { dept_id } = body;
    if (!dept_id) {
      return new Response(JSON.stringify({ error: 'Department ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await prisma.department.delete({
      where: { dept_id: parseInt(dept_id) },
    });

    return new Response(JSON.stringify({ message: 'Department deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      // P2003: Foreign key constraint failed on the database
      return new Response(
        JSON.stringify({
          error: 'Cannot delete department',
          message: 'This department is still in use by one or more employees. Remove or reassign those employees first.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );

}
