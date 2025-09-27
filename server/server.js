const express = require('express');
const path = require('path');
const cors = require('cors');
const { dbOperations } = require('../database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:8080',  // React dev server
        'http://localhost:3000',  // Server itself
        'http://127.0.0.1:8080',  // Alternative localhost
        'http://127.0.0.1:3000'   // Alternative localhost
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'MindPath API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes

// POST /api/notes - Create a new note
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content } = req.body;

        // Validation
        if (!title || !content) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Both title and content are required'
            });
        }

        if (typeof title !== 'string' || typeof content !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Title and content must be strings'
            });
        }

        const newNote = await dbOperations.createNote(title, content);
        res.status(201).json({
            message: 'Note created successfully',
            note: newNote
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create note'
        });
    }
});

// GET /api/notes - Get all notes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await dbOperations.getAllNotes();
        res.json({
            message: 'Notes retrieved successfully',
            count: notes.length,
            notes: notes
        });
    } catch (error) {
        console.error('Error retrieving notes:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve notes'
        });
    }
});

// GET /api/notes/:id - Get a single note by ID
app.get('/api/notes/:id', async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);

        // Validation
        if (isNaN(noteId) || noteId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid note ID. Must be a positive integer.'
            });
        }

        const note = await dbOperations.getNoteById(noteId);
        res.json({
            message: 'Note retrieved successfully',
            note: note
        });
    } catch (error) {
        console.error('Error retrieving note:', error);

        if (error.message === '[HANDLED ERROR] Note not found') {
            res.status(404).json({
                error: 'Not Found',
                message: 'Note not found'
            });
        } else {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to retrieve note'
            });
        }
    }
});

// PUT /api/notes/:id - Update a note by ID
app.put('/api/notes/:id', async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        const { title, content } = req.body;

        // Validation
        if (isNaN(noteId) || noteId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid note ID. Must be a positive integer.'
            });
        }

        if (!title || !content) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Both title and content are required for update'
            });
        }

        if (typeof title !== 'string' || typeof content !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Title and content must be strings'
            });
        }

        const updatedNote = await dbOperations.updateNote(noteId, title, content);
        res.json({
            message: 'Note updated successfully',
            note: updatedNote
        });
    } catch (error) {
        console.error('Error updating note:', error);

        if (error.message === '[HANDLED ERROR] Note not found') {
            res.status(404).json({
                error: 'Not Found',
                message: 'Note not found'
            });
        } else {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to update note'
            });
        }
    }
});

// PATCH /api/notes/:id - Partial update of a note by ID
app.patch('/api/notes/:id', async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        const { title, content } = req.body;

        // Validation
        if (isNaN(noteId) || noteId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid note ID. Must be a positive integer.'
            });
        }

        // Get existing note first
        const existingNote = await dbOperations.getNoteById(noteId);

        // Use existing values if not provided
        const updatedTitle = title !== undefined ? title : existingNote.title;
        const updatedContent = content !== undefined ? content : existingNote.content;

        // Validate types if provided
        if (title !== undefined && typeof title !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Title must be a string'
            });
        }

        if (content !== undefined && typeof content !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Content must be a string'
            });
        }

        const updatedNote = await dbOperations.updateNote(noteId, updatedTitle, updatedContent);
        res.json({
            message: 'Note updated successfully',
            note: updatedNote
        });
    } catch (error) {
        console.error('Error updating note:', error);

        if (error.message === '[HANDLED ERROR] Note not found') {
            res.status(404).json({
                error: 'Not Found',
                message: 'Note not found'
            });
        } else {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to update note'
            });
        }
    }
});

// DELETE /api/notes/:id - Delete a note by ID
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);

        // Validation
        if (isNaN(noteId) || noteId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid note ID. Must be a positive integer.'
            });
        }

        const result = await dbOperations.deleteNote(noteId);
        res.json({
            message: 'Note deleted successfully',
            result: result
        });
    } catch (error) {
        console.error('Error deleting note:', error);

        if (error.message === '[HANDLED ERROR] Note not found') {
            res.status(404).json({
                error: 'Not Found',
                message: 'Note not found'
            });
        } else {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to delete note'
            });
        }
    }
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`MindPath API server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoints: http://localhost:${PORT}/api/notes`);
    console.log(`CORS enabled for: http://localhost:8080`);
});

module.exports = app;
