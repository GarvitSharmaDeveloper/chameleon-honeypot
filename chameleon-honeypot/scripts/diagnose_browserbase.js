require('dotenv').config({ path: '.env.local' });
const { chromium } = require('playwright-core');

(async () => {
    const apiKey = process.env.BROWSERBASE_API_KEY;
    const projectId = process.env.BROWSERBASE_PROJECT_ID;

    console.log("🕵️‍♀️ DIAGNOSTIC START");

    try {
        // 1. Create Session
        console.log("1️⃣  Creating Session...");
        const start = Date.now();
        const sessionReq = await fetch('https://api.browserbase.com/v1/sessions', {
            method: 'POST',
            headers: {
                'X-BB-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectId: projectId })
        });

        if (!sessionReq.ok) throw new Error(await sessionReq.text());
        const session = await sessionReq.json();
        console.log(`   ✅ Created ID: ${session.id} (${Date.now() - start}ms)`);

        // 2. Poll Status
        console.log("2️⃣  Polling Status...");
        let attempts = 0;
        while (attempts < 10) {
            const statusReq = await fetch(`https://api.browserbase.com/v1/sessions/${session.id}`, {
                headers: { 'X-BB-API-Key': apiKey }
            });
            const details = await statusReq.json();
            console.log(`   Attempt ${attempts + 1}: Status = ${details.status} (${Date.now() - start}ms)`);

            if (details.status === 'RUNNING') break;
            await new Promise(r => setTimeout(r, 1000));
            attempts++;
        }

        // 3. Connect
        console.log("3️⃣  Connecting WebSocket...");
        const wsStart = Date.now();
        const browser = await chromium.connect({
            wsEndpoint: session.connectUrl,
            timeout: 60000,
        });
        console.log(`   ✅ Connected! (${Date.now() - wsStart}ms)`);

        await browser.close();
        console.log("🎉 SUCCESS");

    } catch (e) {
        console.error("❌ FAILED:", e);
    }
})();
