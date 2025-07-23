# Dynamic MongoDB CRUD System

A powerful Java Spring Boot application that creates dynamic MongoDB collections with full CRUD operations based on runtime schema definitions.

## 🚀 Features

### 🖥️ **Backend (Spring Boot + MongoDB)**
- ✅ **Dynamic Collection Creation** - Create MongoDB collections at runtime
- ✅ **Schema Validation** - Comprehensive data validation with custom rules
- ✅ **Field Types** - Support for STRING, INTEGER, DOUBLE, BOOLEAN, DATE, ARRAY, OBJECT
- ✅ **CRUD Operations** - Complete Create, Read, Update, Delete functionality
- ✅ **REST API** - RESTful endpoints for all operations
- ✅ **Swagger Documentation** - Interactive API documentation and testing
- ✅ **Security Ready** - Built-in security configuration with CORS support
- ✅ **Caching** - Performance optimization with Caffeine cache
- ✅ **Monitoring** - Health checks and metrics via Spring Actuator
- ✅ **Testing** - Comprehensive test suite with TestContainers
- ✅ **Docker Support** - Complete Docker containerization

### 🎨 **Frontend (React + Material-UI)**
- ✅ **Visual Schema Builder** - Create and edit schemas with intuitive UI
- ✅ **Dynamic Forms** - Auto-generated forms based on schema definitions
- ✅ **Configurable Data Grid** - Customize column display, sorting, and filtering
- ✅ **Real-time Validation** - Client-side validation with user-friendly messages
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ✅ **Material-UI Components** - Modern, professional interface
- ✅ **Rich Data Types** - Date pickers, JSON editors, boolean toggles
- ✅ **Grid Customization** - Save column configurations per collection
- ✅ **Export Capabilities** - Export data in various formats
- ✅ **Error Handling** - Comprehensive error messages and recovery

## 📋 Prerequisites

### Backend Requirements
- **Java 17+** - [Download here](https://adoptium.net/)
- **Maven 3.6+** - [Download here](https://maven.apache.org/download.cgi)
- **MongoDB 4.4+** - [Download here](https://www.mongodb.com/try/download/community) or use Docker

### Frontend Requirements (Optional)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package manager (comes with Node.js)

## 🏃 Quick Start

### Option 1: Full Stack with UI (Recommended)
```bash
# Start both backend API and React UI
./start-fullstack.sh
```
This will start:
- MongoDB (Docker)
- Spring Boot API (port 8080)
- React Material-UI frontend (port 3000)

### Option 2: Backend Only (API Server)
```bash
# Run the automated backend startup script
./run.sh
```

### Option 3: Frontend Only (UI Development)
```bash
# Start just the React frontend (requires backend running)
cd frontend
./start-frontend.sh
```

### Option 4: Manual Setup
```bash
# 1. Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# 2. Build and run backend
mvn clean install
mvn spring-boot:run

# 3. Start frontend (in new terminal)
cd frontend
npm install
npm start
```

### Option 5: Docker Compose
```bash
# Start all services (MongoDB + Backend API)
docker-compose up -d
```

## 🔌 Application URLs

### Full Stack (UI + API)
- **Material-UI Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/dynamic
- **Interactive API Docs**: http://localhost:8080/swagger-ui/index.html
- **Health Check**: http://localhost:8080/actuator/health
- **MongoDB**: mongodb://localhost:27017/dynamic_db

### API Endpoints (Backend Only)

#### Schema Management
- `POST /api/dynamic/schemas` - Create a new schema
- `GET /api/dynamic/schemas` - Get all schemas
- `GET /api/dynamic/schemas/{name}` - Get specific schema
- `PUT /api/dynamic/schemas/{name}` - Update schema
- `DELETE /api/dynamic/schemas/{name}` - Delete schema

#### Document Operations
- `POST /api/dynamic/collections/{name}/documents` - Create document
- `GET /api/dynamic/collections/{name}/documents` - Get all documents
- `GET /api/dynamic/collections/{name}/documents/{id}` - Get specific document
- `PUT /api/dynamic/collections/{name}/documents/{id}` - Update document
- `DELETE /api/dynamic/collections/{name}/documents/{id}` - Delete document

## 📖 Usage Examples

### 🎨 Using the Material-UI Frontend

1. **Open the Application**: Navigate to http://localhost:3000
2. **Create Your First Schema**:
   - Click "Create Schema"
   - Enter collection name: "users"
   - Add fields with validation rules
   - Save the schema

3. **Manage Documents**:
   - Click "Manage Documents" on the schema card
   - Add new documents with the auto-generated form
   - Edit existing documents inline
   - Configure grid column display

4. **Customize Grid Display**:
   - Click the settings icon in document view
   - Adjust column widths, labels, and visibility
   - Enable/disable sorting and filtering
   - Configuration is saved automatically

### 🔧 Using the REST API Directly

#### 1. Create a Schema
```bash
curl -X POST http://localhost:8080/api/dynamic/schemas \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "users",
    "fields": [
      {
        "name": "name",
        "type": "STRING",
        "required": true,
        "validation": {
          "minLength": 2,
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
          "min": 0,
          "max": 150
        }
      }
    ]
  }'
```

#### 2. Create a Document
```bash
curl -X POST http://localhost:8080/api/dynamic/collections/users/documents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

#### 3. Get All Documents
```bash
curl http://localhost:8080/api/dynamic/collections/users/documents
```

## 🧪 Testing

### Backend Testing
```bash
# Run unit tests
mvn test

# Test the API endpoints
./test-api.sh

# Test Swagger integration
./test-swagger.sh
```

### Frontend Testing
```bash
# Navigate to frontend directory
cd frontend

# Run React tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Manual Testing
After starting the full stack application:
- **Frontend UI**: http://localhost:3000
- **Backend Health**: http://localhost:8080/actuator/health
- **API Documentation**: http://localhost:8080/swagger-ui/index.html
- **All Schemas**: http://localhost:8080/api/dynamic/schemas

## 🗂️ Project Structure

```
dynamic-mongo-crud/
├── frontend/                    # React Material-UI Frontend
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── SchemaDialog.js          # Schema creation/editing
│   │   │   ├── DocumentDialog.js        # Document creation/editing
│   │   │   └── GridConfigDialog.js      # Grid configuration
│   │   ├── pages/               # Main application pages
│   │   │   ├── SchemaManagement.js      # Schema list and management
│   │   │   └── DocumentManagement.js    # Document CRUD and grid
│   │   ├── services/            # API communication
│   │   │   └── api.js           # API endpoints and utilities
│   │   ├── utils/               # Utility functions
│   │   │   └── helpers.js       # Form validation, data formatting
│   │   ├── App.js               # Main application component
│   │   └── index.js             # Application entry point
│   ├── package.json             # Frontend dependencies
│   ├── start-frontend.sh        # Frontend startup script
│   └── README.md                # Frontend documentation
├── src/
│   └── main/
│       ├── java/com/dynamicmongo/
│       │   ├── config/          # Configuration classes
│       │   │   ├── MongoConfig.java     # MongoDB configuration
│       │   │   ├── SecurityConfig.java  # Security & CORS config
│       │   │   └── SwaggerConfig.java   # API documentation config
│       │   ├── controller/      # REST controllers
│       │   │   └── DynamicCrudController.java
│       │   ├── model/           # Data models
│       │   │   ├── CollectionSchema.java
│       │   │   ├── FieldDefinition.java
│       │   │   └── DynamicDocument.java
│       │   ├── repository/      # MongoDB repositories
│       │   │   └── CollectionSchemaRepository.java
│       │   ├── service/         # Business logic
│       │   │   ├── DynamicCrudService.java
│       │   │   └── DataValidationService.java
│       │   └── examples/        # Demo examples
│       │       └── QuickStartExample.java
│       └── resources/
│           └── application.yml  # Application configuration
├── docker-compose.yml           # Docker services configuration
├── start-fullstack.sh          # Full stack startup script
├── run.sh                      # Backend-only startup script
├── quick-start.sh              # Quick backend startup with docs
├── test-api.sh                 # API testing script
├── test-swagger.sh             # Swagger integration test
├── SWAGGER_INTEGRATION.md      # Swagger documentation
└── README.md                   # Main project documentation
```

## ⚙️ Configuration

### Backend Configuration (application.yml)
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/dynamic_db
      database: dynamic_db

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
    tagsSorter: alpha
```

### Frontend Configuration
```javascript
// Environment variables
REACT_APP_API_URL=http://localhost:8080/api/dynamic  // Backend API URL
PORT=3000                                            // Frontend port
```

### Application Ports
- **Frontend**: `3000`
- **Backend API**: `8080`
- **MongoDB**: `27017`
- **Kafka (optional)**: `9092`

## 🔧 Advanced Features (Extensible)

The system is designed to be easily extended with:
- Extended field types (REFERENCE, ENUM, CALCULATED)
- Role-based access control
- Audit trails
- Real-time notifications
- Data import/export
- Advanced querying
- Workflow engines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests: `mvn test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Build Issues
```bash
# Clean and rebuild
mvn clean install -U

# Skip tests if needed
mvn clean install -DskipTests
```

## 📞 Support

For issues and questions:
1. Check the [troubleshooting](#-troubleshooting) section
2. Look at existing issues in the repository
3. Create a new issue with detailed information

---

**Happy Coding! 🎉**
