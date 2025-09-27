#!/usr/bin/env node

/**
 * Test script to verify Auth0 integration
 * This script tests the server endpoints to ensure they require authentication
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:3000';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Auth0 Integration...\n');

  try {
    // Test 1: Health check (should work without auth)
    console.log('1. Testing health check endpoint...');
    const healthResponse = await makeRequest('/health');
    if (healthResponse.statusCode === 200) {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed:', healthResponse.statusCode);
    }

    // Test 2: Get notes without auth (should fail)
    console.log('\n2. Testing GET /api/notes without authentication...');
    const notesResponse = await makeRequest('/api/notes');
    if (notesResponse.statusCode === 401) {
      console.log('✅ Authentication required - GET notes failed as expected');
    } else {
      console.log('❌ GET notes should require authentication:', notesResponse.statusCode);
    }

    // Test 3: Create note without auth (should fail)
    console.log('\n3. Testing POST /api/notes without authentication...');
    const createResponse = await makeRequest('/api/notes', {
      method: 'POST',
      body: {
        title: 'Test Note',
        content: 'This should fail without auth'
      }
    });
    if (createResponse.statusCode === 401) {
      console.log('✅ Authentication required - POST note failed as expected');
    } else {
      console.log('❌ POST note should require authentication:', createResponse.statusCode);
    }

    // Test 4: Invalid JWT token (should fail)
    console.log('\n4. Testing with invalid JWT token...');
    const invalidTokenResponse = await makeRequest('/api/notes', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    if (invalidTokenResponse.statusCode === 401) {
      console.log('✅ Invalid token rejected as expected');
    } else {
      console.log('❌ Invalid token should be rejected:', invalidTokenResponse.statusCode);
    }

    console.log('\n🎉 Auth0 integration tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up your Auth0 account and application');
    console.log('2. Configure environment variables');
    console.log('3. Start the server: cd server && npm start');
    console.log('4. Start the client: cd client && npm run dev');
    console.log('5. Test the full authentication flow in the browser');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the server is running on port 3000');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
