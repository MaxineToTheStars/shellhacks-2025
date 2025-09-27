# Auth0 Setup Instructions

## 1. Create Auth0 Account and Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/) and create a free account
2. Create a new Application:
   - Choose "Single Page Application"
   - Name it "MindPath Notes App"
3. In the Application settings, note down:
   - Domain (e.g., `your-domain.auth0.com`)
   - Client ID
   - Client Secret (for server-side)

## 2. Configure Auth0 Application

### Application Settings
- **Allowed Callback URLs**: `http://localhost:8080`
- **Allowed Logout URLs**: `http://localhost:8080`
- **Allowed Web Origins**: `http://localhost:8080`
- **Allowed Origins (CORS)**: `http://localhost:8080`

### Social Connections
1. Go to Authentication > Social
2. Enable Google OAuth2
3. Configure with your Google OAuth2 credentials

## 3. Create API

1. Go to Applications > APIs
2. Create a new API:
   - Name: "MindPath API"
   - Identifier: `https://mindpath-api` (or your preferred identifier)
   - Signing Algorithm: RS256

## 4. Environment Variables

### Client (.env file in client directory)
1. Copy the example file: `cp client/env.example client/.env`
2. Edit `client/.env` with your actual values:
```env
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://mindpath-api
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:8080
```

### Server (.env file in server directory)
1. Copy the example file: `cp server/env.example server/.env`
2. Edit `server/.env` with your actual values:
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://mindpath-api
PORT=3000
NODE_ENV=development
```

## 5. Install Dependencies

### Client
```bash
cd client
npm install
```

### Server
```bash
cd server
npm install
```

## 6. Run the Application

1. Start the server:
```bash
cd server
npm start
```

2. Start the client:
```bash
cd client
npm run dev
```

## 7. Test the Integration

1. Open `http://localhost:8080`
2. You should see the login page
3. Click "Continue with Google" to authenticate
4. After successful login, you should see your personal notes interface

## Troubleshooting

- Make sure all environment variables are set correctly
- Check that the Auth0 application settings match your local URLs
- Verify that Google OAuth2 is properly configured in Auth0
- Check browser console and server logs for any errors
