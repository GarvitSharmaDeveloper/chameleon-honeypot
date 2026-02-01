const { Redis } = require('@upstash/redis')
require('dotenv').config({ path: '.env.local' })

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error("Missing Redis Auth")
    process.exit(1)
}

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

async function fix() {
    console.log("Scanning for broken rules...")
    const rules = await redis.lrange('firewall:rules', 0, -1)

    // Remove specific broken rule
    const badRule = "/.*/"
    if (rules.includes(badRule)) {
        await redis.lrem('firewall:rules', 0, badRule)
        console.log(`✅ Removed broken rule: ${badRule}`)
    } else {
        console.log("No broken rules found.")
    }
}

fix()
