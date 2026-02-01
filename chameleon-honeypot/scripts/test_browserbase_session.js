require('dotenv').config({ path: '.env.local' });
const { chromium } = require('playwright-core');

(async () => {
    const apiKey = process.env.BROWSERBASE_API_KEY;
    const projectId = process.env.BROWSERBASE_PROJECT_ID;

    console.log("🔄 Creating Session via REST API...");

    try {
        const response = await fetch('https://api.browserbase.com/v1/sessions', {
            method: 'POST',
            headers: {
                'X-BB-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: projectId
            })
        });

        if (!response.ok) {
            throw new Error(`Session creation failed: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        console.log(`✅ Session Created. ID: ${data.id}`);
        console.log(`🌐 Connecting to: ${data.connectUrl}`);

        // Connect
        const browser = await chromium.connect({
            wsEndpoint: data.connectUrl,
        });
        console.log("✅ WebSocket Connected!");

        const page = await browser.newPage();
        await page.goto('https://example.com');
        console.log("✅ Navigation Successful");

        await browser.close();
        console.log("🎉 Test Complete");

    } catch (e) {
        console.error("❌ Failed:", e);
    }
})();
