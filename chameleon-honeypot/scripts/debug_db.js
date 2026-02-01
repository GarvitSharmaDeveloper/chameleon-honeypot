const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'honeypot.db');
console.log('Testing DB at:', dbPath);

try {
    const db = new Database(dbPath);

    // Check if table exists
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hacker_activity'").get();
    if (!tableCheck) {
        console.error('❌ Table hacker_activity does not exist!');
        process.exit(1);
    }
    console.log('✅ Table hacker_activity found.');

    // Insert test log
    const dateStr = new Date().toISOString().replace('T', ' ').split('.')[0];
    const stmt = db.prepare(`
        INSERT INTO hacker_activity (date_of_attack, type_of_attack, attacker_severity, hackers_input, ai_response, engagement_time, evidence_docs_path)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(dateStr, 'TEST_DEBUG_LOG', 'Low', 'DEBUG_TEST_INPUT', 'DEBUG_RESPONSE', 0.1, '');
    console.log('✅ Successfully inserted test log. Row ID:', info.lastInsertRowid);

    // Read back
    const row = db.prepare('SELECT * FROM hacker_activity WHERE id = ?').get(info.lastInsertRowid);
    console.log('READBACK:', row);

} catch (e) {
    console.error('❌ DB Error:', e);
}
