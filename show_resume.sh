#!/usr/bin/env bash
# Resume server launcher
# Usage: ./show_resume.sh

set -e

cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Launch the server
node server.js
