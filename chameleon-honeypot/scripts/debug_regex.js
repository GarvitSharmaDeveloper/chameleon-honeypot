const { Redis } = require("@upstash/redis");
const path = require('path');
const fs = require('fs');

// Load envdd
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const redis = new Redis({
    url: envConfig.UPSTASH_REDIS_REST_URL,
    token: envConfig.UPSTASH_REDIS_REST_TOKEN,
});

async function run() {
    const rules = await redis.lrange('firewall:rules', 0, -1);
    const command = "SELECT * FROM users WHERE id=1 OR '1'='1'";

    console.log(`Testing Command: "${command}"`);

    for (const ruleStr of rules) {
        console.log(`\n--- Checking Rule: ${ruleStr} ---`);
        let rulePattern = ruleStr;
        let ruleFlags = 'i';

        const match = ruleStr.match(/^\/(.*?)\/([a-z]*)$/);
        if (match) {
            rulePattern = match[1];
            ruleFlags = match[2] || 'i';
        }

        console.log(`Raw Pattern: ${rulePattern}`);

        // Test RAW unescaped pattern (This mimics original api/honeypot logic)
        try {
            const regex = new RegExp(rulePattern, ruleFlags);
            console.log(`Raw RegExp: ${regex.toString()}`);

            if (regex.test(command)) {
                console.log("✅ RAW PATTERN MATCHED!");
            } else {
                console.log("❌ RAW PATTERN NO MATCH");
            }
        } catch (e) {
            console.error("Raw Regex Error:", e);
        }
    }
    process.exit(0);
}

run();
