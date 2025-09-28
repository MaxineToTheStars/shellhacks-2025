# Development Guide

This guide provides comprehensive information for developers working on the MindPath project, including development workflow, coding standards, testing procedures, and contribution guidelines.

## Development Environment Setup

### Prerequisites

Before beginning development, ensure your system meets the following requirements:

- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **Git**: Latest version for version control
- **Code Editor**: VS Code recommended with appropriate extensions
- **Browser**: Chrome or Firefox with developer tools

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**: React development assistance
- **TypeScript Importer**: Automatic TypeScript imports
- **Tailwind CSS IntelliSense**: TailwindCSS autocomplete and validation
- **Prettier**: Code formatting
- **ESLint**: Code quality and consistency
- **Auto Rename Tag**: HTML/JSX tag management
- **Bracket Pair Colorizer**: Improved bracket visualization

### Initial Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd shellhacks-2025
```

2. **Install dependencies:**
```bash
./scripts/install.sh
```

3. **Configure environment variables:**
```bash
cp server/env.example server/.env
cp client/env.example client/.env
# Edit both .env files with your configuration
```

4. **Start development servers:**
```bash
./scripts/run.sh
```

## Development Workflow

### Git Workflow

**Branch Naming Convention:**
- `feature/description`: New features
- `bugfix/description`: Bug fixes
- `hotfix/description`: Critical fixes
- `docs/description`: Documentation updates
- `refactor/description`: Code refactoring

**Commit Message Format:**
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

**Example:**
```
feat(auth): add Google OAuth integration

Implement Google OAuth2 authentication through Auth0
with proper token validation and user session management.

Closes #123
```

### Development Process

1. **Create Feature Branch:**
```bash
git checkout -b feature/new-feature
```

2. **Make Changes:**
   - Write code following project standards
   - Add appropriate tests
   - Update documentation if needed

3. **Test Changes:**
```bash
# Run client tests
cd client
npm test

# Run server tests
cd ../server
npm test

# Run API tests
node test-api.js
```

4. **Commit Changes:**
```bash
git add .
git commit -m "feat(client): add new component"
```

5. **Push and Create Pull Request:**
```bash
git push origin feature/new-feature
```

## Coding Standards

### TypeScript Standards

**Type Definitions:**
- Use strict type checking
- Define interfaces for all data structures
- Use union types for limited value sets
- Implement proper error type handling

**Example:**
```typescript
interface Note {
  note_id: number;
  user_id: string;
  title: string;
  content: string;
  last_updated: string;
}

type NoteStatus = 'draft' | 'published' | 'archived';

function createNote(note: Omit<Note, 'note_id' | 'last_updated'>): Promise<Note> {
  // Implementation
}
```

**Naming Conventions:**
- Use PascalCase for components and interfaces
- Use camelCase for functions and variables
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that indicate purpose

### React Standards

**Component Structure:**
```typescript
import React, { useState, useEffect } from 'react';
import { ComponentProps } from '../types';

interface ComponentNameProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructured props
}) => {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    // JSX
  );
};
```

**Hook Usage:**
- Use custom hooks for reusable logic
- Implement proper dependency arrays
- Handle cleanup in useEffect
- Use useCallback for event handlers passed to children

**State Management:**
- Use useState for local component state
- Use useEffect for side effects
- Implement proper error boundaries
- Use context for shared state when appropriate

### API Development Standards

**Endpoint Design:**
- Follow RESTful conventions
- Use appropriate HTTP methods
- Implement consistent response formats
- Include proper error handling

**Example:**
```javascript
// GET /api/notes
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await db.getNotes(req.user.user_id);
    res.json({
      message: 'Notes retrieved successfully',
      notes: notes
    });
  } catch (error) {
    res.status(500).json({
      error: 'DatabaseError',
      message: 'Failed to retrieve notes'
    });
  }
});
```

**Error Handling:**
- Use consistent error response format
- Implement proper HTTP status codes
- Log errors for debugging
- Provide user-friendly error messages

### Database Standards

**Query Structure:**
- Use parameterized queries to prevent SQL injection
- Implement proper error handling
- Use transactions for multi-step operations
- Optimize queries for performance

**Example:**
```javascript
async function createNote(userId, title, content) {
  const query = `
    INSERT INTO notes (user_id, title, content, last_updated)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  try {
    const result = await db.run(query, [userId, title, content]);
    return result.lastID;
  } catch (error) {
    throw new DatabaseError('Failed to create note', error);
  }
}
```

## Testing Guidelines

### Client Testing

**Component Testing:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteForm } from '../NoteForm';

describe('NoteForm', () => {
  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<NoteForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Title' }
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Test Content' }
    });
    fireEvent.click(screen.getByText('Submit'));
    
    expect(mockSubmit).toHaveBeenCalledWith('Test Title', 'Test Content');
  });
});
```

**Integration Testing:**
- Test component interactions
- Mock API responses
- Test authentication flows
- Verify error handling

### Server Testing

**API Testing:**
```javascript
const request = require('supertest');
const app = require('../server');

describe('Notes API', () => {
  it('should create a new note', async () => {
    const response = await request(app)
      .post('/api/notes')
      .set('Authorization', 'Bearer valid-token')
      .send({
        title: 'Test Note',
        content: 'Test content'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.note.title).toBe('Test Note');
  });
});
```

**Database Testing:**
- Test database operations
- Verify data integrity
- Test error scenarios
- Validate user isolation

### End-to-End Testing

**User Flow Testing:**
- Test complete user journeys
- Verify authentication flows
- Test note creation and management
- Validate analysis functionality

## Performance Optimization

### Client Performance

**Code Splitting:**
```typescript
const AnalysisModal = React.lazy(() => import('./AnalysisModal'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalysisModal />
    </Suspense>
  );
}
```

**Memoization:**
```typescript
const MemoizedNote = React.memo(Note, (prevProps, nextProps) => {
  return prevProps.note.note_id === nextProps.note.note_id &&
         prevProps.note.last_updated === nextProps.note.last_updated;
});
```

**Bundle Optimization:**
- Use dynamic imports for large components
- Implement proper tree shaking
- Optimize image assets
- Minimize bundle size

### Server Performance

**Database Optimization:**
- Use proper indexing
- Implement query optimization
- Use connection pooling
- Monitor query performance

**Caching Strategies:**
- Implement response caching where appropriate
- Use Redis for session storage
- Cache frequently accessed data
- Implement cache invalidation

## Security Best Practices

### Authentication Security

**Token Handling:**
- Validate JWT tokens properly
- Implement token refresh mechanisms
- Use secure token storage
- Handle token expiration gracefully

**Input Validation:**
- Validate all user inputs
- Sanitize data before database operations
- Implement rate limiting
- Use parameterized queries

### Data Protection

**User Data Isolation:**
- Ensure proper user_id filtering
- Implement access control checks
- Validate user permissions
- Log security-relevant events

**Error Handling:**
- Don't expose sensitive information in errors
- Implement proper error logging
- Use generic error messages for users
- Log detailed errors for debugging

## Debugging and Troubleshooting

### Client Debugging

**React Developer Tools:**
- Use React DevTools for component inspection
- Monitor state changes and re-renders
- Debug performance issues
- Inspect component props and state

**Browser DevTools:**
- Use Network tab for API debugging
- Monitor console for errors
- Use Performance tab for optimization
- Debug authentication flows

### Server Debugging

**Logging:**
```javascript
const logger = require('winston');

logger.info('User authenticated', { userId: req.user.user_id });
logger.error('Database error', { error: error.message, stack: error.stack });
```

**Error Tracking:**
- Implement comprehensive error logging
- Use structured logging formats
- Monitor error rates and patterns
- Set up alerting for critical errors

## Code Review Process

### Review Checklist

**Functionality:**
- Does the code work as intended?
- Are all requirements met?
- Are edge cases handled?
- Is error handling appropriate?

**Code Quality:**
- Is the code readable and maintainable?
- Are naming conventions followed?
- Is the code properly documented?
- Are there any code smells?

**Security:**
- Are security best practices followed?
- Is input validation implemented?
- Are authentication checks in place?
- Is sensitive data handled properly?

**Performance:**
- Are there any performance issues?
- Is the code optimized appropriately?
- Are there memory leaks?
- Is the database access efficient?

### Review Process

1. **Self-Review:** Review your own code before submitting
2. **Peer Review:** Have at least one other developer review
3. **Testing:** Ensure all tests pass
4. **Documentation:** Update documentation if needed
5. **Approval:** Get approval before merging

## Deployment Guidelines

### Development Deployment

**Local Development:**
```bash
# Start development servers
./scripts/run.sh

# Run tests
npm test

# Check code quality
npm run lint
```

### Production Deployment

**Build Process:**
```bash
# Build client
cd client
npm run build

# Start server
cd ../server
npm start
```

**Environment Configuration:**
- Use production environment variables
- Configure proper CORS settings
- Set up monitoring and logging
- Implement health checks

## Contributing Guidelines

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new functionality**
5. **Update documentation**
6. **Submit a pull request**

### Contribution Requirements

**Code Quality:**
- Follow project coding standards
- Write comprehensive tests
- Update documentation
- Ensure all tests pass

**Communication:**
- Use clear commit messages
- Provide detailed pull request descriptions
- Respond to review feedback
- Communicate breaking changes

### Issue Reporting

**Bug Reports:**
- Provide clear reproduction steps
- Include environment information
- Attach relevant logs or screenshots
- Use the issue template

**Feature Requests:**
- Describe the feature clearly
- Explain the use case
- Consider implementation complexity
- Discuss with maintainers first

## Maintenance and Updates

### Dependency Management

**Regular Updates:**
- Update dependencies monthly
- Test updates in development
- Monitor for security vulnerabilities
- Update documentation as needed

**Breaking Changes:**
- Plan migration strategies
- Provide upgrade guides
- Maintain backward compatibility when possible
- Communicate changes clearly

### Documentation Maintenance

**Keep Documentation Current:**
- Update docs with code changes
- Review documentation regularly
- Fix broken links and examples
- Improve clarity and completeness
