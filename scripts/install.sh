#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "📦 Installing dependencies..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo ""

# Install server dependencies
print_status "Installing server dependencies..."
cd server
if npm install; then
    print_success "Server dependencies installed"
else
    print_error "Failed to install server dependencies"
    exit 1
fi
cd ..

# Install client dependencies
print_status "Installing client dependencies..."
cd client
if npm install; then
    print_success "Client dependencies installed"
else
    print_error "Failed to install client dependencies"
    exit 1
fi
cd ..

# Install database dependencies
print_status "Installing database dependencies..."
cd database
if npm install; then
    print_success "Database dependencies installed"
else
    print_error "Failed to install database dependencies"
    exit 1
fi
cd ..

print_success "🎉 All dependencies installed successfully!"
print_status "💡 Run './scripts/run.sh' to start the application"
