require('dotenv').config({ path: './.env' });
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUploads() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  console.log('🧪 Testing File Upload System...\n');

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

  // Test CSV upload
  console.log('📄 Testing CSV upload...');
  try {
    // Create a sample CSV file
    const sampleCSV = `firstName,lastName,email,partySize,dietaryRestrictions
John,Doe,john.doe@example.com,2,Vegetarian
Jane,Smith,jane.smith@example.com,1,None
Bob,Johnson,bob.johnson@example.com,3,Gluten-free`;

    const csvPath = path.join(__dirname, 'sample-guests.csv');
    fs.writeFileSync(csvPath, sampleCSV);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(csvPath), {
      filename: 'sample-guests.csv',
      contentType: 'text/csv',
    });

    const csvResponse = await fetch(`${baseUrl}/api/admin/guests/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (csvResponse.ok) {
      const csvResult = await csvResponse.json();
      console.log('✅ CSV upload successful');
      console.log(`   Upload ID: ${csvResult.id}`);
      console.log(`   Status: ${csvResult.status}`);
      console.log(`   Total Rows: ${csvResult.totalRows}`);
      console.log(`   Processed: ${csvResult.processedRows}`);
    } else {
      const error = await csvResponse.json();
      console.log('❌ CSV upload failed:', error.error);
    }

    // Clean up
    fs.unlinkSync(csvPath);
  } catch (error) {
    console.log('❌ CSV upload error:', error.message);
  }

  console.log('');

  // Test image upload
  console.log('🖼️  Testing image upload...');
  try {
    // Create a sample image (1x1 pixel PNG)
    const sampleImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37, 0x6e, 0xf9, 0x24, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const imagePath = path.join(__dirname, 'sample-image.png');
    fs.writeFileSync(imagePath, sampleImageBuffer);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath), {
      filename: 'sample-image.png',
      contentType: 'image/png',
    });
    formData.append('usageLocation', 'test');
    formData.append('altText', 'Sample test image');

    const imageResponse = await fetch(`${baseUrl}/api/admin/images/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (imageResponse.ok) {
      const imageResult = await imageResponse.json();
      console.log('✅ Image upload successful');
      console.log(`   Image ID: ${imageResult.id}`);
      console.log(`   Filename: ${imageResult.filename}`);
      console.log(`   Size: ${imageResult.size} bytes`);
      console.log(`   Dimensions: ${imageResult.width}x${imageResult.height}`);

      // Test image serving
      console.log('🔗 Testing image serving...');
      const serveResponse = await fetch(
        `${baseUrl}/api/images/${imageResult.id}`,
      );
      if (serveResponse.ok) {
        console.log('✅ Image serving successful');
        console.log(
          `   Content-Type: ${serveResponse.headers.get('content-type')}`,
        );
        console.log(
          `   Content-Length: ${serveResponse.headers.get('content-length')}`,
        );
      } else {
        console.log('❌ Image serving failed');
      }
    } else {
      const error = await imageResponse.json();
      console.log('❌ Image upload failed:', error.error);
    }

    // Clean up
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.log('❌ Image upload error:', error.message);
  }

  console.log('');

  // Test getting all images
  console.log('📋 Testing get all images...');
  try {
    const imagesResponse = await fetch(`${baseUrl}/api/admin/images`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (imagesResponse.ok) {
      const images = await imagesResponse.json();
      console.log('✅ Get images successful');
      console.log(`   Total images: ${images.length}`);
    } else {
      const error = await imagesResponse.json();
      console.log('❌ Get images failed:', error.error);
    }
  } catch (error) {
    console.log('❌ Get images error:', error.message);
  }

  console.log('\n🎉 File upload testing completed!');
}

// Run the test
testUploads().catch(console.error);
