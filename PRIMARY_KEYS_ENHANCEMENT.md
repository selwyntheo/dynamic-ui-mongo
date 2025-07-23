# Primary Keys and Collection Validation Enhancement

## Overview
This document outlines the new features added to the Dynamic MongoDB CRUD system, specifically:
1. Primary key support for collection fields
2. Collection existence validation before creation
3. Dynamic UI forms based on collection schemas

## New Features

### 1. Primary Key Support

#### Backend Changes
- **FieldDefinition Model**: Added `primaryKey` boolean property
- **CollectionSchema Model**: Added helper methods to get primary key fields and check if collection has primary keys
- **Validation**: Ensures only one field can be marked as primary key per collection

#### Frontend Changes
- **Schema Dialog**: Added primary key checkbox in field configuration
- **File Upload Dialog**: Added primary key support for Excel/CSV imports
- **Dynamic Form**: Primary key fields are read-only in edit mode and clearly marked with "PK" chips
- **Validation**: Prevents multiple primary keys and automatically makes primary key fields required

### 2. Collection Existence Checking

#### Backend API
- **New Endpoint**: `GET /api/dynamic/schemas/{collectionName}/exists`
- **Response**: `{"exists": true/false, "collectionName": "..."}`
- **Purpose**: Check if a collection schema already exists before creation

#### Frontend Integration
- **Schema Creation**: Validates collection name uniqueness during form submission
- **Error Handling**: Shows clear error message if collection name already exists
- **Real-time Validation**: Checks existence before allowing schema creation

### 3. Dynamic UI Based on Collection Schema

#### New Component: DynamicFormDialog
- **Purpose**: Generates forms dynamically based on collection field definitions
- **Field Types Supported**:
  - STRING: Text input with validation
  - INTEGER: Number input (integers only)
  - DOUBLE: Number input (decimals allowed)
  - BOOLEAN: Checkbox
  - DATE: Date picker with calendar UI
  - OBJECT/ARRAY: Text input (JSON format)

#### Features
- **Primary Key Handling**: 
  - Shows "PK" chip for primary key fields
  - Prevents editing primary keys in edit mode
  - Auto-focuses primary key field in create mode
- **Validation**: Real-time validation based on field requirements and custom rules
- **Error Display**: Clear error messages for validation failures
- **Default Values**: Pre-fills form with default values from schema

### 4. Enhanced File Upload

#### Primary Key Selection
- **Excel/CSV Import**: Users can designate one field as primary key during import
- **Automatic Required**: Setting a field as primary key automatically makes it required
- **Validation**: Prevents multiple primary key selections
- **Preview**: Shows primary key status in preview table

#### UI Improvements
- **Table Headers**: Added "Primary Key" column to configuration tables
- **Visual Indicators**: Primary key fields are highlighted in preview
- **Smart Defaults**: First column can be auto-suggested as primary key

## API Enhancements

### New Endpoints

```http
GET /api/dynamic/schemas/{collectionName}/exists
Response: {"exists": boolean, "collectionName": string}
```

### Updated Schema Structure

```json
{
  "collectionName": "users",
  "fields": [
    {
      "name": "id",
      "type": "STRING",
      "required": true,
      "primaryKey": true,
      "validation": {"minLength": 1}
    },
    {
      "name": "email",
      "type": "STRING", 
      "required": true,
      "primaryKey": false,
      "validation": {"pattern": "^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$"}
    }
  ]
}
```

## Usage Examples

### 1. Creating a Collection with Primary Key

1. **Open Collection Management**: Navigate to http://localhost:3000
2. **Create New Collection**: Click "Create New Collection"
3. **Add Fields**: Add fields with appropriate types
4. **Set Primary Key**: Check "Primary Key" for one field (e.g., ID field)
5. **Validation**: System ensures only one primary key and makes it required
6. **Save**: Collection is created with primary key configuration

### 2. Importing from Excel/CSV with Primary Key

1. **Import Option**: Click "Import from File" 
2. **Upload File**: Drag and drop Excel/CSV file
3. **Configure Fields**: Map columns to field names and types
4. **Select Primary Key**: Choose one field as primary key
5. **Preview**: Review configuration including primary key status
6. **Create**: Collection is created with imported structure

### 3. Dynamic Document Management

1. **Select Collection**: Choose a collection from the list
2. **Add Document**: Click "Add New Document"
3. **Dynamic Form**: Form renders based on collection schema
4. **Primary Key Field**: Shows as read-only in edit mode, required in create mode
5. **Validation**: Real-time validation based on field rules
6. **Save**: Document is validated and saved

## Technical Implementation

### Database Schema Updates
- MongoDB collections store primary key metadata
- Field definitions include `primaryKey` boolean flag
- Validation ensures data integrity

### Frontend Architecture
- Reusable DynamicFormDialog component
- Smart form generation based on field types
- Comprehensive validation system
- Material-UI components for consistent UX

### Backend Validation
- Primary key uniqueness enforcement
- Collection existence checking
- Enhanced error messages for better UX

## Testing the Features

### Manual Testing Steps

1. **Primary Key Creation**:
   ```bash
   # Start the application
   ./start-fullstack.sh
   
   # Open browser to http://localhost:3000
   # Create collection with primary key field
   # Verify only one primary key can be set
   ```

2. **Collection Existence Check**:
   ```bash
   # Try creating collection with existing name
   # Verify error message appears
   # Check API endpoint directly:
   curl http://localhost:8080/api/dynamic/schemas/test_collection/exists
   ```

3. **Dynamic Form Testing**:
   ```bash
   # Create collection with various field types
   # Add documents using dynamic form
   # Test validation rules
   # Verify primary key field behavior
   ```

### API Testing
```bash
# Test new existence endpoint
curl -X GET http://localhost:8080/api/dynamic/schemas/users/exists

# Create schema with primary key
curl -X POST http://localhost:8080/api/dynamic/schemas \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "products",
    "fields": [
      {
        "name": "id",
        "type": "STRING",
        "required": true,
        "primaryKey": true
      },
      {
        "name": "name", 
        "type": "STRING",
        "required": true,
        "primaryKey": false
      }
    ]
  }'
```

## Benefits

1. **Data Integrity**: Primary keys ensure unique identification
2. **User Experience**: Prevents duplicate collection creation
3. **Flexibility**: Dynamic forms adapt to any schema
4. **Validation**: Comprehensive field-level validation
5. **Efficiency**: Smart defaults and auto-configuration
6. **Scalability**: Works with any number of fields and types

## Future Enhancements

1. **Composite Primary Keys**: Support for multiple field primary keys
2. **Foreign Keys**: Reference fields between collections  
3. **Auto-increment**: Automatic ID generation for primary keys
4. **Index Management**: Automatic indexing of primary key fields
5. **Schema Migration**: Tools for updating existing schemas

## Dependencies Added

```json
{
  "@mui/x-date-pickers": "^6.x.x",
  "@mui/x-date-pickers-pro": "^6.x.x", 
  "date-fns": "^2.x.x"
}
```

## Configuration

No additional configuration required. The features are enabled by default and work with existing MongoDB setup.

## Troubleshooting

### Common Issues

1. **Primary Key Validation Error**: Ensure only one field is marked as primary key
2. **Collection Exists Error**: Use different collection name or delete existing collection
3. **Dynamic Form Issues**: Verify field types are correctly mapped
4. **Date Picker Problems**: Ensure date-fns is properly installed

### Logs and Debugging

- **Backend Logs**: `tail -f backend.log`
- **Frontend Console**: Browser developer tools
- **API Testing**: Use Swagger UI at http://localhost:8080/swagger-ui/index.html
