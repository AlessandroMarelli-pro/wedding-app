import { launchPuppeteerBrowser } from '../lib/puppeteer-config';

async function testPuppeteerConfig() {
  console.log('🧪 Testing Puppeteer configuration...');
  console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
  
  try {
    const browser = await launchPuppeteerBrowser();
    console.log('✅ Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('✅ Page created successfully');
    
    await page.goto('https://example.com');
    const title = await page.title();
    console.log('✅ Page loaded successfully, title:', title);
    
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    console.log('🎉 Puppeteer configuration test passed!');
  } catch (error) {
    console.error('❌ Puppeteer configuration test failed:', error);
    process.exit(1);
  }
}

testPuppeteerConfig();
