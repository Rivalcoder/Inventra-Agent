// Simple test runner for /api/db/create-cluster
// Usage: node scripts/test-create-cluster.mjs [baseUrl]

const BASE_URL = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';

async function callCreateCluster(body) {
  const res = await fetch(`${BASE_URL}/api/db/create-cluster`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let json;
  try {
    json = await res.json();
  } catch (e) {
    json = { parseError: String(e) };
  }
  return { status: res.status, json };
}

async function run() {
  const cases = [
    {
      name: 'Empty body',
      body: {},
    },
    {
      name: 'Only username (not email)',
      body: { username: 'john' },
    },
    {
      name: 'Username looks like email, missing password/database (email inferred)',
      body: { username: 'john.doe@example.com' },
    },
    {
      name: 'Missing database',
      body: { username: 'john', email: 'john@example.com', password: 'secret' },
    },
    {
      name: 'All fields present (likely 500 if env not set)',
      body: {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'StrongPass123!',
        database: 'ai_inventory_test',
        includeDummyData: false,
      },
    },
  ];

  for (const test of cases) {
    const start = Date.now();
    const { status, json } = await callCreateCluster(test.body);
    const ms = Date.now() - start;
    console.log(`\n=== ${test.name} ===`);
    console.log(`Request:`, test.body);
    console.log(`Response: ${status} in ${ms}ms`);
    console.log(`Body:`, json);
  }
}

run().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});


