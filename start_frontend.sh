#!/bin/bash

# Navigate to the frontend directory
cd "$(dirname "$0")"

# Check if node_modules exists, install if it doesn't
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Set port and start the development server
echo "Starting React development server on port 3005..."
echo "Frontend will be available at http://localhost:3005"
echo ""
PORT=3005 npm start




