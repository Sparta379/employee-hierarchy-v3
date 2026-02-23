import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res1 = http.get(`${BASE_URL}/api/employees`);
  check(res1, {
    'employees status 200': (r) => r.status === 200,
  });

  const res2 = http.get(`${BASE_URL}/api/hierarchy`);
  check(res2, {
    'hierarchy status 200': (r) => r.status === 200,
  });

  // small pause between iterations
  sleep(1);
}
