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
    console.log("Checking patch:history...")
    const history = await redis.lrange('patch:history', 0, -1)
    console.log(`Found ${history.length} items.`)
    history.forEach((item, i) => {
        console.log(`[${i}] Type:`, typeof item)
        if (typeof item === 'object') {
            console.log(`[${i}] Is Object! Keys:`, Object.keys(item))
            console.log(`[${i}] Trigger value:`, item.trigger)
        } else {
            console.log(`[${i}] Raw String:`, item)
        }
        console.log('---')
    })
}

check()
