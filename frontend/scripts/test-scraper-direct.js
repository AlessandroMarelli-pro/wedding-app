const {
  AccommodationScraper,
} = require('../lib/scrapers/accommodation-scraper');

async function testScraperDirect() {
  console.log('🧪 Testing Accommodation Scraper directly...\n');

  const scraper = new AccommodationScraper();

  const testUrls = [
    'https://www.airbnb.com/rooms/12345678',
    'https://www.booking.com/hotel/fr/example-hotel.html',
  ];

  for (const url of testUrls) {
    try {
      console.log(`🔍 Testing URL: ${url}`);

      const result = await scraper.scrapeAccommodation(url);

      console.log(`✅ Result:`);
      console.log(`   Name: ${result.name}`);
      console.log(`   Description: ${result.description}`);
      console.log(`   Address: ${result.address}`);
      console.log(`   Price Range: ${result.priceRange}`);
      console.log(
        `   Images: ${result.imagesUrl ? 'Available' : 'Not available'}`,
      );
      if (result.error) {
        console.log(`   ⚠️  Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log(''); // Empty line for readability
  }

  // Cleanup
  await scraper.cleanup();
  console.log('🎉 Direct scraper testing completed!');
}

testScraperDirect().catch(console.error);
