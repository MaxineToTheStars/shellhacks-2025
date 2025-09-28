# Project Structure Documentation

This document provides a comprehensive overview of the MindPath project structure, including directory organization, file purposes, and architectural decisions.

## Root Directory Structure

```
shellhacks-2025/
├── .git/                    # Git version control data
├── .gitignore              # Git ignore patterns
├── .editorconfig           # Editor configuration standards
├── .gitattributes          # Git attributes for file handling
├── docs/                   # Project documentation
├── client/                 # React frontend application
├── server/                 # Node.js backend server
├── database/               # Database layer and operations
├── scripts/                # Automation and utility scripts
└── README.md               # Project overview
```

## Documentation Directory (`/docs`)

The documentation directory contains all project documentation in a centralized location.

```
docs/
├── README.md               # Documentation index and navigation
├── overview.md             # Application overview and features
├── installation.md         # Setup and installation guide
├── api.md                  # API documentation and reference
├── authentication.md       # Auth0 configuration guide
├── client.md               # Frontend application documentation
├── project-structure.md    # This document
└── development.md          # Development workflow guide
```

## Client Application (`/client`)

The React frontend application with modern development tooling.

```
client/
├── public/                 # Static assets and HTML template
│   └── index.html         # Main HTML template
├── src/                   # Source code directory
│   ├── components/        # React components
│   │   ├── AnalysisLogView.tsx    # Analysis history interface
│   │   ├── AnalysisModal.tsx      # Analysis results modal
│   │   ├── LoginPage.tsx          # Authentication page
│   │   ├── Note.tsx               # Individual note component
│   │   ├── NoteForm.tsx           # Note creation form
│   │   └── UserProfile.tsx        # User profile component
│   ├── services/          # API integration layer
│   │   └── api.ts         # HTTP client and API methods
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Application type definitions
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # React application entry point
│   └── index.css          # Global styles and TailwindCSS
├── node_modules/          # NPM dependencies
├── package.json           # Frontend dependencies and scripts
├── package-lock.json      # Dependency lock file
├── tailwind.config.js     # TailwindCSS configuration
├── postcss.config.js      # PostCSS configuration
├── webpack.config.js      # Webpack bundler configuration
├── tsconfig.json          # TypeScript configuration
└── env.example            # Environment variables template
```

### Client Component Architecture

**Component Hierarchy:**
```
App
├── LoginPage (when not authenticated)
├── UserProfile
├── NoteForm
├── Note (multiple instances)
├── AnalysisModal
└── AnalysisLogView
```

**Data Flow:**
- Authentication state flows from Auth0 through App component
- Notes data flows from API service through App to child components
- User interactions flow up through component props and callbacks

## Server Application (`/server`)

The Node.js backend server with Express.js framework.

```
server/
├── node_modules/          # NPM dependencies
├── package.json           # Backend dependencies and scripts
├── package-lock.json      # Dependency lock file
├── server.js              # Main Express server file
├── geminiService.js       # AI service integration
└── env.example            # Environment variables template
```

### Server Architecture

**Core Components:**
- **Express.js Server**: HTTP server and middleware configuration
- **Authentication Middleware**: JWT token validation and user context
- **API Routes**: RESTful endpoints for notes and analysis
- **Error Handling**: Centralized error processing and response formatting
- **CORS Configuration**: Cross-origin request handling

**Middleware Stack:**
1. CORS middleware for cross-origin requests
2. JSON parsing middleware for request bodies
3. Authentication middleware for protected routes
4. Error handling middleware for response formatting

## Database Layer (`/database`)

Database operations and schema management.

```
database/
├── node_modules/          # NPM dependencies
├── package.json           # Database dependencies and scripts
├── package-lock.json      # Dependency lock file
├── database.js            # Database operations and queries
└── notes.db               # SQLite database file (auto-generated)
```

### Database Architecture

**SQLite Database:**
- File-based database for simplicity and portability
- User isolation through user_id foreign keys
- Automatic timestamp management
- ACID compliance for data integrity

**Schema Design:**
```sql
-- Notes table
CREATE TABLE notes (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Analysis logs table
CREATE TABLE analysis_logs (
    log_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    notes_analyzed TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    generated_resources TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Scripts Directory (`/scripts`)

Automation scripts for development and deployment.

```
scripts/
├── install.sh             # Automated dependency installation
├── run.sh                 # Application startup script
├── stop.sh                # Application shutdown script
└── clean.sh               # Project cleanup script
```

### Script Functions

**install.sh:**
- Installs all project dependencies
- Sets up environment configurations
- Initializes database if needed
- Verifies installation success

**run.sh:**
- Starts the server in development mode
- Starts the client development server
- Provides process management
- Handles port configuration

**stop.sh:**
- Gracefully stops all running processes
- Cleans up temporary files
- Provides shutdown confirmation

**clean.sh:**
- Removes node_modules directories
- Cleans build artifacts
- Resets environment configurations
- Provides cleanup confirmation

## Configuration Files

### Root Level Configuration

**.gitignore:**
- Excludes node_modules directories
- Ignores environment files
- Excludes build artifacts
- Ignores IDE-specific files

**.editorconfig:**
- Defines coding standards
- Sets indentation rules
- Configures line endings
- Establishes file encoding standards

**.gitattributes:**
- Configures Git file handling
- Sets line ending normalization
- Defines merge strategies
- Configures file type detection

### Client Configuration

**package.json:**
- Defines frontend dependencies
- Configures build and development scripts
- Sets up TypeScript and React tooling
- Manages TailwindCSS and Webpack configuration

**webpack.config.js:**
- Configures module bundling
- Sets up development server
- Configures environment variable injection
- Optimizes production builds

**tailwind.config.js:**
- Defines custom design system
- Configures color palette
- Sets up responsive breakpoints
- Customizes component styles

**tsconfig.json:**
- Configures TypeScript compilation
- Sets strict type checking
- Defines module resolution
- Configures build output

### Server Configuration

**package.json:**
- Defines backend dependencies
- Configures server scripts
- Sets up development tools
- Manages Express.js and middleware

## Environment Configuration

### Environment Variables

**Client Environment (.env):**
```env
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://mindpath-api
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:8080
```

**Server Environment (.env):**
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://mindpath-api
PORT=3000
NODE_ENV=development
```

## Development Workflow

### File Organization Principles

1. **Separation of Concerns**: Each directory has a specific purpose
2. **Modular Architecture**: Components and services are self-contained
3. **Configuration Management**: Environment-specific settings are centralized
4. **Documentation**: All major components are documented

### Code Organization Standards

1. **Component Structure**: React components follow consistent patterns
2. **API Design**: RESTful endpoints with consistent response formats
3. **Error Handling**: Centralized error processing and user feedback
4. **Type Safety**: Comprehensive TypeScript type definitions

### Build and Deployment

1. **Development Build**: Hot reloading and development tools
2. **Production Build**: Optimized bundles and asset compression
3. **Environment Management**: Separate configurations for different environments
4. **Dependency Management**: Locked dependency versions for consistency

## Security Considerations

### File Access Control

- Environment files are excluded from version control
- Database files are user-specific and isolated
- Configuration files contain no sensitive data
- Build artifacts are excluded from repository

### Data Protection

- User data is isolated by user_id
- Authentication tokens are handled securely
- API endpoints require proper authentication
- Input validation prevents injection attacks

## Maintenance and Updates

### Dependency Management

- Regular dependency updates for security patches
- Version locking for production stability
- Automated security scanning
- Compatibility testing for major updates

### Documentation Maintenance

- Documentation is kept in sync with code changes
- API documentation is updated with endpoint changes
- Installation guides are tested regularly
- Troubleshooting guides are updated based on user feedback
