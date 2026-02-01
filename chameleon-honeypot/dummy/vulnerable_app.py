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
    # Retrieve user input, which must be treated as untrusted data.
    username = request.args.get('username')
    
    # SECURITY FIX: Implementing Parameterized Queries (Prepared Statements)
    # This is the industry standard for preventing SQL Injection (SQLi).
    # The query string now uses a '?' placeholder for the variable data.
    # SECURITY FIX: Using parameterized queries (placeholders) instead of raw f-string concatenation.
    # The original vulnerability allowed the input "ADMIN' OR '1'='1' --" to break the SQL string.
    
    # 1. Use the '?' placeholder in the SQL query string. This template is static.
    query = "SELECT * FROM users WHERE username = ?"
    
    # Ensure the connection is managed safely.
    conn = None
    try:
        # CRITICAL: Connect to the database.
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor() 
        
        # Executing the query with the user input passed separately as a tuple (username,).
        # The sqlite3 driver handles escaping and sanitization of the input 'username'
        # automatically. This ensures that malicious input (like "; cat /etc/passwd") is
        # treated purely as a literal string value to be matched in the database, and 
        # not executable SQL commands or command chain separators.
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
        # Handle database errors gracefully, logging the error internally.
        # Handle database errors gracefully.
        print(f"Database Error: {e}")
        return "An internal server error occurred while retrieving data.", 500
    
    finally:
        # Always close the connection, even if an exception occurred.
        if conn:
            conn.close()

    # Note: If 'data' contained HTML/script content, proper output encoding (e.g., Jinja2 autoescaping)
    # would be required to prevent Cross-Site Scripting (XSS).
    # Handle case where user is not found
    if not data:
        return f"User '{username}' not found.", 404

    return str(data)

if __name__ == '__main__':
    # For production environments, ensure debug=False and use a WSGI server.
    app.run(debug=True)