require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function main() {
    console.log("Flushing keys...");
    await redis.del('firewall:rules');
    await redis.del('attack:logs');
    console.log("Keys deleted.");
}

main();
