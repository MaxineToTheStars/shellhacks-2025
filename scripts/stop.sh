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

print_status "🛑 Stopping MindPath App..."

# Stop server
if [ -f "logs/server.pid" ]; then
    SERVER_PID=$(cat logs/server.pid)
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_status "Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null
        sleep 2
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill -9 $SERVER_PID 2>/dev/null
        fi
        print_success "Server stopped"
    fi
    rm -f logs/server.pid
fi

# Stop client
if [ -f "logs/client.pid" ]; then
    CLIENT_PID=$(cat logs/client.pid)
    if kill -0 $CLIENT_PID 2>/dev/null; then
        print_status "Stopping client (PID: $CLIENT_PID)..."
        kill $CLIENT_PID 2>/dev/null
        sleep 2
        if kill -0 $CLIENT_PID 2>/dev/null; then
            kill -9 $CLIENT_PID 2>/dev/null
        fi
        print_success "Client stopped"
    fi
    rm -f logs/client.pid
fi

# Kill any remaining processes on our ports (portable alternative to lsof)
netstat -tlnp 2>/dev/null | grep :3000 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true
netstat -tlnp 2>/dev/null | grep :8080 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true

print_success "🎉 All services stopped!"