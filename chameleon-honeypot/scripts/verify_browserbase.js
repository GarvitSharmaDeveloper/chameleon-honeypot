require('dotenv').config({ path: '.env.local' });
const { Stagehand } = require('@browserbasehq/stagehand');

(async () => {
    console.log("🤖 Verifying Stagehand API Access...");
    let stagehand = null;

    try {
        stagehand = new Stagehand({
            env: "BROWSERBASE",
            apiKey: process.env.BROWSERBASE_API_KEY,
            projectId: process.env.BROWSERBASE_PROJECT_ID,
            verbose: 1,
            debugDom: true,
        });

        console.log("Initializing...");
        await stagehand.init();
        console.log("✅ Init Complete.");

        // CHECK API
        if (stagehand.page) {
            console.log("✅ stagehand.page EXISTS");
        } else {
            console.log("❌ stagehand.page is UNDEFINED");
        }

        if (stagehand.context) {
            console.log("✅ stagehand.context EXISTS");
            const page = await stagehand.context.activePage(); // activePage might be async or sync? d.ts said sync return but let's check.
            // d.ts: activePage(): Page | undefined;

            if (page) {
                console.log("✅ stagehand.context.activePage() returned a PAGE");
                await page.goto("https://example.com");
                console.log("✅ Navigation Success");
            } else {
                console.log("❌ stagehand.context.activePage() returned undefined");
                // Try waiting?
                console.log("Waiting 2s...");
                await new Promise(r => setTimeout(r, 2000));
                const page2 = stagehand.context.activePage();
                if (page2) console.log("✅ Page found after wait");
                else console.log("❌ Still no page");
            }

        } else {
            console.log("❌ stagehand.context is UNDEFINED. Keys:", Object.keys(stagehand));
        }

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        if (stagehand) {
            console.log("🧹 Closing...");
            await stagehand.close();
        }
    }
})();
