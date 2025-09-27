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
if [ ! -f "README.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "🧹 Cleaning MindPath project..."

# Stop any running processes first
print_status "Stopping any running processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "webpack.*serve" 2>/dev/null || true
sleep 1

# Clean server
if [ -d "server" ]; then
    print_status "Cleaning server..."
    cd server
    rm -rf node_modules package-lock.json dist build
    cd ..
    print_success "Server cleaned"
fi

# Clean client
if [ -d "client" ]; then
    print_status "Cleaning client..."
    cd client
    rm -rf node_modules package-lock.json dist build
    cd ..
    print_success "Client cleaned"
fi

# Clean database
if [ -d "database" ]; then
    print_status "Cleaning database..."
    cd database
    rm -rf node_modules package-lock.json
    cd ..
    print_success "Database cleaned"
fi

# Clean logs and temp files
print_status "Cleaning logs and temporary files..."
rm -rf logs dist build coverage .nyc_output
rm -f *.log *.pid

# Clean any editor/IDE files
print_status "Cleaning editor files..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true

print_success "🎉 Project cleaned!"
print_status "💡 Run './scripts/install.sh' to reinstall dependencies"
