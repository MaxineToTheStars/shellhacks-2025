# Installation Guide

This guide provides comprehensive instructions for installing and setting up the MindPath application on your local development environment.

## Prerequisites

Before beginning the installation process, ensure your system meets the following requirements:

- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher (included with Node.js)
- **Git**: For version control and repository cloning
- **Auth0 Account**: Free tier account for authentication services

## System Requirements

### Minimum System Specifications
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB available disk space
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Network**: Internet connection for dependency installation and Auth0 services

## Installation Methods

### Method 1: Automated Installation (Recommended)

The project includes automated installation scripts for simplified setup:

```bash
# Clone the repository
git clone <repository-url>
cd shellhacks-2025

# Run the automated installation script
./scripts/install.sh

# Start the application
./scripts/run.sh
```

### Method 2: Manual Installation

For developers who prefer manual control over the installation process:

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd shellhacks-2025
```

#### Step 2: Install Server Dependencies
```bash
cd server
npm install
cd ..
```

#### Step 3: Install Database Dependencies
```bash
cd database
npm install
cd ..
```

#### Step 4: Install Client Dependencies
```bash
cd client
npm install
cd ..
```

## Environment Configuration

### Server Environment Setup

1. Copy the environment template:
```bash
cp server/env.example server/.env
```

2. Configure the server environment variables in `server/.env`:
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://mindpath-api
PORT=3000
NODE_ENV=development
```

### Client Environment Setup

1. Copy the environment template:
```bash
cp client/env.example client/.env
```

2. Configure the client environment variables in `client/.env`:
```env
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://mindpath-api
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:8080
```

## Database Setup

The application uses SQLite for data persistence. The database will be automatically created upon first server startup.

### Database Initialization
```bash
cd database
npm run init
```

## Starting the Application

### Development Mode

Start the server in development mode with auto-restart:
```bash
cd server
npm run dev
```

In a separate terminal, start the client:
```bash
cd client
npm run dev
```

### Production Mode

Build and start the application for production:
```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm start
```

## Verification

### Health Check
Verify the server is running by accessing the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Client Access
Access the client application at `http://localhost:8080` to verify the frontend is properly configured.

## Troubleshooting

### Common Issues

#### Port Conflicts
If you encounter port conflicts:
- Server default port: 3000
- Client default port: 8080
- Modify ports in environment configuration files

#### Dependency Installation Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues
- Ensure SQLite is properly installed
- Check file permissions for database directory
- Verify database initialization completed successfully

#### Authentication Configuration
- Verify all Auth0 environment variables are correctly set
- Ensure Auth0 application is properly configured
- Check callback URLs match your local development setup

### Log Analysis

#### Server Logs
Server logs are displayed in the terminal where the server is running. Look for:
- Database connection confirmations
- Authentication middleware initialization
- API endpoint registrations

#### Client Logs
Client logs are available in the browser developer console. Check for:
- Authentication flow completion
- API request/response cycles
- Component rendering errors

## Next Steps

After successful installation:

1. Complete the [Authentication Setup](authentication.md) guide
2. Review the [API Documentation](api.md) for endpoint details
3. Explore the [Client Documentation](client.md) for frontend features
4. Refer to the [Development Guide](development.md) for contribution guidelines

## Support

If you encounter issues not covered in this guide:

1. Check the troubleshooting section above
2. Review server and client logs for error messages
3. Verify all environment variables are correctly configured
4. Ensure all prerequisites are properly installed
