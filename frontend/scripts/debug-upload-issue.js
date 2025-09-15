require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');

async function debugUploadIssue() {
  const prisma = new PrismaClient();

  console.log('🔍 Debugging Upload Issue...\n');

  try {
    // Check all admins in database
    console.log('1. Checking all admins in database:');
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    console.log('   Admins found:', admins.length);
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ID: ${admin.id}, Email: ${admin.email}`);
    });

    // Check recent CSV uploads
    console.log('\n2. Checking recent CSV uploads:');
    const csvUploads = await prisma.cSVUpload.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        uploadedBy: true,
        status: true,
        createdAt: true,
      },
    });
    console.log('   Recent uploads:', csvUploads.length);
    csvUploads.forEach((upload, index) => {
      console.log(
        `   ${index + 1}. File: ${upload.filename}, UploadedBy: ${upload.uploadedBy}, Status: ${upload.status}`,
      );
    });

    // Check for orphaned uploads (uploads with non-existent admins)
    console.log('\n3. Checking for orphaned uploads:');
    const orphanedUploads = await prisma.cSVUpload.findMany({
      where: {
        uploadedBy: {
          notIn: admins.map((admin) => admin.id),
        },
      },
      select: {
        id: true,
        filename: true,
        uploadedBy: true,
        createdAt: true,
      },
    });

    if (orphanedUploads.length > 0) {
      console.log('   ⚠️  Found orphaned uploads:', orphanedUploads.length);
      orphanedUploads.forEach((upload, index) => {
        console.log(
          `   ${index + 1}. File: ${upload.filename}, UploadedBy: ${upload.uploadedBy} (NOT FOUND)`,
        );
      });
    } else {
      console.log('   ✅ No orphaned uploads found');
    }

    // Test admin validation
    console.log('\n4. Testing admin validation:');
    if (admins.length > 0) {
      const testAdmin = admins[0];
      const adminExists = await prisma.admin.findUnique({
        where: { id: testAdmin.id },
      });
      console.log(
        `   Testing admin ${testAdmin.id}: ${adminExists ? '✅ EXISTS' : '❌ NOT FOUND'}`,
      );
    }

    // Check database constraints
    console.log('\n5. Database constraint information:');
    console.log('   CSVUpload.uploadedBy -> Admin.id (foreign key)');
    console.log(
      '   This constraint ensures uploadedBy references a valid admin ID',
    );
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🎯 Troubleshooting Steps:');
  console.log('1. Check if the JWT token is valid and not expired');
  console.log('2. Verify the admin ID in the token exists in the database');
  console.log('3. Check for database connection issues');
  console.log('4. Look for concurrent requests that might interfere');
  console.log('5. Check server logs for detailed error messages');
}

debugUploadIssue().catch(console.error);
