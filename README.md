# MindPath - Personal Notes App with Auth0

A full-stack personal notes application with Google OAuth authentication, built with React, Node.js, Express.js, and SQLite database.

## 🚀 Features

- **🔐 Google OAuth Authentication**: Secure login with Auth0 and Google
- **👤 User-Specific Notes**: Each user has their own private notes
- **📝 CRUD Operations**: Create, Read, Update, and Delete notes
- **🗄️ SQLite Database**: Lightweight, file-based database with user isolation
- **🎨 Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **🔒 JWT Security**: Secure API endpoints with JWT token validation
- **⚡ Real-time Updates**: Instant UI updates with React state management

## 📋 API Endpoints

> **Note**: All `/api/notes` endpoints require JWT authentication via `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Request Body | Auth Required |
|--------|----------|-------------|--------------|---------------|
| `GET` | `/health` | Health check endpoint | None | ❌ |
| `POST` | `/api/notes` | Create a new note | `{"title": "...", "content": "..."}` | ✅ |
| `GET` | `/api/notes` | Get all notes for authenticated user | None | ✅ |
| `GET` | `/api/notes/:id` | Get a single note by ID | None | ✅ |
| `PUT` | `/api/notes/:id` | Update a note (full update) | `{"title": "...", "content": "..."}` | ✅ |
| `PATCH` | `/api/notes/:id` | Update a note (partial update) | `{"title": "..."}` or `{"content": "..."}` | ✅ |
| `DELETE` | `/api/notes/:id` | Delete a note by ID | None | ✅ |

## 🗄️ Database Schema

### `notes` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `note_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| `user_id` | TEXT | NOT NULL | Auth0 user identifier |
| `title` | TEXT | NOT NULL | Note title |
| `content` | TEXT | NOT NULL | Note content |
| `last_updated` | TEXT | - | ISO 8601 timestamp |

> **Security**: Each note is associated with a `user_id` to ensure users can only access their own notes.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm
- Auth0 account (free tier available)

### 🔐 Auth0 Setup

1. **Create Auth0 Account**: Sign up at [Auth0 Dashboard](https://manage.auth0.com/)
2. **Create Application**: Choose "Single Page Application" type
3. **Configure Google OAuth**: Enable Google social connection
4. **Create API**: Set up an API with RS256 signing algorithm
5. **Environment Variables**: Configure as shown below

For detailed Auth0 setup instructions, see [AUTH0_SETUP.md](./AUTH0_SETUP.md)

## 🚀 Quick Start (Using Scripts)

The easiest way to get started is using the provided scripts:

```bash
# 1. Install all dependencies
./scripts/install.sh

# 2. Start the application
./scripts/run.sh

# 3. Stop the application (when done)
./scripts/stop.sh

# 4. Clean project (remove dependencies and build files)
./scripts/clean.sh
```

## 🛠️ Manual Setup

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install database dependencies
cd ../database
npm install
```

### 2. Start the Server

```bash
# Development mode (with auto-restart)
cd server
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### 3. Test the API

```bash
# Run the test suite
node test-api.js
```

## 📝 Usage Examples

### Create a Note
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Note", "content": "This is the content of my note."}'
```

### Get All Notes
```bash
curl http://localhost:3000/api/notes
```

### Get a Specific Note
```bash
curl http://localhost:3000/api/notes/1
```

### Update a Note (Full Update)
```bash
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "content": "Updated content"}'
```

### Update a Note (Partial Update)
```bash
curl -X PATCH http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "New Title Only"}'
```

### Delete a Note
```bash
curl -X DELETE http://localhost:3000/api/notes/1
```

## 📊 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "note": {
    "note_id": 1,
    "title": "Note Title",
    "content": "Note content",
    "last_updated": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## 🔧 Project Structure

```
shellhacks-2025/
├── server/
│   ├── package.json
│   └── server.js          # Express.js server
├── database/
│   ├── package.json
│   ├── database.js        # Database operations
│   └── notes.db          # SQLite database file (created automatically)
├── test-api.js           # API test suite
└── README.md
```

## 🧪 Testing

The project includes a comprehensive test suite (`test-api.js`) that tests:

- Health check endpoint
- Note creation
- Retrieving all notes
- Retrieving single notes
- Full and partial note updates
- Note deletion
- Error handling scenarios

Run tests with:
```bash
node test-api.js
```

## 🚨 Error Handling

The API includes comprehensive error handling for:

- **400 Bad Request**: Invalid input data or missing required fields
- **404 Not Found**: Note not found or invalid endpoint
- **500 Internal Server Error**: Database or server errors

## 🔒 Security Features

- Input validation and sanitization
- Proper HTTP status codes
- SQL injection prevention through parameterized queries

## 📈 Performance

- SQLite database for fast local operations
- Efficient queries with proper indexing
- Minimal memory footprint
- Fast startup time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
