import sqlite3
from flask import Flask, request

app = Flask(__name__)

@app.route('/users')
def get_user():
    # Retrieve user input, which must be treated as untrusted data.
    username = request.args.get('username')
    
    # SECURITY FIX: Implementing Parameterized Queries (Prepared Statements)
    # This is the industry standard for preventing SQL Injection (SQLi).
    # The query string now uses a '?' placeholder for the variable data.
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
        cursor.execute(query, (username,))
        data = cursor.fetchall()
    
    except sqlite3.Error as e:
        # Handle database errors gracefully, logging the error internally.
        print(f"Database Error: {e}")
        return "An internal server error occurred while retrieving data.", 500
    
    finally:
        # Always close the connection, even if an exception occurred.
        if conn:
            conn.close()

    # Note: If 'data' contained HTML/script content, proper output encoding (e.g., Jinja2 autoescaping)
    # would be required to prevent Cross-Site Scripting (XSS).
    return str(data)

if __name__ == '__main__':
    # For production environments, ensure debug=False and use a WSGI server.
    app.run(debug=True)