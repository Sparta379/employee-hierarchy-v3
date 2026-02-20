import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate user and generate a login token
 *     description: Verifies user credentials and returns an authentication token along with user role.
 *     requestBody:
 *       description: User email and password for login
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mysecretpassword
 *     responses:
 *       200:
 *         description: Login successful, returns token and user role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *                 role:
 *                   type: string
 *                   description: User role name
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Database error or missing employee/role data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { employee: { include: { role: true } } }, // Include employee and role data
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const combined = password + email + user.employee_number;
    const passwordMatch = await bcrypt.compare(combined, user.password);

    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user.employee || !user.employee.role) {
      return new Response(
        JSON.stringify({ error: 'Employee or role data not found for user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const roleName = user.employee.role.name;

    const token = crypto.randomBytes(32).toString('hex');

    const expires = new Date(Date.now() + 4 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { employee_number: user.employee_number },
      data: { token, token_expire: expires },
    });

    return new Response(
      JSON.stringify({ message: 'Login successful', token, role: roleName }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Database error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}