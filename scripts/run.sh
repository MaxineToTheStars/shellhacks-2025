#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create logs directory
mkdir -p logs

print_status "🚀 Starting MindPath App..."

# Start server in background
print_status "Starting server on port 3000..."
cd server
nohup npm start > ../logs/server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > ../logs/server.pid
cd ..

# Wait for server to start
sleep 3

# Start client in background
print_status "Starting client on port 8080..."
cd client
nohup npm run dev > ../logs/client.log 2>&1 &
CLIENT_PID=$!
echo $CLIENT_PID > ../logs/client.pid
cd ..

print_success "🎉 MindPath App is running!"
echo ""
print_status "📊 Services:"
print_status "   • Server: http://localhost:3000"
print_status "   • Client: http://localhost:8080"
echo ""
print_status "📝 Logs:"
print_status "   • Server: logs/server.log"
print_status "   • Client: logs/client.log"
echo ""
print_status "🛑 To stop: ./scripts/stop.sh"
