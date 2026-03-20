from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Database configuration
DATABASE = 'notes.db'

def get_db_connection():
    """Create database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with notes table"""
    if not os.path.exists(DATABASE):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

@app.route('/')
def index():
    """Serve the main index page"""
    return render_template('index.html')

@app.route('/api/notes', methods=['GET'])
def get_notes():
    """Get all notes or search notes by keyword"""
    search_query = request.args.get('search', '').strip().lower()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if search_query:
        # Search in both title and content
        cursor.execute('''
            SELECT id, title, content, created_at, updated_at 
            FROM notes 
            WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ?
            ORDER BY updated_at DESC
        ''', (f'%{search_query}%', f'%{search_query}%'))
    else:
        # Get all notes
        cursor.execute('SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC')
    
    notes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(notes)

@app.route('/api/notes', methods=['POST'])
def create_note():
    """Create a new note"""
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Title and content are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO notes (title, content, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ''', (data['title'], data['content']))
        conn.commit()
        note_id = cursor.lastrowid
        
        # Return the created note
        cursor.execute('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?', (note_id,))
        note = dict(cursor.fetchone())
        conn.close()
        
        return jsonify(note), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """Get a specific note by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?', (note_id,))
    note = cursor.fetchone()
    conn.close()
    
    if note is None:
        return jsonify({'error': 'Note not found'}), 404
    
    return jsonify(dict(note))

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """Update an existing note"""
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Title and content are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            UPDATE notes 
            SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (data['title'], data['content'], note_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Note not found'}), 404
        
        conn.commit()
        
        # Return the updated note
        cursor.execute('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?', (note_id,))
        note = dict(cursor.fetchone())
        conn.close()
        
        return jsonify(note), 200
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM notes WHERE id = ?', (note_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Note not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Note deleted successfully'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)
