#!/usr/bin/env bash
# Resume server launcher
# Usage: ./show_resume.sh [--test]

set -e

cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Install Playwright browsers if needed (for tests or puppeteer fallback)
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo "Installing Playwright browsers..."
    npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium
fi

# Run tests if --test flag passed
if [ "$1" = "--test" ]; then
    echo "Running tests..."
    npm test
    exit $?
fi

# Launch the server
node server.js
