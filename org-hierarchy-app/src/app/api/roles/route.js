import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get roles
 *     description: Retrieve a list of all roles or a single role by role_id.
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Role ID to fetch a specific role.
 *     responses:
 *       200:
 *         description: A role or list of roles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   role_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *       404:
 *         description: Role not found.
 *       500:
 *         description: Database error.
 */

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const roleId = url.searchParams.get('role_id');
    let roles;

    if (roleId) {
      roles = await prisma.role.findUnique({
        where: { role_id: parseInt(roleId) },
      });

      if (!roles) {
        return new Response(JSON.stringify({ error: 'Role not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      roles = await prisma.role.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return new Response(JSON.stringify(roles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error fetching roles:', err);
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Add a new role
 *     description: Insert a new role into the database.
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
 *                 description: Role name.
 *     responses:
 *       201:
 *         description: Role added successfully.
 *       500:
 *         description: Database error.
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    await prisma.role.create({
      data: { name },
    });

    return new Response(JSON.stringify({ message: 'Role added' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error adding role:', err);
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @swagger
 * /roles:
 *   put:
 *     summary: Update a role
 *     description: Update the name of an existing role by role_id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *               - name
 *             properties:
 *               role_id:
 *                 type: integer
 *                 description: Role ID.
 *               name:
 *                 type: string
 *                 description: New role name.
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *       400:
 *         description: Missing role_id or name.
 *       500:
 *         description: Database error.
 */

export async function PUT(request) {
  try {
    const body = await request.json();
    const { role_id, name } = body;

    if (!role_id || !name) {
      return new Response(JSON.stringify({ error: 'Role ID and name are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Updating role ID:', role_id, 'to name:', name);

    await prisma.role.update({
      where: { role_id: parseInt(role_id) },
      data: { name },
    });

    return new Response(JSON.stringify({ message: 'Role updated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error updating role:', err);
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @swagger
 * /roles:
 *   delete:
 *     summary: Delete a role
 *     description: Delete a role by role_id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *             properties:
 *               role_id:
 *                 type: integer
 *                 description: Role ID to delete.
 *     responses:
 *       200:
 *         description: Role deleted successfully.
 *       400:
 *         description: Missing role_id.
 *       500:
 *         description: Database error.
 */

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { role_id } = body;

    if (!role_id) {
      return new Response(JSON.stringify({ error: 'Role ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Deleting role ID:', role_id);

    await prisma.role.delete({
      where: { role_id: parseInt(role_id) },
    });

    return new Response(JSON.stringify({ message: 'Role deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error deleting role:', err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      // P2003: Foreign key constraint failed on the database
      return new Response(
        JSON.stringify({
          error: 'Cannot delete role',
          message: 'This role is still in use by one or more employees. Remove or reassign those employees first.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
