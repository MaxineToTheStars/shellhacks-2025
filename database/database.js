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
    const createNotesTableQuery = `
        CREATE TABLE IF NOT EXISTS notes (
            note_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            last_updated TEXT
        )
    `;

    const createAnalysisLogsTableQuery = `
        CREATE TABLE IF NOT EXISTS analysis_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            analysis_type TEXT NOT NULL,
            notes_analyzed TEXT NOT NULL,
            generated_resources TEXT NOT NULL,
            created_at TEXT NOT NULL,
            trigger_type TEXT NOT NULL
        )
    `;

    db.run(createNotesTableQuery, (err) => {
        if (err) {
            console.error('Error creating notes table:', err.message);
        } else {
            console.log('Notes table initialized successfully');
        }
    });

    db.run(createAnalysisLogsTableQuery, (err) => {
        if (err) {
            console.error('Error creating analysis_logs table:', err.message);
        } else {
            console.log('Analysis logs table initialized successfully');
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
    createNote: (userId, title, content) => {
        return new Promise((resolve, reject) => {
            const timestamp = getCurrentTimestamp();
            const query = 'INSERT INTO notes (user_id, title, content, last_updated) VALUES (?, ?, ?, ?)';
            
            db.run(query, [userId, title, content, timestamp], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        note_id: this.lastID,
                        user_id: userId,
                        title,
                        content,
                        last_updated: timestamp
                    });
                }
            });
        });
    },

    // Get all notes for a specific user sorted by last_updated (newest first)
    getAllNotes: (userId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM notes WHERE user_id = ? ORDER BY last_updated DESC';
            
            db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // Get a single note by ID and user_id
    getNoteById: (id, userId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM notes WHERE note_id = ? AND user_id = ?';
            
            db.get(query, [id, userId], (err, row) => {
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

    // Update a note by ID and user_id
    updateNote: (id, userId, title, content) => {
        return new Promise((resolve, reject) => {
            const timestamp = getCurrentTimestamp();
            const query = 'UPDATE notes SET title = ?, content = ?, last_updated = ? WHERE note_id = ? AND user_id = ?';
            
            db.run(query, [title, content, timestamp, id, userId], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('[HANDLED ERROR] Note not found'));
                } else {
                    resolve({
                        note_id: id,
                        user_id: userId,
                        title,
                        content,
                        last_updated: timestamp
                    });
                }
            });
        });
    },

    // Delete a note by ID and user_id
    deleteNote: (id, userId) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM notes WHERE note_id = ? AND user_id = ?';
            
            db.run(query, [id, userId], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('[HANDLED ERROR] Note not found'));
                } else {
                    resolve({ message: 'Note deleted successfully', note_id: id });
                }
            });
        });
    },

    // Create a new analysis log entry
    createAnalysisLog: (userId, analysisType, notesAnalyzed, generatedResources, triggerType) => {
        return new Promise((resolve, reject) => {
            const timestamp = getCurrentTimestamp();
            const query = 'INSERT INTO analysis_logs (user_id, analysis_type, notes_analyzed, generated_resources, created_at, trigger_type) VALUES (?, ?, ?, ?, ?, ?)';
            
            db.run(query, [userId, analysisType, notesAnalyzed, generatedResources, timestamp, triggerType], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        log_id: this.lastID,
                        user_id: userId,
                        analysis_type: analysisType,
                        notes_analyzed: notesAnalyzed,
                        generated_resources: generatedResources,
                        created_at: timestamp,
                        trigger_type: triggerType
                    });
                }
            });
        });
    },

    // Get all analysis logs for a specific user sorted by created_at (newest first)
    getAllAnalysisLogs: (userId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM analysis_logs WHERE user_id = ? ORDER BY created_at DESC';
            
            db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // Get the latest 10 notes for analysis (max 16,000 characters)
    getLatestNotesForAnalysis: (userId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT note_id, title, content, last_updated 
                FROM notes 
                WHERE user_id = ? 
                ORDER BY last_updated DESC 
                LIMIT 10
            `;
            
            db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Calculate total character count and trim if necessary
                    let totalChars = 0;
                    const notesForAnalysis = [];
                    
                    for (const note of rows) {
                        const noteChars = note.title.length + note.content.length;
                        if (totalChars + noteChars <= 16000) {
                            notesForAnalysis.push(note);
                            totalChars += noteChars;
                        } else {
                            break;
                        }
                    }
                    
                    resolve(notesForAnalysis);
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
