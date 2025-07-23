#!/bin/bash

# Dynamic MongoDB CRUD - Quick Start with Swagger
echo "🚀 Starting Dynamic MongoDB CRUD Application with Swagger Documentation"
echo "=================================================================="

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

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Start MongoDB with Docker Compose
echo "🐳 Starting MongoDB..."
docker-compose up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Build the project
echo "🔨 Building the project..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Start the application in background
echo "🚀 Starting application..."
nohup java -jar target/dynamic-mongo-crud-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
APP_PID=$!

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if application is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health | grep -q "200"; then
    echo "✅ Application is running!"
    echo ""
    echo "📚 SWAGGER DOCUMENTATION AVAILABLE:"
    echo "   🌐 Swagger UI: http://localhost:8080/swagger-ui/index.html"
    echo "   📋 OpenAPI JSON: http://localhost:8080/v3/api-docs"
    echo ""
    echo "🔗 API ENDPOINTS:"
    echo "   📊 Schema Management: http://localhost:8080/api/dynamic/schemas"
    echo "   📄 Document Operations: http://localhost:8080/api/dynamic/collections/{collection}/documents"
    echo ""
    echo "🧪 QUICK API TEST:"
    echo "   Create Schema: POST /api/dynamic/schemas"
    echo "   List Schemas: GET /api/dynamic/schemas"
    echo "   Add Document: POST /api/dynamic/collections/{collection}/documents"
    echo ""
    echo "🏃‍♂️ APPLICATION LOGS:"
    echo "   tail -f app.log"
    echo ""
    echo "🛑 TO STOP:"
    echo "   kill $APP_PID"
    echo "   docker-compose down"
    echo ""
    echo "=================================================================="
    echo "🎉 Ready! Open http://localhost:8080/swagger-ui/index.html to start exploring!"
else
    echo "❌ Application failed to start. Check app.log for details."
    cat app.log
    exit 1
fi
