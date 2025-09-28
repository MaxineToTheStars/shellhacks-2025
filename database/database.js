/**
 * MindPath Database Module
 * 
 * This module provides database operations for the MindPath application using SQLite.
 * It handles user notes and AI analysis logs with proper user isolation and data integrity.
 * 
 * @author MindPath Development Team
 * @version 1.0.0
 */

// SQLite3 database driver with verbose error reporting
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database Configuration
 * 
 * The database file is stored locally in the database directory.
 * SQLite provides a lightweight, file-based database solution that doesn't
 * require a separate database server.
 */
const dbPath = path.join(__dirname, 'notes.db');

/**
 * Database Connection
 * 
 * Establishes a connection to the SQLite database file.
 * The connection is persistent and shared across all database operations.
 */
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database at:', dbPath);
    }
});

/**
 * Database Schema Initialization
 * 
 * Creates the required database tables if they don't exist.
 * This function is called automatically when the module loads.
 */
function initializeDatabase() {
    /**
     * Notes Table Schema
     * 
     * Stores user notes with the following structure:
     * - note_id: Auto-incrementing primary key
     * - user_id: Auth0 user identifier (ensures user isolation)
     * - title: Note title (required)
     * - content: Note content (required)
     * - last_updated: ISO 8601 timestamp of last modification
     */
    const createNotesTableQuery = `
        CREATE TABLE IF NOT EXISTS notes (
            note_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            last_updated TEXT
        )
    `;

    /**
     * Analysis Logs Table Schema
     * 
     * Stores AI analysis results with the following structure:
     * - log_id: Auto-incrementing primary key
     * - user_id: Auth0 user identifier (ensures user isolation)
     * - analysis_type: Type of analysis performed (e.g., 'mental_health_analysis')
     * - notes_analyzed: JSON string of notes that were analyzed
     * - generated_resources: JSON string of AI-generated resources and insights
     * - created_at: ISO 8601 timestamp of analysis creation
     * - trigger_type: How analysis was triggered ('manual' or 'automatic')
     */
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

    // Create notes table
    db.run(createNotesTableQuery, (err) => {
        if (err) {
            console.error('❌ Error creating notes table:', err.message);
        } else {
            console.log('✅ Notes table initialized successfully');
        }
    });

    // Create analysis logs table
    db.run(createAnalysisLogsTableQuery, (err) => {
        if (err) {
            console.error('❌ Error creating analysis_logs table:', err.message);
        } else {
            console.log('✅ Analysis logs table initialized successfully');
        }
    });
}

/**
 * Utility Functions
 */

/**
 * Generate ISO 8601 Timestamp
 * 
 * Creates a standardized timestamp string in ISO 8601 format.
 * Used for consistent date/time storage across the application.
 * 
 * @returns {string} ISO 8601 formatted timestamp
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * =============================================================================
 * DATABASE OPERATIONS
 * =============================================================================
 * 
 * All database operations are wrapped in Promises for async/await compatibility.
 * User isolation is enforced by including user_id in all queries.
 * 
 * Error Handling:
 * - Errors prefixed with '[HANDLED ERROR]' are expected business logic errors
 *   that are properly handled by the API and should not be treated as system errors
 * - Database connection errors are thrown as-is for proper error handling
 */
const dbOperations = {
    /**
     * Create New Note
     * 
     * Inserts a new note into the database for the specified user.
     * Automatically generates a timestamp for the creation time.
     * 
     * @param {string} userId - Auth0 user identifier
     * @param {string} title - Note title
     * @param {string} content - Note content
     * @returns {Promise<Object>} Created note object with generated ID
     */
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

    /**
     * Get All User Notes
     * 
     * Retrieves all notes for a specific user, ordered by most recent first.
     * 
     * @param {string} userId - Auth0 user identifier
     * @returns {Promise<Array>} Array of note objects
     */
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

    /**
     * Get Single Note by ID
     * 
     * Retrieves a specific note by ID, ensuring it belongs to the specified user.
     * Throws a handled error if the note is not found or doesn't belong to the user.
     * 
     * @param {number} id - Note ID
     * @param {string} userId - Auth0 user identifier
     * @returns {Promise<Object>} Note object
     * @throws {Error} '[HANDLED ERROR] Note not found' if note doesn't exist or doesn't belong to user
     */
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

    /**
     * Update Existing Note
     * 
     * Updates a note's title and content, ensuring it belongs to the specified user.
     * Automatically updates the last_updated timestamp.
     * 
     * @param {number} id - Note ID
     * @param {string} userId - Auth0 user identifier
     * @param {string} title - New note title
     * @param {string} content - New note content
     * @returns {Promise<Object>} Updated note object
     * @throws {Error} '[HANDLED ERROR] Note not found' if note doesn't exist or doesn't belong to user
     */
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

    /**
     * Delete Note
     * 
     * Permanently deletes a note, ensuring it belongs to the specified user.
     * 
     * @param {number} id - Note ID
     * @param {string} userId - Auth0 user identifier
     * @returns {Promise<Object>} Deletion confirmation with note ID
     * @throws {Error} '[HANDLED ERROR] Note not found' if note doesn't exist or doesn't belong to user
     */
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

    /**
     * Create Analysis Log Entry
     * 
     * Stores AI analysis results in the database for future reference.
     * All parameters are stored as JSON strings for flexibility.
     * 
     * @param {string} userId - Auth0 user identifier
     * @param {string} analysisType - Type of analysis performed
     * @param {string} notesAnalyzed - JSON string of analyzed notes
     * @param {string} generatedResources - JSON string of AI-generated resources
     * @param {string} triggerType - How analysis was triggered ('manual' or 'automatic')
     * @returns {Promise<Object>} Created analysis log object with generated ID
     */
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

    /**
     * Get All Analysis Logs
     * 
     * Retrieves all analysis logs for a specific user, ordered by most recent first.
     * 
     * @param {string} userId - Auth0 user identifier
     * @returns {Promise<Array>} Array of analysis log objects
     */
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

    /**
     * Get Latest Notes for AI Analysis
     * 
     * Retrieves the most recent notes for AI analysis, with intelligent character
     * limiting to stay within AI model constraints (16,000 characters max).
     * 
     * @param {string} userId - Auth0 user identifier
     * @returns {Promise<Array>} Array of note objects optimized for AI analysis
     */
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

/**
 * =============================================================================
 * MODULE INITIALIZATION AND EXPORTS
 * =============================================================================
 */

// Initialize database tables when module loads
initializeDatabase();

/**
 * Module Exports
 * 
 * Exports the database connection, operations, and utility functions
 * for use by other parts of the application.
 */
module.exports = {
    db,                    // SQLite database connection
    dbOperations,          // All database operation functions
    getCurrentTimestamp    // Utility function for generating timestamps
};
