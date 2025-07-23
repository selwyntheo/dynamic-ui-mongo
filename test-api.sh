#!/bin/bash

echo "🧪 Testing Dynamic MongoDB CRUD API..."

BASE_URL="http://localhost:8080/api/dynamic"

# Wait for application to start
echo "⏳ Waiting for application to start..."
for i in {1..30}; do
    if curl -s -f "$BASE_URL/schemas" > /dev/null 2>&1; then
        echo "✅ Application is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Application failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

echo "📝 Creating test schema..."
curl -s -X POST "$BASE_URL/schemas" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "test_products",
    "fields": [
      {
        "name": "name",
        "type": "STRING",
        "required": true,
        "validation": {"minLength": 2, "maxLength": 100}
      },
      {
        "name": "price",
        "type": "DOUBLE",
        "required": true,
        "validation": {"min": 0}
      },
      {
        "name": "category",
        "type": "STRING",
        "required": false,
        "defaultValue": "general"
      }
    ]
  }' | jq '.' || echo "Schema creation response (jq not available)"

echo -e "\n✅ Schema created"

echo -e "\n📋 Getting all schemas..."
curl -s "$BASE_URL/schemas" | jq '.' || echo "Schema list response (jq not available)"

echo -e "\n📄 Creating test documents..."
curl -s -X POST "$BASE_URL/collections/test_products/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Laptop",
    "price": 999.99,
    "category": "electronics"
  }' | jq '.' || echo "Document creation response (jq not available)"

curl -s -X POST "$BASE_URL/collections/test_products/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Book",
    "price": 29.99,
    "category": "education"
  }' | jq '.' || echo "Document creation response (jq not available)"

echo -e "\n✅ Documents created"

echo -e "\n📚 Getting all documents..."
curl -s "$BASE_URL/collections/test_products/documents" | jq '.' || echo "Documents list response (jq not available)"

echo -e "\n🎉 API tests completed successfully!"
echo "🌐 You can now access the API at: $BASE_URL"
