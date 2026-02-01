const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'honeypot.db');
const db = new Database(dbPath);

const row = db.prepare("SELECT * FROM hacker_activity WHERE hackers_input LIKE '%garvit_hacker%' ORDER BY id DESC LIMIT 1").get();
console.log('LOGIN LOG:', row);
