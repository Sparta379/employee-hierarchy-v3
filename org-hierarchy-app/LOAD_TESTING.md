This file explains how to run basic load tests locally and in CI using `k6`.

Quick setup (local):

1. Install k6:
   - macOS: `brew install k6`
   - Windows: use Chocolatey `choco install k6` or use Docker
   - Docker: `docker run --rm -i -v "$(pwd)":/scripts -w /scripts loadimpact/k6 run load-tests/k6-script.js`

2. Copy env example to local env and start the app:

```bash
cp .env.local.example .env.local
# fill in DATABASE_URL and DIRECT_URL (use your Neon values)
cd org-hierarchy-app
npm install
# If you haven't generated Prisma client locally:
npx prisma generate
npm run dev
```

3. Run the k6 script against your local server (default http://localhost:3000):

```bash
# run with BASE_URL overridden if needed
BASE_URL=http://localhost:3000 k6 run load-tests/k6-script.js
```

4. Example using Docker:

```bash
docker run --rm -i -v "%CD%":/scripts -w /scripts loadimpact/k6 run load-tests/k6-script.js
```

Advanced/CI notes:

- In CI (or a staging environment) set `BASE_URL` to the deployed staging URL and run higher stages/targets.
- Monitor metrics: p95 latency, error rate, and requests/sec. Adjust `options.stages` in `load-tests/k6-script.js` for longer/higher tests.

Interpreting results:

- `http_req_duration` p95 under 500ms is a reasonable target for small deployments; adjust for your environment.
- If errors or timeouts occur, inspect application logs (Vercel or local terminal), check DB connection limits, and scale up the database or use pooled connections.

Load testing tips for serverless (Vercel):

- Vercel serverless functions have cold starts and concurrency limits. Use incremental/static pages where possible for public data endpoints (caching), and run load tests against a staging self-hosted instance when you need realistic performance numbers.
- For realistic cloud testing against a deployed Vercel app, prefer moderate concurrency and longer ramp-up to allow lambdas to warm.
