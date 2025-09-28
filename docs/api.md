# API Documentation

This document provides comprehensive information about the MindPath API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:
```
http://localhost:3000
```

## Authentication

The MindPath API uses JWT (JSON Web Token) authentication through Auth0. All protected endpoints require a valid JWT token in the Authorization header.

### Authentication Header Format
```
Authorization: Bearer <jwt-token>
```

### Token Requirements
- Tokens must be issued by the configured Auth0 domain
- Tokens must include the correct audience claim
- Tokens must not be expired
- Tokens must be properly signed with RS256 algorithm

## Endpoints Overview

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| GET | `/health` | Health check endpoint | No |
| POST | `/api/notes` | Create a new note | Yes |
| GET | `/api/notes` | Retrieve all user notes | Yes |
| GET | `/api/notes/:id` | Retrieve a specific note | Yes |
| PUT | `/api/notes/:id` | Update a note (full update) | Yes |
| PATCH | `/api/notes/:id` | Update a note (partial update) | Yes |
| DELETE | `/api/notes/:id` | Delete a note | Yes |
| POST | `/api/analyze` | Analyze user notes | Yes |
| GET | `/api/analysis-logs` | Retrieve analysis history | Yes |

## Health Check

### GET /health

Verifies that the API server is running and accessible.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Server is healthy and responding

## Notes Management

### POST /api/notes

Creates a new note for the authenticated user.

**Request:**
```http
POST /api/notes
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Note Title",
  "content": "Note content here"
}
```

**Request Body Schema:**
```json
{
  "title": "string (required, max 255 characters)",
  "content": "string (required, max 10000 characters)"
}
```

**Response:**
```json
{
  "message": "Note created successfully",
  "note": {
    "note_id": 1,
    "user_id": "auth0|user123",
    "title": "Note Title",
    "content": "Note content here",
    "last_updated": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `201 Created`: Note created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error during creation

### GET /api/notes

Retrieves all notes for the authenticated user.

**Request:**
```http
GET /api/notes
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Notes retrieved successfully",
  "notes": [
    {
      "note_id": 1,
      "user_id": "auth0|user123",
      "title": "Note Title",
      "content": "Note content here",
      "last_updated": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Notes retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error during retrieval

### GET /api/notes/:id

Retrieves a specific note by ID for the authenticated user.

**Request:**
```http
GET /api/notes/1
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Note retrieved successfully",
  "note": {
    "note_id": 1,
    "user_id": "auth0|user123",
    "title": "Note Title",
    "content": "Note content here",
    "last_updated": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Note retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Note not found or not owned by user
- `500 Internal Server Error`: Server error during retrieval

### PUT /api/notes/:id

Performs a full update of a note for the authenticated user.

**Request:**
```http
PUT /api/notes/1
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Request Body Schema:**
```json
{
  "title": "string (required, max 255 characters)",
  "content": "string (required, max 10000 characters)"
}
```

**Response:**
```json
{
  "message": "Note updated successfully",
  "note": {
    "note_id": 1,
    "user_id": "auth0|user123",
    "title": "Updated Title",
    "content": "Updated content",
    "last_updated": "2024-01-15T10:35:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Note updated successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Note not found or not owned by user
- `500 Internal Server Error`: Server error during update

### PATCH /api/notes/:id

Performs a partial update of a note for the authenticated user.

**Request:**
```http
PATCH /api/notes/1
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "New Title Only"
}
```

**Request Body Schema:**
```json
{
  "title": "string (optional, max 255 characters)",
  "content": "string (optional, max 10000 characters)"
}
```

**Response:**
```json
{
  "message": "Note updated successfully",
  "note": {
    "note_id": 1,
    "user_id": "auth0|user123",
    "title": "New Title Only",
    "content": "Original content",
    "last_updated": "2024-01-15T10:35:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Note updated successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Note not found or not owned by user
- `500 Internal Server Error`: Server error during update

### DELETE /api/notes/:id

Deletes a note for the authenticated user.

**Request:**
```http
DELETE /api/notes/1
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Note deleted successfully"
}
```

**Status Codes:**
- `200 OK`: Note deleted successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Note not found or not owned by user
- `500 Internal Server Error`: Server error during deletion

## Analysis Endpoints

### POST /api/analyze

Initiates AI-powered analysis of user notes.

**Request:**
```http
POST /api/analyze
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "note_ids": [1, 2, 3],
  "trigger_type": "manual"
}
```

**Request Body Schema:**
```json
{
  "note_ids": "array of integers (required)",
  "trigger_type": "string (required, 'manual' or 'automatic')"
}
```

**Response:**
```json
{
  "message": "Analysis completed successfully",
  "analysis": {
    "analysis_id": "uuid",
    "user_id": "auth0|user123",
    "notes_analyzed": [1, 2, 3],
    "analysis": "Detailed analysis text",
    "generated_resources": {
      "resources": [
        {
          "title": "Resource Title",
          "description": "Resource description",
          "type": "article",
          "url": "https://example.com"
        }
      ],
      "recommendations": "Personalized recommendations"
    },
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Analysis completed successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error during analysis

### GET /api/analysis-logs

Retrieves the analysis history for the authenticated user.

**Request:**
```http
GET /api/analysis-logs
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Analysis logs retrieved successfully",
  "logs": [
    {
      "log_id": "uuid",
      "user_id": "auth0|user123",
      "notes_analyzed": [1, 2, 3],
      "trigger_type": "manual",
      "generated_resources": {
        "analysis": "Analysis text",
        "resources": [],
        "recommendations": "Recommendations text"
      },
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Analysis logs retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error during retrieval

## Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

### Common Error Types

- **ValidationError**: Invalid input data format or constraints
- **AuthenticationError**: Invalid or missing authentication token
- **AuthorizationError**: User not authorized to access resource
- **NotFoundError**: Requested resource not found
- **DatabaseError**: Database operation failed
- **ExternalServiceError**: External service (Auth0, AI service) error
- **InternalServerError**: Unexpected server error

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, the API does not implement rate limiting. Future versions may include rate limiting to ensure fair usage and system stability.

## Data Validation

### Input Validation Rules

- **Title**: Required, maximum 255 characters, no HTML tags
- **Content**: Required, maximum 10,000 characters, no HTML tags
- **Note IDs**: Must be positive integers, must belong to authenticated user
- **Trigger Type**: Must be either "manual" or "automatic"

### Output Sanitization

All text content is sanitized to prevent XSS attacks and ensure data integrity.

## Testing

The API includes comprehensive test coverage. Run tests using:

```bash
# Run API tests
node test-api.js

# Run specific test suites
npm test
```

## Versioning

The current API version is v1. Future versions will maintain backward compatibility where possible and will be clearly documented.
