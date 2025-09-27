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

# Function to stop a service
stop_service() {
    local name=$1
    local pid_file="logs/${name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            print_status "Stopping $name (PID: $pid)..."
            kill $pid 2>/dev/null
            
            # Wait for graceful shutdown
            local count=0
            while kill -0 $pid 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                print_warning "Force killing $name..."
                kill -9 $pid 2>/dev/null
            fi
            
            print_success "$name stopped"
        else
            print_warning "$name was not running"
        fi
        rm -f "$pid_file"
    else
        print_warning "No PID file found for $name"
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local name=$2
    
    local pids=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pids" ]; then
        print_status "Killing processes on port $port ($name)..."
        echo $pids | xargs kill -9 2>/dev/null
        print_success "Port $port freed"
    fi
}

# Main script
main() {
    print_status "🛑 Stopping Notes App Services"
    echo "=================================="
    
    # Check if we're in the right directory
    if [ ! -d "logs" ]; then
        print_warning "No logs directory found. Services may not be running."
        exit 0
    fi
    
    # Stop services using PID files
    stop_service "client"
    stop_service "server"
    
    # Kill any remaining processes on our ports
    kill_port 8080 "client"
    kill_port 3000 "server"
    
    # Clean up log files (optional)
    if [ "$1" = "--clean-logs" ]; then
        print_status "Cleaning up log files..."
        rm -f logs/*.log
        print_success "Log files cleaned"
    fi
    
    print_success "🎉 All services stopped successfully!"
}

# Run main function
main "$@"
