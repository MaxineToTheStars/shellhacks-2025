# Authentication Setup Guide

This guide provides detailed instructions for configuring Auth0 authentication for the MindPath application, including Google OAuth integration and environment setup.

## Overview

MindPath uses Auth0 as the identity provider with Google OAuth2 integration for secure user authentication. This setup ensures enterprise-grade security while providing a seamless user experience.

## Prerequisites

Before configuring authentication, ensure you have:

- An Auth0 account (free tier available)
- A Google Cloud Platform account with OAuth2 credentials
- Administrative access to configure Auth0 applications and APIs

## Auth0 Account Setup

### Step 1: Create Auth0 Account

1. Navigate to [Auth0 Dashboard](https://manage.auth0.com/)
2. Sign up for a free Auth0 account
3. Complete the account verification process
4. Access your Auth0 dashboard

### Step 2: Create Application

1. In the Auth0 dashboard, navigate to **Applications**
2. Click **Create Application**
3. Configure the application:
   - **Name**: MindPath Notes App
   - **Application Type**: Single Page Application
   - **Technology**: React
4. Click **Create**

### Step 3: Configure Application Settings

Navigate to the **Settings** tab of your newly created application and configure the following:

#### Allowed Callback URLs
```
http://localhost:8080
```

#### Allowed Logout URLs
```
http://localhost:8080
```

#### Allowed Web Origins
```
http://localhost:8080
```

#### Allowed Origins (CORS)
```
http://localhost:8080
```

### Step 4: Retrieve Application Credentials

From the application **Settings** tab, note the following values:
- **Domain**: `your-domain.auth0.com`
- **Client ID**: `your-client-id`
- **Client Secret**: `your-client-secret` (for server-side operations)

## Google OAuth Configuration

### Step 1: Enable Google Social Connection

1. In the Auth0 dashboard, navigate to **Authentication > Social**
2. Click on **Google**
3. Toggle the connection to **Enabled**
4. Configure the Google connection settings

### Step 2: Google Cloud Platform Setup

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Navigate to **Credentials** in the API & Services section
5. Create OAuth2 credentials:
   - **Application Type**: Web application
   - **Authorized JavaScript Origins**: `https://your-domain.auth0.com`
   - **Authorized Redirect URIs**: `https://your-domain.auth0.com/login/callback`

### Step 3: Configure Auth0 Google Connection

1. Return to Auth0 dashboard
2. In the Google social connection settings, enter:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
3. Save the configuration

## API Configuration

### Step 1: Create Auth0 API

1. In the Auth0 dashboard, navigate to **Applications > APIs**
2. Click **Create API**
3. Configure the API:
   - **Name**: MindPath API
   - **Identifier**: `https://mindpath-api`
   - **Signing Algorithm**: RS256
4. Click **Create**

### Step 2: Configure API Settings

1. Navigate to the **Settings** tab of your API
2. Configure the following settings:
   - **Token Expiration**: 24 hours (default)
   - **Token Expiration for Browser Flows**: 24 hours
   - **Allow Offline Access**: Enabled
   - **Skip User Consent**: Enabled (for trusted applications)

## Environment Configuration

### Server Environment Variables

Create or update the `server/.env` file with the following configuration:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://mindpath-api

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_PATH=../database/notes.db
```

### Client Environment Variables

Create or update the `client/.env` file with the following configuration:

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://mindpath-api
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:8080

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000
```

## Security Configuration

### JWT Token Validation

The server validates JWT tokens using the following process:

1. **Token Extraction**: Extract token from Authorization header
2. **Signature Verification**: Verify token signature using Auth0 public key
3. **Audience Validation**: Ensure token audience matches API identifier
4. **Expiration Check**: Verify token has not expired
5. **User Context**: Extract user information from token claims

### CORS Configuration

Configure CORS settings to allow requests from the client application:

```javascript
const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
  optionsSuccessStatus: 200
};
```

## Testing Authentication

### Step 1: Start the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm run dev
```

### Step 2: Test Authentication Flow

1. Navigate to `http://localhost:8080`
2. Click the "Continue with Google" button
3. Complete the Google OAuth flow
4. Verify successful authentication and redirect
5. Check that user information is displayed correctly

### Step 3: Verify API Access

1. Open browser developer tools
2. Navigate to the Network tab
3. Perform actions that require API calls
4. Verify that requests include proper Authorization headers
5. Confirm that API responses are successful

## Troubleshooting

### Common Issues

#### Authentication Redirect Issues
- Verify callback URLs are correctly configured in Auth0
- Ensure client and server URLs match the configured origins
- Check that the redirect URI in client environment matches Auth0 settings

#### Token Validation Errors
- Verify the Auth0 domain is correctly configured
- Ensure the API audience matches the Auth0 API identifier
- Check that JWT tokens are properly formatted in requests

#### CORS Errors
- Confirm CORS origins are properly configured
- Verify that the client URL matches the allowed origins
- Check that credentials are properly handled in CORS configuration

#### Google OAuth Issues
- Verify Google Cloud Platform credentials are correctly configured
- Ensure Google+ API is enabled in the Google Cloud project
- Check that redirect URIs in Google Cloud match Auth0 configuration

### Debugging Steps

1. **Check Auth0 Logs**: Review Auth0 dashboard logs for authentication attempts
2. **Verify Environment Variables**: Ensure all environment variables are correctly set
3. **Test Token Manually**: Use tools like JWT.io to decode and verify tokens
4. **Review Network Requests**: Check browser network tab for failed requests
5. **Server Logs**: Review server console output for authentication errors

## Security Best Practices

### Token Management
- Implement proper token refresh mechanisms
- Store tokens securely in the client application
- Implement token expiration handling
- Use HTTPS in production environments

### User Data Protection
- Implement proper user data isolation
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper error handling without exposing sensitive information

### Production Considerations
- Use production Auth0 domains and applications
- Configure proper CORS settings for production domains
- Implement rate limiting for authentication endpoints
- Use secure cookie settings for session management
- Enable Auth0 anomaly detection features

## Advanced Configuration

### Custom Claims
Configure custom claims in Auth0 rules to include additional user information:

```javascript
function addCustomClaims(user, context, callback) {
  const namespace = 'https://mindpath.app/';
  context.idToken[namespace + 'user_metadata'] = user.user_metadata;
  callback(null, user, context);
}
```

### Multi-Factor Authentication
Enable MFA in Auth0 for enhanced security:
1. Navigate to **Security > Multi-factor Authentication**
2. Enable desired MFA methods
3. Configure MFA policies as needed

### Anomaly Detection
Enable Auth0 anomaly detection features:
1. Navigate to **Security > Anomaly Detection**
2. Enable brute force protection
3. Configure suspicious IP throttling
4. Set up breached password detection
