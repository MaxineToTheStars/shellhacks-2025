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

# Function to clean a directory
clean_directory() {
    local dir=$1
    local name=$2
    
    if [ ! -d "$dir" ]; then
        print_warning "$name directory not found: $dir"
        return 0
    fi
    
    print_status "Cleaning $name directory..."
    cd "$dir" || return 1
    
    # Remove node_modules
    if [ -d "node_modules" ]; then
        print_status "Removing node_modules from $name..."
        rm -rf node_modules
        print_success "node_modules removed from $name"
    else
        print_warning "No node_modules found in $name"
    fi
    
    # Remove package-lock.json
    if [ -f "package-lock.json" ]; then
        print_status "Removing package-lock.json from $name..."
        rm -f package-lock.json
        print_success "package-lock.json removed from $name"
    else
        print_warning "No package-lock.json found in $name"
    fi
    
    # Remove dist directory
    if [ -d "dist" ]; then
        print_status "Removing dist directory from $name..."
        rm -rf dist
        print_success "dist directory removed from $name"
    else
        print_warning "No dist directory found in $name"
    fi
    
    # Remove build directory
    if [ -d "build" ]; then
        print_status "Removing build directory from $name..."
        rm -rf build
        print_success "build directory removed from $name"
    else
        print_warning "No build directory found in $name"
    fi
    
    # Remove .next directory (Next.js)
    if [ -d ".next" ]; then
        print_status "Removing .next directory from $name..."
        rm -rf .next
        print_success ".next directory removed from $name"
    fi
    
    # Remove .nuxt directory (Nuxt.js)
    if [ -d ".nuxt" ]; then
        print_status "Removing .nuxt directory from $name..."
        rm -rf .nuxt
        print_success ".nuxt directory removed from $name"
    fi
    
    # Remove coverage directory
    if [ -d "coverage" ]; then
        print_status "Removing coverage directory from $name..."
        rm -rf coverage
        print_success "coverage directory removed from $name"
    fi
    
    # Remove .cache directory
    if [ -d ".cache" ]; then
        print_status "Removing .cache directory from $name..."
        rm -rf .cache
        print_success ".cache directory removed from $name"
    fi
    
    # Remove logs directory (but keep the main logs directory)
    if [ -d "logs" ] && [ "$name" != "Root" ]; then
        print_status "Removing logs directory from $name..."
        rm -rf logs
        print_success "logs directory removed from $name"
    fi
    
    cd - > /dev/null
    return 0
}

# Main script
main() {
    print_status "🧹 Starting Project Cleanup"
    echo "================================"
    
    # Check if we're in the right directory
    if [ ! -f "README.md" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Clean root directory
    print_status "Cleaning root directory..."
    
    # Remove root-level build artifacts
    if [ -d "dist" ]; then
        print_status "Removing root dist directory..."
        rm -rf dist
        print_success "Root dist directory removed"
    fi
    
    if [ -d "build" ]; then
        print_status "Removing root build directory..."
        rm -rf build
        print_success "Root build directory removed"
    fi
    
    if [ -d "coverage" ]; then
        print_status "Removing root coverage directory..."
        rm -rf coverage
        print_success "Root coverage directory removed"
    fi
    
    # Clean subdirectories
    clean_directory "database" "Database"
    clean_directory "server" "Server"
    clean_directory "client" "Client"
    
    # Clean logs directory (optional)
    if [ "$1" = "--include-logs" ]; then
        if [ -d "logs" ]; then
            print_status "Removing logs directory..."
            rm -rf logs
            print_success "Logs directory removed"
        fi
    else
        print_warning "Logs directory preserved. Use --include-logs to remove it."
    fi
    
    # Clean temporary files
    print_status "Cleaning temporary files..."
    
    # Remove .DS_Store files (macOS)
    find . -name ".DS_Store" -type f -delete 2>/dev/null && print_success "Removed .DS_Store files"
    
    # Remove Thumbs.db files (Windows)
    find . -name "Thumbs.db" -type f -delete 2>/dev/null && print_success "Removed Thumbs.db files"
    
    # Remove .vscode/settings.json if it exists (optional)
    if [ -f ".vscode/settings.json" ] && [ "$1" = "--include-vscode" ]; then
        print_status "Removing .vscode/settings.json..."
        rm -f .vscode/settings.json
        print_success ".vscode/settings.json removed"
    fi
    
    echo ""
    print_success "🎉 Project cleanup completed!"
    echo "================================"
    print_status "Removed:"
    print_status "  • node_modules directories"
    print_status "  • package-lock.json files"
    print_status "  • dist/build directories"
    print_status "  • coverage directories"
    print_status "  • cache directories"
    print_status "  • temporary system files"
    echo ""
    print_status "💡 To reinstall dependencies:"
    print_status "  • Run: ./scripts/start.sh"
    print_status "  • Or manually: cd <directory> && npm install"
    echo ""
    if [ "$1" != "--include-logs" ]; then
        print_status "📝 Note: Logs directory was preserved"
        print_status "  Use --include-logs to remove it as well"
    fi
}

# Show usage if help requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --include-logs    Also remove the logs directory"
    echo "  --include-vscode  Also remove .vscode/settings.json"
    echo "  --help, -h        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                # Clean project, keep logs"
    echo "  $0 --include-logs # Clean project, remove logs too"
    exit 0
fi

# Run main function
main "$@"
