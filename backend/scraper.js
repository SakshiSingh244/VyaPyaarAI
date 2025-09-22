const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrape_meesho_prices(productName) {
    const userDataDir = path.join(__dirname, 'user-data'); 

    const browser = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        slowMo: 200, 
        args: [
            '--start-maximized',
            '--disable-blink-features=AutomationControlled',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        ]
    });

    const page = await browser.newPage();

    try {
        console.log('🔍 Navigating to Meesho search page...');
        await page.goto(`https://www.meesho.com/search?q=${encodeURIComponent(productName)}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        console.log('✅ Search page loaded');

        
        try {
            await page.waitForSelector('div[class*="ProductList"]', { timeout: 10000 });
            console.log("📦 Product list detected.");
        } catch (e) {
            console.warn("⚠️ Product list not detected. Continuing anyway.");
        }

       
        console.log('💰 Extracting prices...');
        const prices = await page.$$eval('div, span', elements =>
            elements.map(el => {
                const text = el.textContent || '';
                const match = text.match(/₹\s?(\d[\d,]*)/);
                if (match) {
                    return parseInt(match[1].replace(/,/g, ''));
                }
                return 0;
            }).filter(price => price > 0)
        );

        await browser.close();

        if (!prices.length) {
            return { error: "No prices found" };
        }

        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            count: prices.length
        };

    } catch (error) {
        console.error('❌ Scraping failed:', error);
        try {
            await page.screenshot({ path: 'meesho_error.png' });
            const html = await page.content();
            fs.writeFileSync('meesho_error.html', html);
        } catch (_) {
            console.warn("Could not capture debug output.");
        }

        await browser.close();
        return {
            error: "Failed to scrape prices. Meesho may have blocked the request.",
            details: error.message
        };
    }
}

module.exports = { scrape_meesho_prices };
