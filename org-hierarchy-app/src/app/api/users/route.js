import { prisma } from '../../../lib/prisma';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve all users with their employee numbers and emails
 *     description: Returns a list of users containing only their employee_number and email fields.
 *     responses:
 *       200:
 *         description: A JSON array of user objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   employee_number:
 *                     type: integer
 *                     example: 12345
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: user@example.com
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database error
 *                 details:
 *                   type: string
 *                   example: Error message details
 */

export async function GET(request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        employee_number: true,
        email: true,
      },
    });

    return new Response(JSON.stringify(users), {
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
