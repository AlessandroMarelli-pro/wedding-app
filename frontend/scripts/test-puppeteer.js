const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('🧪 Testing Puppeteer...');

  let browser = null;
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    console.log('✅ Browser launched successfully');

    const page = await browser.newPage();
    console.log('✅ New page created');

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    console.log('✅ User agent set');

    console.log('🌐 Navigating to Google...');
    await page.goto('https://www.google.com', {
      waitUntil: 'networkidle2',
      timeout: 10000,
    });
    console.log('✅ Navigation successful');

    const title = await page.title();
    console.log(`✅ Page title: ${title}`);

    console.log('🎉 Puppeteer test completed successfully!');
  } catch (error) {
    console.error('❌ Puppeteer test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

testPuppeteer().catch(console.error);
