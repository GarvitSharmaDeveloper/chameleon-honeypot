const WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.BROWSERBASE_API_KEY;
const url = `wss://connect.browserbase.com?apiKey=${apiKey}`;

console.log(`Connecting to ${url.replace(apiKey, 'HIDDEN')}...`);

const ws = new WebSocket(url);

ws.on('open', () => {
    console.log('✅ WebSocket Connected!');
    ws.close();
    process.exit(0);
});

ws.on('error', (err) => {
    console.error('❌ WebSocket Error:', err);
    process.exit(1);
});

ws.on('close', () => {
    console.log('WebSocket Closed');
});

// Timeout
setTimeout(() => {
    console.log('⏰ Timeout waiting for open');
    process.exit(1);
}, 10000);
