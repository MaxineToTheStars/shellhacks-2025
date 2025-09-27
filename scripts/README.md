# Scripts

This directory contains utility scripts for managing the Notes App project.

## Available Scripts

### 🚀 `start.sh` - Start All Services

Installs dependencies and starts the MindPath App:

```bash
./scripts/start.sh
```

**What it does:**
- ✅ Installs dependencies for database, server, and client
- ✅ Kills any existing processes on ports 3000 and 8080
- ✅ Starts the API server on port 3000
- ✅ Starts the React client on port 8080
- ✅ Creates log files for monitoring
- ✅ Provides real-time status updates

**Note:** For a clean install, run `./scripts/clean.sh` first to remove existing dependencies.

**Features:**
- Colored output for better readability
- Automatic port conflict resolution
- Process monitoring and logging
- Graceful error handling
- Background service management

### 🛑 `stop.sh` - Stop All Services

Stops all running services:

```bash
./scripts/stop.sh
```

**Options:**
```bash
./scripts/stop.sh --clean-logs    # Also removes log files
```

**What it does:**
- ✅ Gracefully stops all services
- ✅ Kills any remaining processes on ports 3000 and 8080
- ✅ Cleans up PID files
- ✅ Optionally removes log files

### 🧹 `clean.sh` - Clean Project Directory

Removes build artifacts and dependencies:

```bash
./scripts/clean.sh
```

**Options:**
```bash
./scripts/clean.sh --include-logs    # Also remove logs directory
./scripts/clean.sh --include-vscode  # Also remove .vscode/settings.json
./scripts/clean.sh --help            # Show help message
```

**What it removes:**
- ✅ `node_modules` directories
- ✅ `package-lock.json` files
- ✅ `dist` and `build` directories
- ✅ `coverage` directories
- ✅ `.cache` directories
- ✅ Temporary system files (.DS_Store, Thumbs.db)

### 📊 `status.sh` - Check Service Status

Check the status of all services:

```bash
./scripts/status.sh
```

**What it shows:**
- ✅ Service status (running/stopped)
- ✅ Process IDs and ports
- ✅ API endpoint health checks
- ✅ Log file locations
- ✅ Available commands

## Usage Examples

### Quick Start
```bash
# Start everything
./scripts/start.sh

# Check status
./scripts/status.sh

# Stop everything
./scripts/stop.sh
```

### Development Workflow
```bash
# Clean start (removes all dependencies and reinstalls)
./scripts/clean.sh
./scripts/start.sh

# Check if services are running
./scripts/status.sh

# Stop services when done
./scripts/stop.sh
```

### Troubleshooting
```bash
# Check what's running
./scripts/status.sh

# Force stop everything
./scripts/stop.sh

# Clean and restart
./scripts/clean.sh
./scripts/start.sh
```

## Log Files

When services are running, logs are created in the `logs/` directory:

- `logs/server.log` - API server logs
- `logs/client.log` - React development server logs
- `logs/server.pid` - Server process ID
- `logs/client.pid` - Client process ID

## Ports Used

- **3000** - API Server (Notes API)
- **8080** - React Client (Development Server)

## Requirements

- Node.js (v16 or higher)
- npm
- Bash shell
- `lsof` command (for port checking)

## Notes

- Scripts must be run from the project root directory
- All scripts include colored output for better readability
- Services run in the background and continue after script exit
- Use `Ctrl+C` to exit the start script (services keep running)
- Logs are automatically created and managed
