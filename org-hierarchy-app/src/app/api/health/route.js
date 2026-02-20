export async function GET() {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  try {
    return new Response(JSON.stringify(healthcheck), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    healthcheck.message = e;
    return new Response(JSON.stringify(healthcheck), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
