// Simplified example for session validation endpoint
import { prisma } from '../../../lib/prisma';

/**
 * @swagger
 * /session/validate:
 *   post:
 *     summary: Validate a user session token
 *     description: Checks if the provided session token exists and has not expired.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Session token to validate.
 *     responses:
 *       200:
 *         description: Session token is valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 expiry:
 *                   type: string
 *                   format: date-time
 *                   description: Token expiration date/time.
 *       401:
 *         description: Token is invalid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *       500:
 *         description: Server error.
 */

export async function POST(req) {
  try {
    const { token } = await req.json();

    const user = await prisma.user.findUnique({
      where: { token: token },
      select: { token_expire: true },
    });

    if (!user || !user.token_expire) {
      return new Response(JSON.stringify({ valid: false }), { status: 401 });
    }

    const tokenExpire = user.token_expire;
    const now = new Date();

    if (tokenExpire <= now) {
      return new Response(JSON.stringify({ valid: false }), { status: 401 });
    }

    return new Response(JSON.stringify({ valid: true, expiry: tokenExpire.toISOString() }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500 });
  }
}
