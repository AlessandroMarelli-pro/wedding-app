const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testAuth() {
  const baseUrl = 'http://localhost:3000';

  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test login
    console.log('1. Testing admin login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@wedding.com',
        password: 'admin123',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.admin.email);

    // Test token verification
    console.log('\n2. Testing token verification...');
    const verifyResponse = await fetch(`${baseUrl}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
      },
    });

    if (!verifyResponse.ok) {
      throw new Error(`Token verification failed: ${verifyResponse.status}`);
    }

    const verifyData = await verifyResponse.json();
    console.log('✅ Token verification successful:', verifyData.valid);

    // Test protected endpoint
    console.log('\n3. Testing protected endpoint...');
    const weddingResponse = await fetch(`${baseUrl}/api/wedding/info`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        coupleNames: 'Test Couple',
        presentationMessage: 'Test message',
      }),
    });

    if (!weddingResponse.ok) {
      throw new Error(`Protected endpoint failed: ${weddingResponse.status}`);
    }

    const weddingData = await weddingResponse.json();
    console.log('✅ Protected endpoint successful:', weddingData.coupleNames);

    console.log('\n🎉 All authentication tests passed!');
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. PostgreSQL is running');
    console.log('2. Database is set up (run setup scripts)');
    console.log('3. Next.js dev server is running (npm run dev)');
  }
}

testAuth();
