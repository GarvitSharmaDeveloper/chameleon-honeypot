const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'honeypot.db');
const db = new Database(dbPath);

const row = db.prepare('SELECT * FROM hacker_activity ORDER BY id DESC LIMIT 1').get();
console.log('LATEST LOG:', row);
