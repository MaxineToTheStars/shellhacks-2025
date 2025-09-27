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
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
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

# Function to check service status
check_service() {
    local name=$1
    local port=$2
    local url=$3
    local pid_file="logs/${name}.pid"
    
    echo -n "Checking $name... "
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            if check_port $port; then
                print_success "$name is running (PID: $pid, Port: $port)"
                if [ -n "$url" ]; then
                    echo "    URL: $url"
                fi
                return 0
            else
                print_warning "$name process exists but port $port is not listening"
                return 1
            fi
        else
            print_error "$name PID file exists but process is not running"
            rm -f "$pid_file"
            return 1
        fi
    else
        if check_port $port; then
            print_warning "$name is running on port $port but no PID file found"
            return 0
        else
            print_error "$name is not running"
            return 1
        fi
    fi
}

# Function to test API endpoint
test_api() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name API... "
    if curl -s -f "$url" >/dev/null 2>&1; then
        print_success "$name API is responding"
        return 0
    else
        print_error "$name API is not responding"
        return 1
    fi
}

# Main script
main() {
    print_status "📊 Notes App Service Status"
    echo "================================"
    
    # Check if we're in the right directory
    if [ ! -d "logs" ]; then
        print_warning "No logs directory found. Services may not be running."
        echo ""
        print_status "To start services, run: ./scripts/start.sh"
        exit 0
    fi
    
    echo ""
    
    # Check server
    if check_service "server" 3000 "http://localhost:3000"; then
        test_api "http://localhost:3000/health" "Server"
    fi
    
    echo ""
    
    # Check client
    if check_service "client" 8080 "http://localhost:8080"; then
        test_api "http://localhost:8080" "Client"
    fi
    
    echo ""
    print_status "📝 Logs:"
    if [ -f "logs/server.log" ]; then
        echo "    • Server: logs/server.log"
    fi
    if [ -f "logs/client.log" ]; then
        echo "    • Client: logs/client.log"
    fi
    
    echo ""
    print_status "🛠️  Commands:"
    echo "    • Start: ./scripts/start.sh"
    echo "    • Stop:  ./scripts/stop.sh"
    echo "    • Status: ./scripts/status.sh"
}

# Run main function
main "$@"
