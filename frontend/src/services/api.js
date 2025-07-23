// API Service for Dynamic MongoDB CRUD Operations
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/dynamic';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Schema Management APIs
export const schemaApi = {
  // Get all schemas
  getAllSchemas: async () => {
    const response = await apiClient.get('/schemas');
    return response.data;
  },

  // Get specific schema
  getSchema: async (collectionName) => {
    const response = await apiClient.get(`/schemas/${collectionName}`);
    return response.data;
  },

  // Create new schema
  createSchema: async (schema) => {
    const response = await apiClient.post('/schemas', schema);
    return response.data;
  },

  // Update schema
  updateSchema: async (collectionName, schema) => {
    const response = await apiClient.put(`/schemas/${collectionName}`, schema);
    return response.data;
  },

  // Delete schema
  deleteSchema: async (collectionName) => {
    const response = await apiClient.delete(`/schemas/${collectionName}`);
    return response.data;
  },
};

// Document Management APIs
export const documentApi = {
  // Get all documents in a collection
  getAllDocuments: async (collectionName, page = 0, size = 10) => {
    const response = await apiClient.get(`/collections/${collectionName}/documents`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get specific document
  getDocument: async (collectionName, documentId) => {
    const response = await apiClient.get(`/collections/${collectionName}/documents/${documentId}`);
    return response.data;
  },

  // Create new document
  createDocument: async (collectionName, document) => {
    const response = await apiClient.post(`/collections/${collectionName}/documents`, document);
    return response.data;
  },

  // Update document
  updateDocument: async (collectionName, documentId, document) => {
    const response = await apiClient.put(`/collections/${collectionName}/documents/${documentId}`, document);
    return response.data;
  },

  // Delete document
  deleteDocument: async (collectionName, documentId) => {
    const response = await apiClient.delete(`/collections/${collectionName}/documents/${documentId}`);
    return response.data;
  },

  // Search documents with query
  searchDocuments: async (collectionName, query = {}, page = 0, size = 10) => {
    const response = await apiClient.post(`/collections/${collectionName}/documents/search`, query, {
      params: { page, size }
    });
    return response.data;
  },
};

// Health check API
export const healthApi = {
  checkHealth: async () => {
    const response = await axios.get('http://localhost:8080/actuator/health');
    return response.data;
  },
};

// Field types supported by the system
export const FIELD_TYPES = [
  'STRING',
  'INTEGER', 
  'DOUBLE',
  'BOOLEAN',
  'DATE',
  'OBJECT',
  'ARRAY'
];

// Validation rules for different field types
export const VALIDATION_RULES = {
  STRING: ['minLength', 'maxLength', 'pattern'],
  INTEGER: ['min', 'max'],
  DOUBLE: ['min', 'max'],
  BOOLEAN: [],
  DATE: ['min', 'max'],
  OBJECT: [],
  ARRAY: ['minItems', 'maxItems']
};

export default apiClient;
