#!/bin/bash

# Dynamic MongoDB CRUD - Full Stack Startup Script
echo "🚀 Starting Dynamic MongoDB CRUD Full Stack Application"
echo "======================================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java 17 or later."
    exit 1
fi

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven not found. Please install Maven 3.8.5 or later."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16 or later."
    exit 1
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

echo "✅ All prerequisites found!"
echo ""

# Start MongoDB
echo "🐳 Starting MongoDB with Docker Compose..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ MongoDB started successfully!"
else
    echo "❌ Failed to start MongoDB!"
    exit 1
fi

# Wait for MongoDB
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Build backend
echo "🔨 Building backend application..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
else
    echo "❌ Backend build failed!"
    exit 1
fi

# Start backend in background
echo "🚀 Starting backend server..."
nohup java -jar target/dynamic-mongo-crud-1.0.0.jar > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Check if backend is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health | grep -q "200"; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend failed to start. Check backend.log for details."
    cat backend.log
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend

if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed!"
    else
        echo "❌ Failed to install frontend dependencies!"
        exit 1
    fi
else
    echo "✅ Frontend dependencies already installed!"
fi

# Start frontend in background
echo "🌐 Starting frontend server..."
npm start &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
echo "🎉 FULL STACK APPLICATION STARTED SUCCESSFULLY!"
echo "=============================================="
echo ""
echo "📱 FRONTEND (React + Material-UI):"
echo "   🌐 URL: http://localhost:3000"
echo "   📱 Features: Dynamic schema management, document CRUD, grid configuration"
echo ""
echo "🖥️  BACKEND (Spring Boot + MongoDB):"
echo "   🌐 API: http://localhost:8080/api/dynamic"
echo "   📚 Swagger UI: http://localhost:8080/swagger-ui/index.html"
echo "   ❤️  Health: http://localhost:8080/actuator/health"
echo ""
echo "🗄️  DATABASE:"
echo "   🐳 MongoDB: mongodb://localhost:27017/dynamic_db"
echo ""
echo "📊 FEATURES AVAILABLE:"
echo "   ✅ Create/Edit/Delete collection schemas"
echo "   ✅ Add/Edit/Delete documents with validation"
echo "   ✅ Configurable data grid display"
echo "   ✅ Field types: STRING, INTEGER, DOUBLE, BOOLEAN, DATE, OBJECT, ARRAY"
echo "   ✅ Validation rules: min/max length, patterns, ranges"
echo "   ✅ Interactive Swagger API documentation"
echo ""
echo "🏃‍♂️ LOGS:"
echo "   Backend: tail -f ../backend.log"
echo "   Frontend: Check the terminal output above"
echo ""
echo "🛑 TO STOP ALL SERVICES:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   docker-compose down"
echo ""
echo "🎯 Quick Start:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Create a new schema (e.g., 'products' with name, price, description fields)"
echo "   3. Add some documents to your collection"
echo "   4. Configure the grid display settings"
echo "   5. Explore the API documentation at http://localhost:8080/swagger-ui/index.html"
echo ""

# Keep the script running and show status
echo "📊 MONITORING STATUS (Press Ctrl+C to stop monitoring):"
echo "======================================================="

while true; do
    # Check backend health
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health | grep -q "200"; then
        BACKEND_STATUS="✅ Running"
    else
        BACKEND_STATUS="❌ Down"
    fi
    
    # Check frontend (simple port check)
    if lsof -i:3000 > /dev/null 2>&1; then
        FRONTEND_STATUS="✅ Running"
    else
        FRONTEND_STATUS="❌ Down"
    fi
    
    # Check MongoDB
    if docker ps | grep -q mongodb || docker ps | grep -q mongo; then
        MONGO_STATUS="✅ Running"
    else
        MONGO_STATUS="❌ Down"
    fi
    
    # Clear line and print status
    printf "\r🖥️  Backend: $BACKEND_STATUS | 🌐 Frontend: $FRONTEND_STATUS | 🗄️  MongoDB: $MONGO_STATUS | ⏰ $(date '+%H:%M:%S')"
    
    sleep 5
done
