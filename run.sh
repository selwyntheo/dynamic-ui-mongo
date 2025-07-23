#!/bin/bash

echo "🚀 Starting Dynamic MongoDB CRUD System..."

# Check if Java 17+ is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

java_version=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | awk -F '.' '{print $1}')
if [ "$java_version" -lt 17 ]; then
    echo "❌ Java 17 or higher is required. Current version: $java_version"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    exit 1
fi

echo "✅ Java version: $(java -version 2>&1 | head -n 1)"
echo "✅ Maven version: $(mvn -version | head -n 1)"

# Start MongoDB if not running
if ! pgrep -x "mongod" > /dev/null && ! nc -z localhost 27017; then
    echo "🔄 Starting MongoDB with Docker..."
    if command -v docker &> /dev/null; then
        docker run -d -p 27017:27017 --name dynamic-mongodb mongo:6.0 || {
            echo "⚠️ Failed to start MongoDB with Docker. Please start MongoDB manually."
        }
        echo "✅ MongoDB started with Docker"
        sleep 5
    else
        echo "⚠️ Docker not found. Please start MongoDB manually on port 27017"
        echo "   You can download MongoDB from: https://www.mongodb.com/try/download/community"
    fi
else
    echo "✅ MongoDB is already running"
fi

# Build the application
echo "🔨 Building application..."
mvn clean install -DskipTests || {
    echo "❌ Build failed"
    exit 1
}

echo "✅ Build successful"

# Run the application
echo "🏃 Starting application..."
echo "📱 The application will be available at: http://localhost:8080"
echo "🔍 Health check: http://localhost:8080/actuator/health"
echo "📊 API docs: http://localhost:8080/api/dynamic/schemas"
echo ""
echo "To run with demo data: mvn spring-boot:run -Dspring-boot.run.arguments=demo"
echo ""

mvn spring-boot:run
