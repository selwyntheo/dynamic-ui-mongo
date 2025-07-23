#!/bin/bash

# Dynamic MongoDB CRUD - UI Demo Script
echo "🎨 Dynamic MongoDB CRUD - Material UI Demo"
echo "=========================================="

# Check if backend is running
echo "🔍 Checking if backend is running..."
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health | grep -q "200"; then
    echo "❌ Backend is not running. Please start it first:"
    echo "   ./run.sh"
    echo ""
    echo "🚀 Or start the full stack:"
    echo "   ./start-fullstack.sh"
    exit 1
fi

echo "✅ Backend is running!"

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install
    cd ..
fi

echo ""
echo "🎯 DEMO SCENARIO: E-commerce Product Catalog"
echo "============================================"

# Create a sample schema
echo "📝 Creating 'products' schema with validation rules..."

curl -s -X POST http://localhost:8080/api/dynamic/schemas \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "products",
    "fields": [
      {
        "name": "name",
        "type": "STRING",
        "required": true,
        "validation": {
          "minLength": 2,
          "maxLength": 100
        }
      },
      {
        "name": "price",
        "type": "DOUBLE",
        "required": true,
        "validation": {
          "min": 0
        }
      },
      {
        "name": "category",
        "type": "STRING",
        "required": true,
        "validation": {
          "minLength": 1,
          "maxLength": 50
        }
      },
      {
        "name": "inStock",
        "type": "BOOLEAN",
        "required": true,
        "defaultValue": true
      },
      {
        "name": "description",
        "type": "STRING",
        "required": false,
        "validation": {
          "maxLength": 500
        }
      },
      {
        "name": "tags",
        "type": "ARRAY",
        "required": false,
        "validation": {
          "maxItems": 10
        }
      },
      {
        "name": "launchDate",
        "type": "DATE",
        "required": false
      }
    ]
  }' > /dev/null

echo "✅ Products schema created!"

# Create sample documents
echo "🛍️  Adding sample products..."

# Product 1
curl -s -X POST http://localhost:8080/api/dynamic/collections/products/documents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro 16\"",
    "price": 2499.99,
    "category": "Electronics",
    "inStock": true,
    "description": "Apple MacBook Pro with M3 Pro chip, 16-inch display",
    "tags": ["laptop", "apple", "professional", "m3"],
    "launchDate": "2023-10-30T00:00:00Z"
  }' > /dev/null

# Product 2  
curl -s -X POST http://localhost:8080/api/dynamic/collections/products/documents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "price": 79.99,
    "category": "Accessories",
    "inStock": true,
    "description": "Ergonomic wireless mouse with precision tracking",
    "tags": ["mouse", "wireless", "ergonomic"],
    "launchDate": "2023-05-15T00:00:00Z"
  }' > /dev/null

# Product 3
curl -s -X POST http://localhost:8080/api/dynamic/collections/products/documents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Chair",
    "price": 349.99,
    "category": "Furniture",
    "inStock": false,
    "description": "Premium gaming chair with RGB lighting and lumbar support",
    "tags": ["chair", "gaming", "rgb", "ergonomic"],
    "launchDate": "2023-08-20T00:00:00Z"
  }' > /dev/null

echo "✅ Sample products added!"

# Create a user schema for demonstration
echo "👥 Creating 'users' schema..."

curl -s -X POST http://localhost:8080/api/dynamic/schemas \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "users",
    "fields": [
      {
        "name": "firstName",
        "type": "STRING",
        "required": true,
        "validation": {
          "minLength": 1,
          "maxLength": 50
        }
      },
      {
        "name": "lastName",
        "type": "STRING",
        "required": true,
        "validation": {
          "minLength": 1,
          "maxLength": 50
        }
      },
      {
        "name": "email",
        "type": "STRING",
        "required": true,
        "validation": {
          "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
        }
      },
      {
        "name": "age",
        "type": "INTEGER",
        "required": false,
        "validation": {
          "min": 13,
          "max": 120
        }
      },
      {
        "name": "isActive",
        "type": "BOOLEAN",
        "required": true,
        "defaultValue": true
      },
      {
        "name": "registrationDate",
        "type": "DATE",
        "required": true
      },
      {
        "name": "preferences",
        "type": "OBJECT",
        "required": false
      }
    ]
  }' > /dev/null

echo "✅ Users schema created!"

# Add sample users
echo "👤 Adding sample users..."

curl -s -X POST http://localhost:8080/api/dynamic/collections/users/documents \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "age": 28,
    "isActive": true,
    "registrationDate": "2023-01-15T10:30:00Z",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true
    }
  }' > /dev/null

curl -s -X POST http://localhost:8080/api/dynamic/collections/users/documents \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "age": 34,
    "isActive": true,
    "registrationDate": "2023-03-22T14:45:00Z",
    "preferences": {
      "theme": "light",
      "language": "en",
      "notifications": false
    }
  }' > /dev/null

echo "✅ Sample users added!"

echo ""
echo "🎉 DEMO DATA READY!"
echo "=================="
echo ""
echo "📊 Created Collections:"
echo "   📦 products (7 fields) - 3 sample items"
echo "   👥 users (7 fields) - 2 sample items"
echo ""
echo "🌐 Open the UI to explore:"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8080/swagger-ui/index.html"
echo ""
echo "🎯 Things to try in the UI:"
echo "   1. View both schemas in the main dashboard"
echo "   2. Click 'Manage Documents' on the products collection"
echo "   3. Add a new product using the auto-generated form"
echo "   4. Edit an existing product"
echo "   5. Configure the grid display (click gear icon)"
echo "   6. Customize column widths, labels, and visibility"
echo "   7. Try adding invalid data to see validation in action"
echo "   8. Switch to the users collection and explore"
echo ""
echo "🚀 Starting frontend development server..."
echo "   (This will open http://localhost:3000 in your browser)"
echo ""

# Start the frontend
cd frontend
npm start
