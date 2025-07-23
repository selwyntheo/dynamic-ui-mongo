#!/bin/bash

# Dynamic MongoDB CRUD - Frontend Startup Script
echo "🚀 Starting Dynamic MongoDB CRUD Frontend"
echo "=========================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16 or later."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm found"

# Navigate to frontend directory
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run from the frontend directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully!"
    else
        echo "❌ Failed to install dependencies!"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

# Check if backend is running
echo "🔍 Checking backend connection..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health | grep -q "200"; then
    echo "✅ Backend is running!"
else
    echo "⚠️  Backend is not running. Starting frontend anyway..."
    echo "   Please start the backend server:"
    echo "   cd ../.. && ./run.sh"
fi

echo ""
echo "🌐 Starting React development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Backend API should be at: http://localhost:8080"
echo ""
echo "🛑 To stop the server, press Ctrl+C"
echo ""

# Start the React development server
npm start
