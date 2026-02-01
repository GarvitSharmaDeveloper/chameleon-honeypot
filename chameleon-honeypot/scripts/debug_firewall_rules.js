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

async function check() {
    console.log("Checking firewall:rules...")
    const rules = await redis.lrange('firewall:rules', 0, -1)
    console.log(`Found ${rules.length} rules.`)
    rules.forEach((rule, i) => {
        console.log(`[${i}] Rule: ${rule}`)
    })
}

check()
