#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    print_warning "Dependencies not found. Run './scripts/install.sh' first."
    exit 1
fi

print_status "🚀 Starting MindPath App..."

# Clean up any existing processes
print_status "Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "webpack.*serve" 2>/dev/null || true
sleep 2

# Start server in background
print_status "Starting server on port 8081..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait for server to start
print_status "Waiting for server to start..."
sleep 3

# Start client in foreground (this will keep the script running)
print_status "Starting client on port 8080..."
print_success "🎉 MindPath App is running!"
echo ""
print_status "📊 Services:"
print_status "   • Webapp: http://localhost:8080 (starting...)"
print_status "   • API Server: http://localhost:8081 (PID: $SERVER_PID)"
echo ""
print_status "💡 Press Ctrl+C to stop both servers"
echo ""

# Start client in foreground - this keeps the script running
cd client
npm run dev
