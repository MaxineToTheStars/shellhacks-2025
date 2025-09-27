# Scripts Directory

This directory contains simplified scripts for managing the MindPath application.

## Available Scripts

### 🚀 `./scripts/run.sh`
Starts the MindPath application (both server and client)
- Starts server on port 3000
- Starts client on port 8080
- Creates logs directory and PID files
- Runs services in background

### 🧹 `./scripts/clean.sh`
Cleans the project by removing build artifacts and dependencies
- Removes `node_modules` directories
- Removes `package-lock.json` files
- Removes `dist`, `build`, and `coverage` directories
- Cleans temporary files

### 📦 `./scripts/install.sh`
Installs all project dependencies
- Installs server dependencies
- Installs client dependencies  
- Installs database dependencies
- Checks Node.js and npm versions

### 🛑 `./scripts/stop.sh`
Stops all running services
- Stops server and client processes
- Kills processes on ports 3000 and 8080
- Cleans up PID files

## Usage Examples

```bash
# Clean and reinstall everything
./scripts/clean.sh
./scripts/install.sh

# Start the application
./scripts/run.sh

# Stop the application
./scripts/stop.sh
```

## Prerequisites

- Node.js (v14 or higher)
- npm
- Bash shell

## Notes

- All scripts should be run from the project root directory
- Logs are stored in the `logs/` directory
- PID files are created in `logs/` for process management
- Scripts use colored output for better readability