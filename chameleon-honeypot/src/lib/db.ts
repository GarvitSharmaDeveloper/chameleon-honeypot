import Database from 'better-sqlite3'
import path from 'path'

// Initialize DB
// We use a local file 'honeypot.db' in the project root (or you can put it in /tmp if readonly issues arise)
const dbPath = path.join(process.cwd(), 'honeypot.db')
const db = new Database(dbPath)

// Initialize Tables
const initDb = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS hacker_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date_of_attack TEXT,
            type_of_attack TEXT,
            attacker_severity TEXT,
            hackers_input TEXT,
            ai_response TEXT,
            engagement_time REAL,
            evidence_docs_path TEXT
        )
    `)
    console.log('📦 SQLite DB Initialized')
}

initDb()

export default db
