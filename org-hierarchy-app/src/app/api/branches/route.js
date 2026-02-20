import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * /branches:
 *   get:
 *     summary: Retrieve all branches or a single branch by ID
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: The ID of the branch to retrieve
 *     responses:
 *       200:
 *         description: A list of branches or a single branch
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Branch'
 *                 - $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found (when ID specified but no branch)
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
    const id = url.searchParams.get('id');

    let branches;
    if (id) {
      branches = await prisma.branch.findUnique({
        where: { branch_id: parseInt(id) },
      });
    } else {
      branches = await prisma.branch.findMany({
        orderBy: { name: 'asc' },
      });
    }

    if (id && !branches) {
      return new Response(JSON.stringify({ error: 'Branch not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(branches), {
      status: 200,
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
 * /branches:
 *   post:
 *     summary: Add a new branch
 *     requestBody:
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
 *                 description: The name of the new branch
 *     responses:
 *       201:
 *         description: Branch added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch added
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

    await prisma.branch.create({
      data: { name },
    });

    return new Response(JSON.stringify({ message: 'Branch added' }), {
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
 * /branches:
 *   delete:
 *     summary: Delete a branch by branch_id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branch_id
 *             properties:
 *               branch_id:
 *                 type: integer
 *                 description: The ID of the branch to delete
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch deleted
 *       400:
 *         description: Invalid input or branch in use by employees
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Branch not found
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
    const branch_id = body.branch_id;

    if (!branch_id || isNaN(Number(branch_id))) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing branch_id in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await prisma.branch.delete({
      where: { branch_id: parseInt(branch_id) },
    });

    return new Response(
      JSON.stringify({ message: 'Branch deleted' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      // P2003: Foreign key constraint failed on the database
      return new Response(
        JSON.stringify({
          error: 'Cannot delete branch',
          message: 'This branch is still in use by one or more employees. Remove or reassign those employees first.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Database error',
        details: err.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @swagger
 * /branches:
 *   put:
 *     summary: Update a branch by ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the branch to update
 *               name:
 *                 type: string
 *                 description: The new name of the branch
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch updated
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
    const { id, name } = body;

    if (!id || !name) {
      return new Response(
        JSON.stringify({ error: 'ID and name are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.branch.update({
      where: { branch_id: parseInt(id) },
      data: { name },
    });

    return new Response(JSON.stringify({ message: 'Branch updated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}