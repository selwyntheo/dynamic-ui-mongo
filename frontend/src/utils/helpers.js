// Utility functions for the application
import dayjs from 'dayjs';

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// Format field value based on its type
export const formatFieldValue = (value, fieldType) => {
  if (value === null || value === undefined) return '';
  
  switch (fieldType) {
    case 'DATE':
      return formatDate(value);
    case 'BOOLEAN':
      return value ? 'Yes' : 'No';
    case 'OBJECT':
    case 'ARRAY':
      return JSON.stringify(value, null, 2);
    default:
      return String(value);
  }
};

// Validate field value based on field definition
export const validateFieldValue = (value, fieldDef) => {
  const errors = [];
  
  // Check required fields
  if (fieldDef.required && (value === null || value === undefined || value === '')) {
    errors.push(`${fieldDef.name} is required`);
    return errors;
  }
  
  // If value is empty and not required, skip validation
  if (!value && !fieldDef.required) return errors;
  
  const validation = fieldDef.validation || {};
  
  switch (fieldDef.type) {
    case 'STRING':
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`${fieldDef.name} must be at least ${validation.minLength} characters`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`${fieldDef.name} must be no more than ${validation.maxLength} characters`);
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        errors.push(`${fieldDef.name} format is invalid`);
      }
      break;
      
    case 'INTEGER':
    case 'DOUBLE':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${fieldDef.name} must be a valid number`);
      } else {
        if (validation.min !== undefined && numValue < validation.min) {
          errors.push(`${fieldDef.name} must be at least ${validation.min}`);
        }
        if (validation.max !== undefined && numValue > validation.max) {
          errors.push(`${fieldDef.name} must be no more than ${validation.max}`);
        }
      }
      break;
      
    case 'ARRAY':
      if (Array.isArray(value)) {
        if (validation.minItems && value.length < validation.minItems) {
          errors.push(`${fieldDef.name} must have at least ${validation.minItems} items`);
        }
        if (validation.maxItems && value.length > validation.maxItems) {
          errors.push(`${fieldDef.name} must have no more than ${validation.maxItems} items`);
        }
      } else {
        errors.push(`${fieldDef.name} must be an array`);
      }
      break;
  }
  
  return errors;
};

// Convert form values to document format
export const formToDocument = (formData, schema) => {
  const document = {};
  
  schema.fields.forEach(field => {
    const value = formData[field.name];
    
    if (value !== undefined && value !== '') {
      switch (field.type) {
        case 'INTEGER':
          document[field.name] = parseInt(value, 10);
          break;
        case 'DOUBLE':
          document[field.name] = parseFloat(value);
          break;
        case 'BOOLEAN':
          document[field.name] = Boolean(value);
          break;
        case 'DATE':
          document[field.name] = dayjs(value).toISOString();
          break;
        case 'ARRAY':
          try {
            document[field.name] = Array.isArray(value) ? value : JSON.parse(value);
          } catch (e) {
            document[field.name] = value;
          }
          break;
        case 'OBJECT':
          try {
            document[field.name] = typeof value === 'object' ? value : JSON.parse(value);
          } catch (e) {
            document[field.name] = value;
          }
          break;
        default:
          document[field.name] = value;
      }
    }
  });
  
  return document;
};

// Convert document to form format
export const documentToForm = (document, schema) => {
  const formData = {};
  
  schema.fields.forEach(field => {
    const value = document[field.name];
    
    if (value !== undefined && value !== null) {
      switch (field.type) {
        case 'DATE':
          formData[field.name] = dayjs(value).format('YYYY-MM-DDTHH:mm:ss');
          break;
        case 'ARRAY':
        case 'OBJECT':
          formData[field.name] = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
          break;
        default:
          formData[field.name] = value;
      }
    } else if (field.defaultValue !== undefined) {
      formData[field.name] = field.defaultValue;
    }
  });
  
  return formData;
};

// Generate column configuration for DataGrid
export const generateGridColumns = (schema, onEdit, onDelete, customDisplayConfig = {}) => {
  const columns = [];
  
  // Add columns based on schema fields
  schema.fields.forEach(field => {
    const displayConfig = customDisplayConfig[field.name] || {};
    
    // Skip hidden fields
    if (displayConfig.hidden) return;
    
    const column = {
      field: field.name,
      headerName: displayConfig.label || field.name,
      width: displayConfig.width || getDefaultColumnWidth(field.type),
      sortable: displayConfig.sortable !== false,
      filterable: displayConfig.filterable !== false,
      type: getGridColumnType(field.type),
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '';
        return formatFieldValue(params.value, field.type);
      },
    };
    
    // Add specific configurations based on field type
    if (field.type === 'BOOLEAN') {
      column.type = 'boolean';
    } else if (field.type === 'DATE') {
      column.type = 'dateTime';
      column.valueGetter = (params) => {
        return params.value ? new Date(params.value) : null;
      };
    } else if (field.type === 'INTEGER' || field.type === 'DOUBLE') {
      column.type = 'number';
      column.align = 'right';
      column.headerAlign = 'right';
    }
    
    columns.push(column);
  });
  
  // Add action column
  columns.push({
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <div>
        <button onClick={() => onEdit(params.row)}>Edit</button>
        <button onClick={() => onDelete(params.row.id)}>Delete</button>
      </div>
    ),
  });
  
  return columns;
};

// Get default column width based on field type
const getDefaultColumnWidth = (fieldType) => {
  switch (fieldType) {
    case 'BOOLEAN':
      return 100;
    case 'DATE':
      return 180;
    case 'INTEGER':
    case 'DOUBLE':
      return 120;
    case 'ARRAY':
    case 'OBJECT':
      return 200;
    default:
      return 150;
  }
};

// Get DataGrid column type
const getGridColumnType = (fieldType) => {
  switch (fieldType) {
    case 'INTEGER':
    case 'DOUBLE':
      return 'number';
    case 'BOOLEAN':
      return 'boolean';
    case 'DATE':
      return 'dateTime';
    default:
      return 'string';
  }
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
