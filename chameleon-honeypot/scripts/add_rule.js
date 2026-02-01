const { Redis } = require("@upstash/redis");
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const redis = new Redis({
    url: envConfig.UPSTASH_REDIS_REST_URL,
    token: envConfig.UPSTASH_REDIS_REST_TOKEN,
});

async function run() {
    console.log("Injecting robust firewall rule...");
    // Rule: Matches OR '1'='1' handling quotes
    // /OR\s+['"]?[\w\d]+['"]?\s*=\s*['"]?[\w\d]+['"]?/i
    const rule = "/OR\\s+['\"]?[\\w\\d]+['\"]?\\s*=\\s*['\"]?[\\w\\d]+['\"]?/i";

    await redis.lpush('firewall:rules', rule);
    console.log(`Added Rule: ${rule}`);
    process.exit(0);
}

run();
