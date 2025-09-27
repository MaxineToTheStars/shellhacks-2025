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

# Kill all MindPath processes
print_status "Stopping all MindPath processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "webpack.*serve" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

# Kill processes on our ports
if command -v netstat >/dev/null 2>&1; then
    netstat -tlnp 2>/dev/null | grep :8080 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true
    netstat -tlnp 2>/dev/null | grep :8081 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true
fi

print_success "🎉 All services stopped!"