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
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

print_status "🧹 Cleaning project..."

# Clean server
if [ -d "server" ]; then
    print_status "Cleaning server..."
    cd server
    rm -rf node_modules package-lock.json dist build
    cd ..
fi

# Clean client
if [ -d "client" ]; then
    print_status "Cleaning client..."
    cd client
    rm -rf node_modules package-lock.json dist build
    cd ..
fi

# Clean database
if [ -d "database" ]; then
    print_status "Cleaning database..."
    cd database
    rm -rf node_modules package-lock.json
    cd ..
fi

# Clean root
rm -rf dist build coverage

print_success "🎉 Project cleaned!"
print_status "💡 Run './scripts/install.sh' to reinstall dependencies"