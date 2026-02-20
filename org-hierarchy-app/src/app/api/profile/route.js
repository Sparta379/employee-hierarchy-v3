import crypto from 'crypto';

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Fetch Gravatar profile data by email
 *     description: Retrieves Gravatar profile information for a given email address by querying the Gravatar API using SHA256 hashed email.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address to fetch Gravatar profile for
 *     responses:
 *       200:
 *         description: Gravatar profile data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Gravatar profile JSON data
 *       400:
 *         description: Missing or invalid email query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Gravatar profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       5XX:
 *         description: Gravatar API or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(request) {
  try {
    // Get email from query param (e.g., /api/profile?email=user@example.com)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email query param required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Normalize and hash email using SHA256
    const normalizedEmail = email.trim().toLowerCase();
    const hash = crypto.createHash('sha256').update(normalizedEmail).digest('hex');

    // Build Gravatar API URL
    const url = `https://api.gravatar.com/v3/profiles/${hash}`;
    console.log(`Fetching Gravatar ${url}`);
    // Fetch from Gravatar API with your API key from env
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GRAVATAR_API_KEY}`,
      },
    });

    if (res.status === 404) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(
        JSON.stringify({ error: `Gravatar API error: ${res.status}`, details: errorText }),
        {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const profileData = await res.json();

    return new Response(JSON.stringify(profileData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
