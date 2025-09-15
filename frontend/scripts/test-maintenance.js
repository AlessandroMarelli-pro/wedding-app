require('dotenv').config({ path: './.env' });

async function testMaintenance() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  console.log('🧪 Testing Maintenance System...\n');

  // First, login to get auth token
  console.log('🔐 Logging in...');
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@wedding.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    }),
  });

  if (!loginResponse.ok) {
    throw new Error('Login failed');
  }

  const loginData = await loginResponse.json();
  const token = loginData.accessToken;
  console.log('✅ Login successful\n');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test storage usage
  console.log('📊 Testing storage usage...');
  try {
    const usageResponse = await fetch(
      `${baseUrl}/api/admin/maintenance/report?action=storage-usage`,
      {
        headers,
      },
    );

    if (usageResponse.ok) {
      const usage = await usageResponse.json();
      console.log('✅ Storage usage retrieved');
      console.log(`   Total files: ${usage.usage.totalFiles}`);
      console.log(`   Total size: ${usage.usage.totalSize} bytes`);
      console.log(
        `   Directories: ${Object.keys(usage.usage.directories).length}`,
      );
    } else {
      const error = await usageResponse.json();
      console.log('❌ Storage usage failed:', error.error);
    }
  } catch (error) {
    console.log('❌ Storage usage error:', error.message);
  }

  console.log('');

  // Test upload health validation
  console.log('🏥 Testing upload health validation...');
  try {
    const healthResponse = await fetch(
      `${baseUrl}/api/admin/maintenance/report?action=health`,
      {
        headers,
      },
    );

    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Upload health validated');
      console.log(`   Healthy: ${health.health.healthy}`);
      console.log(`   Issues: ${health.health.issues.length}`);
      if (health.health.issues.length > 0) {
        health.health.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
      }
    } else {
      const error = await healthResponse.json();
      console.log('❌ Upload health validation failed:', error.error);
    }
  } catch (error) {
    console.log('❌ Upload health validation error:', error.message);
  }

  console.log('');

  // Test manual cleanup
  console.log('🧹 Testing manual cleanup...');
  try {
    const cleanupResponse = await fetch(
      `${baseUrl}/api/admin/maintenance/cleanup?action=manual`,
      {
        method: 'POST',
        headers,
      },
    );

    if (cleanupResponse.ok) {
      const cleanup = await cleanupResponse.json();
      console.log('✅ Manual cleanup completed');
      console.log(`   Temp files cleaned: ${cleanup.result.tempFiles}`);
      console.log(`   Orphaned files cleaned: ${cleanup.result.orphanedFiles}`);
      console.log(`   Space freed: ${cleanup.result.freedSpace} bytes`);
    } else {
      const error = await cleanupResponse.json();
      console.log('❌ Manual cleanup failed:', error.error);
    }
  } catch (error) {
    console.log('❌ Manual cleanup error:', error.message);
  }

  console.log('');

  // Test cron endpoints (without auth - they use CRON_SECRET)
  console.log('⏰ Testing cron endpoints...');
  const cronSecret = process.env.CRON_SECRET || 'test-cron-secret';

  // Test hourly cleanup
  try {
    const hourlyResponse = await fetch(`${baseUrl}/api/cron/hourly-cleanup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    if (hourlyResponse.ok) {
      const result = await hourlyResponse.json();
      console.log('✅ Hourly cleanup cron test successful');
      console.log(`   Files cleaned: ${result.deletedCount}`);
    } else {
      const error = await hourlyResponse.json();
      console.log('❌ Hourly cleanup cron test failed:', error.error);
    }
  } catch (error) {
    console.log('❌ Hourly cleanup cron test error:', error.message);
  }

  console.log('\n🎉 Maintenance system testing completed!');
}

testMaintenance().catch(console.error);
