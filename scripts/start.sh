#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to clean and install dependencies for a directory
clean_and_install() {
    local dir=$1
    local name=$2
    
    if [ ! -d "$dir" ]; then
        print_error "$name directory not found: $dir"
        return 1
    fi
    
    print_status "Cleaning and installing dependencies for $name..."
    cd "$dir" || return 1
    
    # Remove node_modules and package-lock.json
    if [ -d "node_modules" ]; then
        print_status "Removing node_modules from $name..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        print_status "Removing package-lock.json from $name..."
        rm -f package-lock.json
    fi
    
    # Install dependencies
    print_status "Installing dependencies for $name..."
    if npm install; then
        print_success "Dependencies installed successfully for $name"
    else
        print_error "Failed to install dependencies for $name"
        return 1
    fi
    
    cd - > /dev/null
    return 0
}

# Function to start a service in background
start_service() {
    local dir=$1
    local name=$2
    local command=$3
    local port=$4
    
    print_status "Starting $name..."
    cd "$dir" || return 1
    
    # Start the service in background
    nohup npm run "$command" > "../logs/${name}.log" 2>&1 &
    local pid=$!
    echo $pid > "../logs/${name}.pid"
    
    print_success "$name started with PID $pid"
    print_status "Logs available at: logs/${name}.log"
    
    # Wait a moment for the service to start
    sleep 2
    
    # Check if the service is still running
    if kill -0 $pid 2>/dev/null; then
        print_success "$name is running on port $port"
    else
        print_error "$name failed to start. Check logs/${name}.log for details."
        return 1
    fi
    
    cd - > /dev/null
    return 0
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local name=$2
    
    if check_port $port; then
        print_warning "Port $port is already in use. Attempting to free it..."
        local pids=$(lsof -ti :$port)
        if [ -n "$pids" ]; then
            echo $pids | xargs kill -9 2>/dev/null
            sleep 1
            if check_port $port; then
                print_error "Failed to free port $port for $name"
                return 1
            else
                print_success "Port $port freed for $name"
            fi
        fi
    fi
    return 0
}

# Main script
main() {
    print_status "🚀 Starting Notes App Setup and Launch Script"
    echo "=================================================="
    
    # Check if we're in the right directory
    if [ ! -f "README.md" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check if Node.js and npm are installed
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Node.js version: $(node --version)"
    print_success "npm version: $(npm --version)"
    
    # Create logs directory
    mkdir -p logs
    
    # Clean up any existing processes
    print_status "Cleaning up any existing processes..."
    if [ -f "logs/server.pid" ]; then
        local server_pid=$(cat logs/server.pid)
        if kill -0 $server_pid 2>/dev/null; then
            print_status "Stopping existing server (PID: $server_pid)..."
            kill $server_pid 2>/dev/null
        fi
        rm -f logs/server.pid
    fi
    
    if [ -f "logs/client.pid" ]; then
        local client_pid=$(cat logs/client.pid)
        if kill -0 $client_pid 2>/dev/null; then
            print_status "Stopping existing client (PID: $client_pid)..."
            kill $client_pid 2>/dev/null
        fi
        rm -f logs/client.pid
    fi
    
    # Free up ports
    kill_port 3000 "server"
    kill_port 8080 "client"
    
    # Clean and install dependencies
    print_status "Setting up project dependencies..."
    
    if ! clean_and_install "database" "Database"; then
        print_error "Failed to setup database dependencies"
        exit 1
    fi
    
    if ! clean_and_install "server" "Server"; then
        print_error "Failed to setup server dependencies"
        exit 1
    fi
    
    if ! clean_and_install "client" "Client"; then
        print_error "Failed to setup client dependencies"
        exit 1
    fi
    
    print_success "All dependencies installed successfully!"
    echo ""
    
    # Start the server
    print_status "Starting the Notes API server..."
    if ! start_service "server" "server" "dev" "3000"; then
        print_error "Failed to start server"
        exit 1
    fi
    
    # Wait a bit for server to fully start
    print_status "Waiting for server to initialize..."
    sleep 3
    
    # Start the client
    print_status "Starting the React client..."
    if ! start_service "client" "client" "dev" "8080"; then
        print_error "Failed to start client"
        exit 1
    fi
    
    echo ""
    print_success "🎉 Notes App is now running!"
    echo "=================================================="
    print_status "📊 Server Status:"
    print_status "   • API Server: http://localhost:3000"
    print_status "   • Health Check: http://localhost:3000/health"
    print_status "   • API Docs: http://localhost:3000/api/notes"
    echo ""
    print_status "🌐 Client Status:"
    print_status "   • React App: http://localhost:8080"
    echo ""
    print_status "📝 Logs:"
    print_status "   • Server logs: logs/server.log"
    print_status "   • Client logs: logs/client.log"
    echo ""
    print_status "🛑 To stop the services:"
    print_status "   • Run: ./scripts/stop.sh"
    print_status "   • Or manually kill the processes using the PIDs in logs/"
    echo ""
    print_warning "Press Ctrl+C to exit this script (services will continue running)"
    
    # Keep the script running and show logs
    while true; do
        sleep 10
        if ! kill -0 $(cat logs/server.pid 2>/dev/null) 2>/dev/null; then
            print_error "Server process died unexpectedly!"
            break
        fi
        if ! kill -0 $(cat logs/client.pid 2>/dev/null) 2>/dev/null; then
            print_error "Client process died unexpectedly!"
            break
        fi
    done
}

# Handle script interruption
cleanup() {
    print_status "Script interrupted. Services are still running."
    print_status "Use ./scripts/stop.sh to stop all services."
    exit 0
}

trap cleanup INT

# Run main function
main "$@"
