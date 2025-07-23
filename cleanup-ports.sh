#!/bin/bash

# Port cleanup and application restart script
echo "🔧 Cleaning up ports and restarting applications"
echo "==============================================="

# Function to kill processes on a specific port
cleanup_port() {
    local port=$1
    local service_name=$2
    
    echo "🔍 Checking port $port for $service_name..."
    
    if lsof -i :$port >/dev/null 2>&1; then
        echo "🛑 Stopping existing process on port $port..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 3
        
        # Verify port is free
        if lsof -i :$port >/dev/null 2>&1; then
            echo "❌ Failed to free port $port"
            return 1
        else
            echo "✅ Port $port is now free"
            return 0
        fi
    else
        echo "✅ Port $port is already free"
        return 0
    fi
}

# Clean up both ports
cleanup_port 8080 "Backend (Spring Boot)"
cleanup_port 3000 "Frontend (React)"

echo ""
echo "🚀 Now you can start the applications:"
echo "   ./start-fullstack.sh    # Start both frontend and backend"
echo "   ./run.sh               # Start backend only"  
echo "   ./demo-ui.sh           # Start with demo data"
echo ""
