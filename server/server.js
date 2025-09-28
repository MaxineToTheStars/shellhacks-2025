/**
 * MindPath API Server
 * 
 * This is the main Express.js server that provides RESTful API endpoints
 * for the MindPath personal wellness application. It handles authentication,
 * note management, and AI-powered analysis features.
 * 
 * @author MindPath Development Team
 * @version 1.0.0
 */

// Load environment variables from .env file
require('dotenv').config();

// Core Express.js and middleware imports
const express = require('express');
const path = require('path');
const cors = require('cors');

// Authentication middleware for JWT token validation
const { expressjwt: jwt } = require('express-jwt');
const jwks = require('jwks-rsa');

// Local service imports
const { dbOperations } = require('../database/database');
const GeminiService = require('./geminiService');

// Initialize Express application
const app = express();

// Server configuration - defaults to port 8081 for development
const PORT = process.env.PORT || 8081;

/**
 * Initialize Gemini AI Service
 * 
 * The Gemini service provides AI-powered analysis of user notes to generate
 * mental health insights and recommendations. If initialization fails,
 * the application continues to function without AI features.
 */
let geminiService;
try {
    geminiService = new GeminiService();
    console.log('✅ Gemini service initialized successfully');
} catch (error) {
    console.warn('⚠️  Gemini service initialization failed:', error.message);
    console.warn('📝 Note analysis features will be disabled');
}

/**
 * Auth0 Authentication Configuration
 * 
 * These environment variables configure the JWT authentication system
 * that validates user tokens from Auth0.
 */
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'your-auth0-domain.auth0.com';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'your-auth0-api-identifier';

// Debug logging for Auth0 configuration (remove in production)
console.log('🔐 Auth0 Server Config:', {
  domain: AUTH0_DOMAIN,
  audience: AUTH0_AUDIENCE,
  hasEnvFile: !!process.env.AUTH0_DOMAIN
});

/**
 * JWT Authentication Middleware Configuration
 * 
 * This middleware validates JWT tokens from Auth0 by:
 * - Fetching public keys from Auth0's JWKS endpoint
 * - Verifying token signature using RS256 algorithm
 * - Checking token audience and issuer
 * - Adding user information to request object
 */
const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,                    // Cache JWKS keys for performance
        rateLimit: true,                // Rate limit JWKS requests
        jwksRequestsPerMinute: 5,       // Max 5 requests per minute
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: AUTH0_AUDIENCE,           // Expected audience in token
    issuer: `https://${AUTH0_DOMAIN}/`, // Expected token issuer
    algorithms: ['RS256'],              // Allowed signing algorithm
    requestProperty: 'user'             // Add user info to req.user
});

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Allows the React development server to make requests to this API server.
 * Configured for local development with both localhost and 127.0.0.1.
 */
const corsOptions = {
    origin: [
        'http://localhost:8080',  // React development server
        'http://localhost:8081',  // API server itself
        'http://127.0.0.1:8080',  // Alternative localhost format
        'http://127.0.0.1:8081'   // Alternative localhost format
    ],
    credentials: true,                    // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200            // Legacy browser support
};

/**
 * Express Middleware Configuration
 * 
 * These middleware functions are applied to all requests in order:
 * 1. CORS - Handle cross-origin requests
 * 2. JSON parsing - Parse JSON request bodies
 * 3. URL encoding - Parse form-encoded request bodies
 */
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health Check Endpoint
 * 
 * GET /health
 * 
 * Provides a simple health check to verify the API server is running.
 * Used by monitoring systems and deployment scripts.
 * 
 * @route GET /health
 * @returns {Object} Server status and timestamp
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'MindPath API is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * =============================================================================
 * API ROUTES
 * =============================================================================
 * 
 * All API routes below require JWT authentication via the jwtCheck middleware.
 * User information is available in req.user.sub (Auth0 user ID).
 */

/**
 * Create New Note
 * 
 * POST /api/notes
 * 
 * Creates a new personal note for the authenticated user. Automatically triggers
 * AI analysis when the user reaches their 10th note.
 * 
 * @route POST /api/notes
 * @middleware jwtCheck - Requires valid JWT token
 * @param {string} title - Note title (required)
 * @param {string} content - Note content (required)
 * @returns {Object} Created note object with analysis trigger status
 */
app.post('/api/notes', jwtCheck, async (req, res) => {
    try {
        // Extract note data from request body
        const { title, content } = req.body;
        const userId = req.user.sub; // Auth0 user ID from JWT token

        // Input validation - ensure required fields are present
        if (!title || !content) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Both title and content are required'
            });
        }

        // Input validation - ensure fields are strings
        if (typeof title !== 'string' || typeof content !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Title and content must be strings'
            });
        }

        // Create the note in the database
        const newNote = await dbOperations.createNote(userId, title, content);

        // Check if this is the 10th note and trigger automatic analysis
        const allNotes = await dbOperations.getAllNotes(userId);
        let shouldTriggerAnalysis = false;

        // Trigger automatic analysis on the 10th note (if Gemini service is available)
        if (allNotes.length === 10 && geminiService) {
            shouldTriggerAnalysis = true;
            
            // Run analysis in background to avoid blocking the response
            setImmediate(async () => {
                try {
                    // Get latest notes for analysis
                    const notes = await dbOperations.getLatestNotesForAnalysis(userId);
                    
                    // Generate AI analysis and resources
                    const analysisResult = await geminiService.analyzeNotesAndGenerateResources(notes);

                    if (analysisResult.success) {
                        // Store analysis results in database
                        await dbOperations.createAnalysisLog(
                            userId,
                            'mental_health_analysis',
                            JSON.stringify(notes.map(note => ({ id: note.note_id, title: note.title }))),
                            JSON.stringify(analysisResult.data),
                            'automatic'
                        );
                        console.log(`✅ Automatic analysis completed for user ${userId}`);
                    }
                } catch (error) {
                    console.error('❌ Error in automatic analysis:', error);
                }
            });
        }

        // Return success response with created note
        res.status(201).json({
            message: 'Note created successfully',
            note: newNote,
            shouldTriggerAnalysis: shouldTriggerAnalysis
        });
    } catch (error) {
        console.error('❌ Error creating note:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create note'
        });
    }
});

/**
 * Get All Notes
 * 
 * GET /api/notes
 * 
 * Retrieves all notes for the authenticated user, ordered by most recent first.
 * 
 * @route GET /api/notes
 * @middleware jwtCheck - Requires valid JWT token
 * @returns {Object} Array of user's notes with count
 */
app.get('/api/notes', jwtCheck, async (req, res) => {
    try {
        const userId = req.user.sub; // Auth0 user ID from JWT token
        
        // Retrieve all notes for the user
        const notes = await dbOperations.getAllNotes(userId);
        
        res.json({
            message: 'Notes retrieved successfully',
            count: notes.length,
            notes: notes
        });
    } catch (error) {
        console.error('❌ Error retrieving notes:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve notes'
        });
    }
});

/**
 * Get Single Note
 * 
 * GET /api/notes/:id
 * 
 * Retrieves a specific note by ID for the authenticated user.
 * 
 * @route GET /api/notes/:id
 * @middleware jwtCheck - Requires valid JWT token
 * @param {string} id - Note ID (must be positive integer)
 * @returns {Object} Note object if found and owned by user
 */
app.get('/api/notes/:id', jwtCheck, async (req, res) => {
    try {
        // Parse and validate note ID
        const noteId = parseInt(req.params.id);
        const userId = req.user.sub; // Auth0 user ID from JWT token

        // Validate note ID is a positive integer
        if (isNaN(noteId) || noteId <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid note ID. Must be a positive integer.'
            });
        }

        // Retrieve the specific note (ensures user ownership)
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

/**
 * Analyze Notes with AI
 * 
 * POST /api/analyze-notes
 * 
 * Triggers AI-powered analysis of user's notes to generate mental health
 * insights, resources, and recommendations using the Gemini service.
 * 
 * @route POST /api/analyze-notes
 * @middleware jwtCheck - Requires valid JWT token
 * @param {string} triggerType - Type of analysis trigger ('manual' or 'automatic')
 * @returns {Object} Analysis results with generated resources and recommendations
 */
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

/**
 * Get Analysis History
 * 
 * GET /api/analysis-logs
 * 
 * Retrieves all analysis logs for the authenticated user, including
 * both manual and automatic analysis results.
 * 
 * @route GET /api/analysis-logs
 * @middleware jwtCheck - Requires valid JWT token
 * @returns {Object} Array of analysis logs with parsed JSON data
 */
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

/**
 * =============================================================================
 * ERROR HANDLING MIDDLEWARE
 * =============================================================================
 */

/**
 * 404 Handler for Undefined Routes
 * 
 * Catches any requests to routes that don't exist and returns a
 * standardized 404 error response.
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
    });
});

/**
 * Global Error Handler
 * 
 * Catches any unhandled errors in the application and returns a
 * standardized 500 error response. Logs the error for debugging.
 */
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
    });
});

/**
 * =============================================================================
 * SERVER STARTUP
 * =============================================================================
 */

/**
 * Start the Express Server
 * 
 * Initializes the server with proper error handling and logging.
 * The server listens on the configured PORT and provides startup feedback.
 */
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
