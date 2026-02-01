require('dotenv').config({ path: '.env.local' });
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log("🔍 Testing Browserbase Connection...");
    const apiKey = process.env.BROWSERBASE_API_KEY;

    if (!apiKey) {
        console.error("❌ BROWSERBASE_API_KEY not found in .env.local");
        process.exit(1);
    }
    console.log(`🔑 API Key found: ${apiKey.substring(0, 5)}...`);

    const evidenceDir = path.join(process.cwd(), 'public', 'evidence');
    if (!fs.existsSync(evidenceDir)) {
        console.log("📂 Creating evidence directory...");
        fs.mkdirSync(evidenceDir, { recursive: true });
    }

    try {
        console.log("🌐 Connecting to Browserbase WebSocket...");
        const browser = await chromium.connect({
            wsEndpoint: `wss://connect.browserbase.com?apiKey=${apiKey}`,
        });
        console.log("✅ Connection Successful!");

        const page = await browser.newPage();
        console.log("📄 Page created. Navigating to example.com...");
        await page.goto('https://example.com');

        console.log("📸 Taking screenshot...");
        const filename = `test-evidence-${Date.now()}.png`;
        const filePath = path.join(evidenceDir, filename);
        await page.screenshot({ path: filePath });
        console.log(`✅ Screenshot saved to ${filePath}`);

        await browser.close();
        console.log("🎉 Test Complete. Browserbase integration is working.");
    } catch (error) {
        console.error("❌ Connection Failed:", error);
    }
})();
