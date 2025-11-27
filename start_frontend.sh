#!/bin/bash

# Navigate to the frontend directory
cd "$(dirname "$0")"

# Check if node_modules exists, install if it doesn't
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Function to detect backend port
detect_backend_port() {
  # Get the project root directory (parent of moments-frontend)
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
  CONFIG_FILE="$PROJECT_ROOT/.backend-port"
  
  # First, try to read from config file
  if [ -f "$CONFIG_FILE" ]; then
    DETECTED_PORT=$(cat "$CONFIG_FILE" 2>/dev/null | tr -d '[:space:]')
    if [ -n "$DETECTED_PORT" ] && [[ "$DETECTED_PORT" =~ ^[0-9]+$ ]]; then
      echo "Detected backend port from config file: $DETECTED_PORT" >&2
      echo "$DETECTED_PORT"
      return 0
    fi
  fi
  
  # Second, try to auto-detect by checking for running uvicorn processes
  # Check common ports: 7005, 8000, 8080, 5000
  for port in 7005 8000 8080 5000; do
    if lsof -ti:$port >/dev/null 2>&1; then
      # Check if it's a uvicorn/python process (likely our backend)
      PID=$(lsof -ti:$port 2>/dev/null | head -1)
      if [ -n "$PID" ] && ps -p "$PID" -o comm= 2>/dev/null | grep -qE "(python|uvicorn)"; then
        echo "Auto-detected backend port: $port" >&2
        echo "$port"
        return 0
      fi
    fi
  done
  
  # Fallback to default
  echo "7005"
}

# Parse command line arguments for ports
FRONTEND_PORT=3005
BACKEND_PORT_FROM_CMD=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --port|-p)
            if [ -z "$2" ]; then
                echo "Error: --port requires a port number"
                echo "Usage: $0 [--port|-p FRONTEND_PORT] [--backend-port|-b BACKEND_PORT]"
                exit 1
            fi
            FRONTEND_PORT="$2"
            shift 2
            ;;
        --backend-port|-b)
            if [ -z "$2" ]; then
                echo "Error: --backend-port requires a port number"
                echo "Usage: $0 [--port|-p FRONTEND_PORT] [--backend-port|-b BACKEND_PORT]"
                exit 1
            fi
            BACKEND_PORT_FROM_CMD="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--port|-p FRONTEND_PORT] [--backend-port|-b BACKEND_PORT]"
            exit 1
            ;;
    esac
done

# Set backend port: command line > environment variable > auto-detect > default
if [ -n "$BACKEND_PORT_FROM_CMD" ]; then
    # Use command line argument (highest priority)
    BACKEND_PORT="$BACKEND_PORT_FROM_CMD"
elif [ -n "${BACKEND_PORT:-}" ]; then
    # Use environment variable if set (from parent shell or backend script)
    BACKEND_PORT="${BACKEND_PORT}"
else
    # Auto-detect from config file or running processes
    BACKEND_PORT=$(detect_backend_port)
fi

# Export environment variables
export FRONTEND_PORT
export BACKEND_PORT
export REACT_APP_API_URL="http://localhost:${BACKEND_PORT}/api"
export REACT_APP_BACKEND_PORT="${BACKEND_PORT}"

# Inject backend port into index.html for runtime access
# This creates a script tag that sets window.REACT_APP_BACKEND_PORT
if [ -f "public/index.html" ]; then
  # Remove any existing backend port script tag
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS uses BSD sed
    sed -i '' '/window\.REACT_APP_BACKEND_PORT/d' public/index.html 2>/dev/null || true
    # Add the script tag before closing </head>
    sed -i '' "s|</head>|<script>window.REACT_APP_BACKEND_PORT = \"${BACKEND_PORT}\";</script></head>|" public/index.html 2>/dev/null || true
  else
    # Linux uses GNU sed
    sed -i '/window\.REACT_APP_BACKEND_PORT/d' public/index.html 2>/dev/null || true
    sed -i "s|</head>|<script>window.REACT_APP_BACKEND_PORT = \"${BACKEND_PORT}\";</script></head>|" public/index.html 2>/dev/null || true
  fi
fi

# Set port and start the development server
echo "Starting React development server on port ${FRONTEND_PORT}..."
echo "Frontend will be available at http://localhost:${FRONTEND_PORT}"
echo "Backend API URL: ${REACT_APP_API_URL}"
echo "FRONTEND_PORT=${FRONTEND_PORT} exported"
echo "BACKEND_PORT=${BACKEND_PORT} exported"
echo "REACT_APP_API_URL=${REACT_APP_API_URL} exported"
echo "REACT_APP_BACKEND_PORT=${REACT_APP_BACKEND_PORT} exported"
echo ""
PORT=${FRONTEND_PORT} npm start




