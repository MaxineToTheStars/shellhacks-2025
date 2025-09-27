const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'notes.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// Initialize the notes table
function initializeDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS notes (
            note_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            last_updated TEXT
        )
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Notes table initialized successfully');
        }
    });
}

// Generate ISO 8601 timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Database operations
// Note: Errors prefixed with '[HANDLED ERROR]' are expected business logic errors
// that are properly handled by the API and should not be treated as system errors
const dbOperations = {
    // Create a new note
    createNote: (title, content) => {
        return new Promise((resolve, reject) => {
            const timestamp = getCurrentTimestamp();
            const query = 'INSERT INTO notes (title, content, last_updated) VALUES (?, ?, ?)';
            
            db.run(query, [title, content, timestamp], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        note_id: this.lastID,
                        title,
                        content,
                        last_updated: timestamp
                    });
                }
            });
        });
    },

    // Get all notes sorted by last_updated (newest first)
    getAllNotes: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM notes ORDER BY last_updated DESC';
            
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // Get a single note by ID
    getNoteById: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM notes WHERE note_id = ?';
            
            db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('[HANDLED ERROR] Note not found'));
                } else {
                    resolve(row);
                }
            });
        });
    },

    // Update a note by ID
    updateNote: (id, title, content) => {
        return new Promise((resolve, reject) => {
            const timestamp = getCurrentTimestamp();
            const query = 'UPDATE notes SET title = ?, content = ?, last_updated = ? WHERE note_id = ?';
            
            db.run(query, [title, content, timestamp, id], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('[HANDLED ERROR] Note not found'));
                } else {
                    resolve({
                        note_id: id,
                        title,
                        content,
                        last_updated: timestamp
                    });
                }
            });
        });
    },

    // Delete a note by ID
    deleteNote: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM notes WHERE note_id = ?';
            
            db.run(query, [id], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('[HANDLED ERROR] Note not found'));
                } else {
                    resolve({ message: 'Note deleted successfully', note_id: id });
                }
            });
        });
    }
};

// Initialize database on module load
initializeDatabase();

// Export database connection and operations
module.exports = {
    db,
    dbOperations,
    getCurrentTimestamp
};
