require('dotenv').config({ path: './.env' });

async function testScraper() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  console.log('🧪 Testing Node.js Accommodation Scraper...\n');

  // Test URLs
  const testUrls = [
    'https://www.airbnb.com/rooms/12345678',
    'https://www.booking.com/hotel/fr/example-hotel.html',
    'https://www.hostelworld.com/hostels/paris',
    'https://www.hotels.com/hotel/paris-france',
  ];

  for (const url of testUrls) {
    try {
      console.log(`🔍 Testing URL: ${url}`);

      const response = await fetch(`${baseUrl}/api/scrape/accommodation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(`❌ Failed: ${errorData.error}`);
        console.log(`   Message: ${errorData.message || 'No message'}`);
      } else {
        const data = await response.json();
        console.log(`✅ Success:`);
        console.log(`   Name: ${data.name}`);
        console.log(
          `   Description: ${data.description?.substring(0, 100)}...`,
        );
        console.log(`   Address: ${data.address}`);
        console.log(`   Price Range: ${data.priceRange}`);
        console.log(
          `   Images: ${data.imagesUrl ? 'Available' : 'Not available'}`,
        );
        if (data.error) {
          console.log(`   ⚠️  Error: ${data.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }

    console.log(''); // Empty line for readability
  }

  console.log('🎉 Scraper testing completed!');
}

// Run the test
testScraper().catch(console.error);
