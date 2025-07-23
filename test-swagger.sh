#!/bin/bash

echo "🔗 Dynamic MongoDB CRUD API - Swagger Endpoints Demo"
echo "========================================================="

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api/dynamic"

echo ""
echo "📋 Available Swagger Endpoints:"
echo "• Swagger UI: $BASE_URL/swagger-ui/index.html"
echo "• OpenAPI JSON: $BASE_URL/v3/api-docs"
echo "• API Base URL: $API_URL"

echo ""
echo "🔍 Testing OpenAPI Documentation Endpoint..."
echo "GET $BASE_URL/v3/api-docs"
curl -s "$BASE_URL/v3/api-docs" | jq '.info' 2>/dev/null || echo "Response: OpenAPI spec available (jq not available for pretty print)"

echo ""
echo "🌐 Testing Swagger UI Availability..."
echo "GET $BASE_URL/swagger-ui/index.html"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/swagger-ui/index.html")
if [ "$response" = "200" ]; then
    echo "✅ Swagger UI is accessible"
else
    echo "❌ Swagger UI returned status: $response"
fi

echo ""
echo "📊 Testing API with Swagger Documentation..."
echo "GET $API_URL/schemas"
curl -s "$API_URL/schemas" | jq '.' 2>/dev/null || curl -s "$API_URL/schemas"

echo ""
echo "📱 Creating a test schema via documented API..."
echo "POST $API_URL/schemas"
curl -s -X POST "$API_URL/schemas" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "swagger_demo",
    "fields": [
      {
        "name": "title",
        "type": "STRING",
        "required": true,
        "validation": {"minLength": 3, "maxLength": 50}
      },
      {
        "name": "price",
        "type": "DOUBLE",
        "required": true,
        "validation": {"min": 0}
      },
      {
        "name": "active",
        "type": "BOOLEAN",
        "required": false,
        "defaultValue": true
      }
    ]
  }' | jq '.' 2>/dev/null || echo "Schema creation response (jq not available)"

echo ""
echo "📝 Creating a test document..."
echo "POST $API_URL/collections/swagger_demo/documents"
curl -s -X POST "$API_URL/collections/swagger_demo/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Swagger Demo Item",
    "price": 99.99,
    "active": true,
    "description": "Created via Swagger-documented API"
  }' | jq '.' 2>/dev/null || echo "Document creation response (jq not available)"

echo ""
echo "🎉 Swagger Integration Demo Complete!"
echo ""
echo "📖 Access the interactive API documentation at:"
echo "   🌐 $BASE_URL/swagger-ui/index.html"
echo ""
echo "💡 Features available in Swagger UI:"
echo "   • Interactive API testing"
echo "   • Request/Response examples"
echo "   • Schema validation"
echo "   • Authentication testing (if configured)"
echo "   • API endpoint documentation"
echo ""
echo "🔗 API Endpoints documented:"
echo "   • Schema Management (CRUD)"
echo "   • Document Management (CRUD)"
echo "   • Data Validation"
echo "   • Dynamic Collections"
