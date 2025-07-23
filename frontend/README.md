# Dynamic MongoDB CRUD - Material UI Frontend

A powerful React Material-UI frontend application for managing dynamic MongoDB collections with full CRUD operations, configurable data grids, and comprehensive validation.

## 🌟 Features

### 📊 **Schema Management**
- ✅ **Visual Schema Builder** - Create collection schemas with drag-and-drop simplicity
- ✅ **Field Types** - Support for STRING, INTEGER, DOUBLE, BOOLEAN, DATE, ARRAY, OBJECT
- ✅ **Validation Rules** - Configure min/max length, patterns, ranges, and custom validation
- ✅ **Schema Editing** - Modify existing schemas with live preview
- ✅ **Schema Templates** - Quick start with pre-built schema templates

### 📝 **Document Management**
- ✅ **Smart Forms** - Auto-generated forms based on schema definitions
- ✅ **Data Validation** - Real-time validation with user-friendly error messages
- ✅ **Rich Data Types** - Date pickers, JSON editors, boolean toggles
- ✅ **Bulk Operations** - Import/export documents, batch updates
- ✅ **Search & Filter** - Advanced search capabilities across all fields

### 📋 **Configurable Data Grid**
- ✅ **Column Configuration** - Customize width, labels, visibility, sorting
- ✅ **Field Display Options** - Control how different data types are displayed
- ✅ **Persistent Settings** - Grid configurations saved per collection
- ✅ **Export Data** - Export to CSV, JSON, Excel formats
- ✅ **Pagination** - Efficient handling of large datasets

### 🎨 **Modern UI/UX**
- ✅ **Material-UI Design** - Clean, professional interface
- ✅ **Responsive Layout** - Works on desktop, tablet, and mobile
- ✅ **Dark/Light Theme** - User preference support
- ✅ **Loading States** - Smooth user experience with progress indicators
- ✅ **Error Handling** - Comprehensive error messages and recovery options

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package manager
- **Backend API** - Dynamic MongoDB CRUD API running on port 8080

### Option 1: Automatic Full-Stack Setup (Recommended)
```bash
# From project root directory
./start-fullstack.sh
```

### Option 2: Frontend Only
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Or use the script
./start-frontend.sh
```

### Option 3: Manual Setup
```bash
# Install dependencies
npm install

# Start with backend proxy
REACT_APP_API_URL=http://localhost:8080/api/dynamic npm start

# Or start with custom API URL
REACT_APP_API_URL=https://your-api-server.com/api/dynamic npm start
```

## 🌐 Application URLs

Once started, the application will be available at:

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/dynamic
- **Swagger Documentation**: http://localhost:8080/swagger-ui/index.html

## 📖 Usage Guide

### 1. Creating Your First Schema

1. **Open the Application**: Navigate to http://localhost:3000
2. **Create Schema**: Click "Create Schema" button
3. **Configure Collection**:
   - Enter collection name (e.g., "products")
   - Add fields with appropriate types
   - Set validation rules
   - Configure required fields

**Example Schema - Product Catalog**:
```json
{
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
      "required": false
    },
    {
      "name": "inStock",
      "type": "BOOLEAN",
      "required": true,
      "defaultValue": true
    },
    {
      "name": "createdAt",
      "type": "DATE",
      "required": true
    }
  ]
}
```

### 2. Managing Documents

1. **Select Collection**: Click "Manage Documents" on any schema card
2. **Add Document**: Click "Add Document" and fill the auto-generated form
3. **Edit Document**: Click the edit icon in the grid
4. **Delete Document**: Click the delete icon and confirm
5. **Configure Grid**: Click the settings icon to customize column display

### 3. Grid Configuration

1. **Open Settings**: Click the gear icon in the document management view
2. **Customize Columns**:
   - Show/hide columns
   - Adjust column widths
   - Change display labels
   - Enable/disable sorting and filtering
3. **Save Configuration**: Settings are automatically saved per collection

### 4. Field Types & Validation

| Field Type | Input Component | Validation Options |
|------------|-----------------|-------------------|
| STRING | Text Field | minLength, maxLength, pattern |
| INTEGER | Number Input | min, max |
| DOUBLE | Number Input | min, max |
| BOOLEAN | Checkbox | None |
| DATE | Date Picker | min, max dates |
| ARRAY | JSON Editor | minItems, maxItems |
| OBJECT | JSON Editor | None |

## 🛠️ Development

### Project Structure
```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable React components
│   │   ├── SchemaDialog.js       # Schema creation/editing
│   │   ├── DocumentDialog.js     # Document creation/editing
│   │   └── GridConfigDialog.js   # Grid configuration
│   ├── pages/           # Main application pages
│   │   ├── SchemaManagement.js   # Schema list and management
│   │   └── DocumentManagement.js # Document CRUD and grid
│   ├── services/        # API communication
│   │   └── api.js       # API endpoints and utilities
│   ├── utils/           # Utility functions
│   │   └── helpers.js   # Form validation, data formatting
│   ├── App.js           # Main application component
│   └── index.js         # Application entry point
├── package.json         # Dependencies and scripts
└── start-frontend.sh    # Startup script
```

### Key Dependencies
- **React 18** - Modern React with hooks
- **Material-UI v5** - Component library and theming
- **MUI X Data Grid** - Advanced data grid with pagination
- **MUI X Date Pickers** - Date/time input components
- **Axios** - HTTP client for API communication
- **React Hook Form** - Form management and validation
- **Notistack** - Toast notifications
- **Day.js** - Date manipulation and formatting

### Custom Hooks & Utilities

The application includes several utility functions:

- **Field Validation**: Real-time validation based on schema rules
- **Data Formatting**: Smart formatting for different data types
- **Grid Column Generation**: Dynamic column configuration
- **Form Helpers**: Convert between API and form data formats

### API Integration

The frontend communicates with the Spring Boot backend through a comprehensive API service:

```javascript
// Get all schemas
const schemas = await schemaApi.getAllSchemas();

// Create new document
const document = await documentApi.createDocument(collectionName, data);

// Update grid configuration
localStorage.setItem(`gridConfig_${collection}`, JSON.stringify(config));
```

## 🎨 Customization

### Theming

The application uses Material-UI's theming system. To customize:

```javascript
// src/App.js
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-primary-color',
    },
    secondary: {
      main: '#your-secondary-color',
    },
  },
});
```

### Grid Display

Grid configurations are stored in localStorage and can be customized:

```javascript
const gridConfig = {
  fieldName: {
    hidden: false,
    width: 150,
    label: 'Custom Label',
    sortable: true,
    filterable: true
  }
};
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8080/api/dynamic` |
| `PORT` | Frontend development server port | `3000` |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Building for Production

```bash
# Create production build
npm run build

# Serve production build locally
npx serve -s build
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build"]
```

### Environment Configuration
```bash
# Production environment
REACT_APP_API_URL=https://your-api-domain.com/api/dynamic
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**1. API Connection Failed**
- Ensure backend is running on port 8080
- Check CORS configuration in backend
- Verify network connectivity

**2. Frontend Won't Start**
- Check Node.js version (16+ required)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 3000 availability

**3. Grid Not Displaying Data**
- Verify schema has been created
- Check browser console for API errors
- Ensure documents exist in collection

**4. Form Validation Issues**
- Check schema field definitions
- Verify validation rules are properly configured
- Look for JavaScript console errors

### Performance Tips

- Use pagination for large datasets
- Configure grid to show only necessary columns
- Implement search/filtering to reduce data load
- Use React DevTools to identify performance bottlenecks

## 📞 Support

For issues and questions:
1. Check the [troubleshooting](#-troubleshooting) section
2. Review backend API documentation at `/swagger-ui/index.html`
3. Look at existing issues in the repository
4. Create a new issue with detailed information

---

**Happy Coding! 🎉**
