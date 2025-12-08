import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to localhost:3000...');
    // Increase timeout for initial load
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
    
    // 1. Desktop View (Should show the App Shell centered with background)
    console.log('Capturing Desktop View...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'verification-desktop.png', fullPage: true });
    
    // 2. Mobile View (Should look native)
    console.log('Capturing Mobile View...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'verification-mobile.png', fullPage: true });
    
    console.log('Screenshots saved.');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

capture();
