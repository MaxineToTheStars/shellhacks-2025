# Node.js/Express.js SQLite Note Management API

A RESTful API for managing notes built with Node.js, Express.js, and SQLite database.

## 🚀 Features

- **CRUD Operations**: Create, Read, Update, and Delete notes
- **SQLite Database**: Lightweight, file-based database
- **RESTful API**: Standard HTTP methods and status codes
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Proper error responses and status codes
- **Timestamp Management**: Automatic ISO 8601 timestamp generation

## 📋 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/health` | Health check endpoint | None |
| `POST` | `/api/notes` | Create a new note | `{"title": "...", "content": "..."}` |
| `GET` | `/api/notes` | Get all notes (newest first) | None |
| `GET` | `/api/notes/:id` | Get a single note by ID | None |
| `PUT` | `/api/notes/:id` | Update a note (full update) | `{"title": "...", "content": "..."}` |
| `PATCH` | `/api/notes/:id` | Update a note (partial update) | `{"title": "..."}` or `{"content": "..."}` |
| `DELETE` | `/api/notes/:id` | Delete a note by ID | None |

## 🗄️ Database Schema

### `notes` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `note_id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| `title` | TEXT | NOT NULL | Note title |
| `content` | TEXT | NOT NULL | Note content |
| `last_updated` | TEXT | - | ISO 8601 timestamp |

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

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
