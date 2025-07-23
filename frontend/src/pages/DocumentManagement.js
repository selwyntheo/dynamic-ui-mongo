import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { documentApi } from '../services/api';
import DynamicFormDialog from '../components/DynamicFormDialog';
import GridConfigDialog from '../components/GridConfigDialog';
import { generateGridColumns, formatFieldValue } from '../utils/helpers';
import { useSnackbar } from 'notistack';

const DocumentManagement = ({ schema, onBack }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [gridConfigDialogOpen, setGridConfigDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentDialogMode, setDocumentDialogMode] = useState('create');
  const [gridConfig, setGridConfig] = useState({});
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (schema) {
      loadDocuments();
      // Load saved grid configuration from localStorage
      const savedConfig = localStorage.getItem(`gridConfig_${schema.collectionName}`);
      if (savedConfig) {
        try {
          setGridConfig(JSON.parse(savedConfig));
        } catch (e) {
          console.warn('Failed to load saved grid configuration');
        }
      }
    }
  }, [schema]);

  const loadDocuments = async () => {
    if (!schema) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await documentApi.getAllDocuments(
        schema.collectionName,
        paginationModel.page,
        paginationModel.pageSize
      );
      
      // Ensure data is an array and add id field if missing
      const documentsArray = Array.isArray(data) ? data : data.content || [];
      const documentsWithId = documentsArray.map((doc, index) => ({
        ...doc,
        id: doc.id || doc._id || `temp_${index}`,
      }));
      
      setDocuments(documentsWithId);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please check if the collection exists.');
      enqueueSnackbar('Failed to load documents', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = () => {
    setSelectedDocument(null);
    setDocumentDialogMode('create');
    setDocumentDialogOpen(true);
  };

  const handleEditDocument = (document) => {
    setSelectedDocument(document);
    setDocumentDialogMode('edit');
    setDocumentDialogOpen(true);
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentApi.deleteDocument(schema.collectionName, documentId);
      enqueueSnackbar('Document deleted successfully', { variant: 'success' });
      loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      enqueueSnackbar('Failed to delete document', { variant: 'error' });
    }
  };

  const handleSaveDocument = async (documentData) => {
    try {
      if (documentDialogMode === 'create') {
        await documentApi.createDocument(schema.collectionName, documentData);
        enqueueSnackbar('Document created successfully', { variant: 'success' });
      } else {
        await documentApi.updateDocument(schema.collectionName, selectedDocument.id, documentData);
        enqueueSnackbar('Document updated successfully', { variant: 'success' });
      }
      setDocumentDialogOpen(false);
      loadDocuments();
    } catch (err) {
      console.error('Error saving document:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save document';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleGridConfigSave = (config) => {
    setGridConfig(config);
    // Save to localStorage
    localStorage.setItem(`gridConfig_${schema.collectionName}`, JSON.stringify(config));
    setGridConfigDialogOpen(false);
    enqueueSnackbar('Grid configuration saved', { variant: 'success' });
  };

  if (!schema) {
    return null;
  }

  const columns = generateGridColumns(
    schema,
    handleEditDocument,
    handleDeleteDocument,
    gridConfig
  );

  // Enhanced action column with Material-UI styling
  const actionColumnIndex = columns.findIndex(col => col.field === 'actions');
  if (actionColumnIndex !== -1) {
    columns[actionColumnIndex] = {
      ...columns[actionColumnIndex],
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Document">
            <IconButton
              size="small"
              onClick={() => handleEditDocument(params.row)}
              color="primary"
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Document">
            <IconButton
              size="small"
              onClick={() => handleDeleteDocument(params.row.id)}
              color="error"
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    };
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={onBack}
            sx={{ textDecoration: 'none' }}
          >
            Collection Management
          </Link>
          <Typography color="text.primary">{schema.collectionName}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={onBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">
              {schema.collectionName} Documents
            </Typography>
          </Box>

          <Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={loadDocuments} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Configure Grid">
              <IconButton onClick={() => setGridConfigDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateDocument}
              sx={{ ml: 1 }}
            >
              Add Document
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={documents}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No documents found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create your first document to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateDocument}
                >
                  Add Document
                </Button>
              </Box>
            ),
            loadingOverlay: () => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            ),
          }}
        />
      </Box>

      {/* Dynamic Form Dialog */}
      <DynamicFormDialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
        onSave={handleSaveDocument}
        schema={schema}
        document={selectedDocument}
        mode={documentDialogMode}
      />

      {/* Grid Configuration Dialog */}
      <GridConfigDialog
        open={gridConfigDialogOpen}
        onClose={() => setGridConfigDialogOpen(false)}
        onSave={handleGridConfigSave}
        schema={schema}
        currentConfig={gridConfig}
      />
    </Box>
  );
};

export default DocumentManagement;
