import sqlite3
from flask import Flask, request

app = Flask(__name__)

# Initialize database (for demonstration purposes)
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    # Optionally add dummy data
    conn.commit()
    conn.close()

# If running standalone, initialize the DB
if __name__ == '__main__':
    init_db()

@app.route('/users')
def get_user():
    username = request.args.get('username')
    
    # SECURITY FIX: Using parameterized queries (placeholders) instead of raw f-string concatenation.
    # The original vulnerability allowed the input "ADMIN' OR '1'='1' --" to break the SQL string.
    
    # 1. Use the '?' placeholder in the SQL query string. This template is static.
    query = "SELECT * FROM users WHERE username = ?"
    
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor() 
    
    try:
        # 2. Pass the user input (username) as a separate tuple to the execute function.
        # The sqlite3 driver handles escaping and sanitization automatically.
        # This ensures that malicious input is treated strictly as a literal username (data), 
        # not executable SQL code, completely neutralizing SQL Injection.
        cursor.execute(query, (username,))
        data = cursor.fetchall()
    except sqlite3.Error as e:
        # Handle database errors gracefully.
        print(f"Database Error: {e}")
        return "An internal error occurred", 500
    finally:
        conn.close()

    # Handle case where user is not found
    if not data:
        return f"User '{username}' not found.", 404

    return str(data)

if __name__ == '__main__':
    app.run(debug=True)