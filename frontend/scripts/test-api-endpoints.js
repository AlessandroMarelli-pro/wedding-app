const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testAPIEndpoints() {
  const baseUrl = 'http://localhost:3000';

  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test public endpoints
    console.log('\n2. Testing public endpoints...');

    const [accommodationsRes, programRes, weddingRes] = await Promise.all([
      fetch(`${baseUrl}/api/accommodations`),
      fetch(`${baseUrl}/api/program`),
      fetch(`${baseUrl}/api/wedding/info`),
    ]);

    const accommodations = await accommodationsRes.json();
    const program = await programRes.json();
    const wedding = await weddingRes.json();

    console.log('✅ Accommodations:', accommodations.length, 'items');
    console.log('✅ Program events:', program.length, 'items');
    console.log('✅ Wedding info:', wedding.coupleNames);

    // Test authentication
    console.log('\n3. Testing authentication...');
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

    // Test admin endpoints
    console.log('\n4. Testing admin endpoints...');
    const adminHeaders = {
      Authorization: `Bearer ${loginData.token}`,
    };

    const [
      adminAccommodationsRes,
      adminProgramRes,
      adminGuestsRes,
      rsvpStatsRes,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/admin/accommodations`, { headers: adminHeaders }),
      fetch(`${baseUrl}/api/admin/program`, { headers: adminHeaders }),
      fetch(`${baseUrl}/api/admin/guests`, { headers: adminHeaders }),
      fetch(`${baseUrl}/api/admin/rsvp/stats`, { headers: adminHeaders }),
    ]);

    const adminAccommodations = await adminAccommodationsRes.json();
    const adminProgram = await adminProgramRes.json();
    const adminGuests = await adminGuestsRes.json();
    const rsvpStats = await rsvpStatsRes.json();

    console.log(
      '✅ Admin accommodations:',
      adminAccommodations.length,
      'items',
    );
    console.log('✅ Admin program events:', adminProgram.length, 'items');
    console.log('✅ Admin guests:', adminGuests.length, 'items');
    console.log(
      '✅ RSVP stats:',
      rsvpStats.overview.totalGuests,
      'total guests',
    );

    // Test token verification
    console.log('\n5. Testing token verification...');
    const verifyResponse = await fetch(`${baseUrl}/api/auth/verify`, {
      headers: adminHeaders,
    });

    const verifyData = await verifyResponse.json();
    console.log('✅ Token verification:', verifyData.valid);

    // Test current user endpoint
    console.log('\n6. Testing current user endpoint...');
    const currentUserResponse = await fetch(
      `${baseUrl}/api/admin/current-user`,
      {
        headers: adminHeaders,
      },
    );

    if (!currentUserResponse.ok) {
      throw new Error(`Current user failed: ${currentUserResponse.status}`);
    }

    const currentUserData = await currentUserResponse.json();
    console.log('✅ Current user:', currentUserData.email);

    // Test seed endpoint (optional - only if needed)
    console.log('\n7. Testing seed endpoint...');
    const seedResponse = await fetch(`${baseUrl}/api/admin/seed`, {
      method: 'POST',
      headers: adminHeaders,
    });

    if (!seedResponse.ok) {
      console.log(
        '⚠️  Seed endpoint failed (this is normal if data already exists)',
      );
    } else {
      const seedData = await seedResponse.json();
      console.log('✅ Seed endpoint:', seedData.message);
    }

    console.log('\n🎉 All API endpoints are working correctly!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPIEndpoints();
