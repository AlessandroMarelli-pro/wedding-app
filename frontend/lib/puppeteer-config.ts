import chromium from '@sparticuz/chromium';
import puppeteer, { LaunchOptions } from 'puppeteer-core';

/**
 * Get Puppeteer launch options optimized for different environments
 * @returns LaunchOptions configured for the current environment
 */
export async function getPuppeteerLaunchOptions(): Promise<LaunchOptions> {
  const isVercel = process.env.VERCEL === '1';

  if (isVercel) {
    // Vercel environment - use Chromium
    return {
      headless: true,
      args: [
        ...chromium.args,
        '--hide-scrollbars',
        '--disable-web-security',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      executablePath: await chromium.executablePath(),
    };
  } else {
    // Local development - use system Chrome
    const puppeteer = require('puppeteer');
    return {
      headless: true,
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
      executablePath: puppeteer.executablePath(),
    };
  }
}

/**
 * Launch Puppeteer browser with environment-appropriate configuration
 * @returns Promise<Browser>
 */
export async function launchPuppeteerBrowser() {
  const options = await getPuppeteerLaunchOptions();
  return puppeteer.launch(options);
}
