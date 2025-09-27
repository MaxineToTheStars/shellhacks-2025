// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const jwks = require('jwks-rsa');
const { dbOperations } = require('../database/database');
const GeminiService = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 8081;

// Initialize Gemini service
let geminiService;
try {
    geminiService = new GeminiService();
    console.log('Gemini service initialized successfully');
} catch (error) {
    console.warn('Gemini service initialization failed:', error.message);
    console.warn('Note analysis features will be disabled');
}

// Auth0 Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'your-auth0-domain.auth0.com';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'your-auth0-api-identifier';

// Debug: Log Auth0 configuration (remove in production)
console.log('Auth0 Server Config:', {
  domain: AUTH0_DOMAIN,
  audience: AUTH0_AUDIENCE,
  hasEnvFile: !!process.env.AUTH0_DOMAIN
});

// JWT middleware configuration
const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
    requestProperty: 'user'
});

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:8080',  // React dev server
        'http://localhost:8081',  // Server itself
        'http://127.0.0.1:8080',  // Alternative localhost
        'http://127.0.0.1:8081'   // Alternative localhost
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
app.post('/api/notes', jwtCheck, async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.sub; // Auth0 user ID

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

        const newNote = await dbOperations.createNote(userId, title, content);

        // Check if this is the 10th note and trigger automatic analysis
        const allNotes = await dbOperations.getAllNotes(userId);
        let shouldTriggerAnalysis = false;

        if (allNotes.length === 10 && geminiService) {
            shouldTriggerAnalysis = true;
            // Trigger analysis in the background (don't wait for it)
            setImmediate(async () => {
                try {
                    const notes = await dbOperations.getLatestNotesForAnalysis(userId);
                    const analysisResult = await geminiService.analyzeNotesAndGenerateResources(notes);

                    if (analysisResult.success) {
                        await dbOperations.createAnalysisLog(
                            userId,
                            'mental_health_analysis',
                            JSON.stringify(notes.map(note => ({ id: note.note_id, title: note.title }))),
                            JSON.stringify(analysisResult.data),
                            'automatic'
                        );
                        console.log(`Automatic analysis completed for user ${userId}`);
                    }
                } catch (error) {
                    console.error('Error in automatic analysis:', error);
                }
            });
        }

        res.status(201).json({
            message: 'Note created successfully',
            note: newNote,
            shouldTriggerAnalysis: shouldTriggerAnalysis
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create note'
        });
    }
});

// GET /api/notes - Get all notes for authenticated user
app.get('/api/notes', jwtCheck, async (req, res) => {
    try {
        const userId = req.user.sub; // Auth0 user ID
        const notes = await dbOperations.getAllNotes(userId);
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
app.get('/api/notes/:id', jwtCheck, async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        const userId = req.user.sub; // Auth0 user ID

        // Validation
        if (isNaN(noteId) || noteId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid note ID. Must be a positive integer.'
            });
        }

        const note = await dbOperations.getNoteById(noteId, userId);
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
app.put('/api/notes/:id', jwtCheck, async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        const { title, content } = req.body;
        const userId = req.user.sub; // Auth0 user ID

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

        const updatedNote = await dbOperations.updateNote(noteId, userId, title, content);
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
app.patch('/api/notes/:id', jwtCheck, async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        const { title, content } = req.body;
        const userId = req.user.sub; // Auth0 user ID

        // Validation
        if (isNaN(noteId) || noteId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid note ID. Must be a positive integer.'
            });
        }

        // Get existing note first
        const existingNote = await dbOperations.getNoteById(noteId, userId);

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

        const updatedNote = await dbOperations.updateNote(noteId, userId, updatedTitle, updatedContent);
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
app.delete('/api/notes/:id', jwtCheck, async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        const userId = req.user.sub; // Auth0 user ID

        // Validation
        if (isNaN(noteId) || noteId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid note ID. Must be a positive integer.'
            });
        }

        const result = await dbOperations.deleteNote(noteId, userId);
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

// POST /api/analyze-notes - Analyze notes and generate mental health resources
app.post('/api/analyze-notes', jwtCheck, async (req, res) => {
    try {
        if (!geminiService) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'Gemini analysis service is not available. Please check API key configuration.'
            });
        }

        const userId = req.user.sub;
        const { triggerType = 'manual' } = req.body;

        // Get the latest notes for analysis
        const notes = await dbOperations.getLatestNotesForAnalysis(userId);

        if (notes.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No notes available for analysis'
            });
        }

        // Analyze notes with Gemini
        const analysisResult = await geminiService.analyzeNotesAndGenerateResources(notes);

        if (!analysisResult.success) {
            return res.status(500).json({
                error: 'Analysis Failed',
                message: 'Failed to analyze notes: ' + analysisResult.error
            });
        }

        // Store the analysis log
        const analysisLog = await dbOperations.createAnalysisLog(
            userId,
            'mental_health_analysis',
            JSON.stringify(notes.map(note => ({ id: note.note_id, title: note.title }))),
            JSON.stringify(analysisResult.data),
            triggerType
        );

        res.json({
            message: 'Notes analyzed successfully',
            analysis: analysisResult.data,
            logId: analysisLog.log_id,
            notesAnalyzed: notes.length
        });
    } catch (error) {
        console.error('Error analyzing notes:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to analyze notes'
        });
    }
});

// GET /api/analysis-logs - Get all analysis logs for the user
app.get('/api/analysis-logs', jwtCheck, async (req, res) => {
    try {
        const userId = req.user.sub;
        const logs = await dbOperations.getAllAnalysisLogs(userId);

        // Parse the JSON strings back to objects for easier frontend consumption
        const parsedLogs = logs.map(log => ({
            ...log,
            notes_analyzed: JSON.parse(log.notes_analyzed),
            generated_resources: JSON.parse(log.generated_resources)
        }));

        res.json({
            message: 'Analysis logs retrieved successfully',
            count: parsedLogs.length,
            logs: parsedLogs
        });
    } catch (error) {
        console.error('Error retrieving analysis logs:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve analysis logs'
        });
    }
});

// GET /api/analysis-logs/:id - Get a specific analysis log
app.get('/api/analysis-logs/:id', jwtCheck, async (req, res) => {
    try {
        const logId = parseInt(req.params.id);
        const userId = req.user.sub;

        if (isNaN(logId) || logId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid log ID. Must be a positive integer.'
            });
        }

        const logs = await dbOperations.getAllAnalysisLogs(userId);
        const log = logs.find(l => l.log_id === logId);

        if (!log) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Analysis log not found'
            });
        }

        // Parse the JSON strings back to objects
        const parsedLog = {
            ...log,
            notes_analyzed: JSON.parse(log.notes_analyzed),
            generated_resources: JSON.parse(log.generated_resources)
        };

        res.json({
            message: 'Analysis log retrieved successfully',
            log: parsedLog
        });
    } catch (error) {
        console.error('Error retrieving analysis log:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve analysis log'
        });
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

// Start server with better error handling
const server = app.listen(PORT, () => {
    console.log(`✅ MindPath API server is running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 API endpoints: http://localhost:${PORT}/api/notes`);
    console.log(`🌐 CORS enabled for: http://localhost:8080`);
    console.log(`🤖 Gemini integration: ${geminiService ? 'Enabled' : 'Disabled (check API key)'}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`💡 Try these solutions:`);
        console.error(`   1. Kill existing processes: pkill -f "node.*server.js"`);
        console.error(`   2. Use a different port: PORT=3001 npm start`);
        console.error(`   3. Wait a few seconds and try again`);
        console.error(`   4. Use the startup script: ./scripts/start-server.sh`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app;
