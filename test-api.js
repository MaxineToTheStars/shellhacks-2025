const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsedBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test functions
async function testHealthCheck() {
    console.log('🔍 Testing health check...');
    try {
        const response = await makeRequest('GET', '/health');
        console.log('✅ Health check:', response.status, response.data);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
}

async function testCreateNote() {
    console.log('\n🔍 Testing note creation...');
    try {
        const noteData = {
            title: 'Test Note',
            content: 'This is a test note content.'
        };
        const response = await makeRequest('POST', '/api/notes', noteData);
        console.log('✅ Create note:', response.status, response.data);
        return response.data.note?.note_id;
    } catch (error) {
        console.log('❌ Create note failed:', error.message);
        return null;
    }
}

async function testGetAllNotes() {
    console.log('\n🔍 Testing get all notes...');
    try {
        const response = await makeRequest('GET', '/api/notes');
        console.log('✅ Get all notes:', response.status, response.data);
    } catch (error) {
        console.log('❌ Get all notes failed:', error.message);
    }
}

async function testGetNoteById(noteId) {
    console.log('\n🔍 Testing get note by ID...');
    try {
        const response = await makeRequest('GET', `/api/notes/${noteId}`);
        console.log('✅ Get note by ID:', response.status, response.data);
    } catch (error) {
        console.log('❌ Get note by ID failed:', error.message);
    }
}

async function testUpdateNote(noteId) {
    console.log('\n🔍 Testing note update...');
    try {
        const updateData = {
            title: 'Updated Test Note',
            content: 'This is the updated content of the test note.'
        };
        const response = await makeRequest('PUT', `/api/notes/${noteId}`, updateData);
        console.log('✅ Update note:', response.status, response.data);
    } catch (error) {
        console.log('❌ Update note failed:', error.message);
    }
}

async function testPartialUpdateNote(noteId) {
    console.log('\n🔍 Testing partial note update...');
    try {
        const updateData = {
            title: 'Partially Updated Note'
        };
        const response = await makeRequest('PATCH', `/api/notes/${noteId}`, updateData);
        console.log('✅ Partial update note:', response.status, response.data);
    } catch (error) {
        console.log('❌ Partial update note failed:', error.message);
    }
}

async function testDeleteNote(noteId) {
    console.log('\n🔍 Testing note deletion...');
    try {
        const response = await makeRequest('DELETE', `/api/notes/${noteId}`);
        console.log('✅ Delete note:', response.status, response.data);
    } catch (error) {
        console.log('❌ Delete note failed:', error.message);
    }
}

async function testErrorHandling() {
    console.log('\n🔍 Testing error handling...');

    // Test invalid note ID
    try {
        const response = await makeRequest('GET', '/api/notes/invalid');
        console.log('✅ Invalid ID handling:', response.status, response.data);
    } catch (error) {
        console.log('❌ Invalid ID test failed:', error.message);
    }

    // Test non-existent note
    try {
        const response = await makeRequest('GET', '/api/notes/99999');
        console.log('✅ Non-existent note handling:', response.status, response.data);
    } catch (error) {
        console.log('❌ Non-existent note test failed:', error.message);
    }

    // Test missing required fields
    try {
        const response = await makeRequest('POST', '/api/notes', { title: 'Missing content' });
        console.log('✅ Missing fields handling:', response.status, response.data);
    } catch (error) {
        console.log('❌ Missing fields test failed:', error.message);
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting API Tests...\n');

    await testHealthCheck();
    const noteId = await testCreateNote();
    await testGetAllNotes();

    if (noteId) {
        await testGetNoteById(noteId);
        await testUpdateNote(noteId);
        await testPartialUpdateNote(noteId);
        await testGetAllNotes(); // Check updated notes
        await testDeleteNote(noteId);
    }

    await testErrorHandling();

    console.log('\n✨ API Tests completed!');
}

// Check if server is running before starting tests
async function checkServer() {
    try {
        await makeRequest('GET', '/health');
        return true;
    } catch (error) {
        console.log('❌ Server is not running. Please start the server first:');
        console.log('   cd server && npm run dev');
        return false;
    }
}

// Main execution
async function main() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await runTests();
    }
}

main().catch(console.error);
