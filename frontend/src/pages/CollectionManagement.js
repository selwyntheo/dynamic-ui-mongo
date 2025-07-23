import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Storage as StorageIcon,
  CloudUpload as UploadIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { schemaApi, documentApi } from '../services/api';
import SchemaDialog from '../components/SchemaDialog';
import FileUploadDialog from '../components/FileUploadDialog';
import { formatDate, generateGridColumns } from '../utils/helpers';
import { useSnackbar } from 'notistack';

const CollectionManagement = ({ onCollectionSelect }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [dialogMode, setDialogMode] = useState('create');
  
  // Data preview dialog state
  const [dataPreviewOpen, setDataPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSchema, setPreviewSchema] = useState(null);
  
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await schemaApi.getAllSchemas();
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading collections:', err);
      setError('Failed to load collections. Please check if the API server is running.');
      enqueueSnackbar('Failed to load collections', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = () => {
    setSelectedCollection(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDeleteCollection = async (collectionName) => {
    if (!window.confirm(`Are you sure you want to delete the collection "${collectionName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await schemaApi.deleteSchema(collectionName);
      enqueueSnackbar('Collection deleted successfully', { variant: 'success' });
      loadCollections();
    } catch (err) {
      console.error('Error deleting collection:', err);
      enqueueSnackbar('Failed to delete collection', { variant: 'error' });
    }
  };

  const handleSaveCollection = async (collectionData) => {
    try {
      if (dialogMode === 'create') {
        await schemaApi.createSchema(collectionData);
        enqueueSnackbar('Collection created successfully', { variant: 'success' });
      } else {
        await schemaApi.updateSchema(selectedCollection.collectionName, collectionData);
        enqueueSnackbar('Collection updated successfully', { variant: 'success' });
      }
      setDialogOpen(false);
      loadCollections();
    } catch (err) {
      console.error('Error saving collection:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save collection';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleViewDocuments = (collection) => {
    if (onCollectionSelect) {
      onCollectionSelect(collection);
    }
  };

  const handleViewData = async (collection) => {
    setPreviewSchema(collection);
    setDataPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const response = await documentApi.getDocuments(collection.collectionName);
      setPreviewData(response.data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      enqueueSnackbar('Failed to load documents', { variant: 'error' });
      setPreviewData([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCloseDataPreview = () => {
    setDataPreviewOpen(false);
    setPreviewData([]);
    setPreviewSchema(null);
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Collection Management</Typography>
          <Skeleton variant="rectangular" width={160} height={36} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Collection Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCollection}
            size="large"
          >
            Create Collection
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setFileUploadDialogOpen(true)}
            size="large"
          >
            Import from File
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {collections.length === 0 && !loading && !error && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <StorageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Collections Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first collection manually or import from an Excel/CSV file
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateCollection}
              >
                Create Collection
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setFileUploadDialogOpen(true)}
              >
                Import from File
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {collections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} key={collection.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" component="h2" noWrap>
                    {collection.collectionName}
                  </Typography>
                  <Box>
                    <Tooltip title="View Documents">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDocuments(collection)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Collection">
                      <IconButton
                        size="small"
                        onClick={() => handleEditCollection(collection)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Collection">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCollection(collection.collectionName)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {collection.fields?.length || 0} fields defined
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {collection.fields?.slice(0, 3).map((field) => (
                    <Chip
                      key={field.name}
                      label={`${field.name} (${field.type})`}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                  {collection.fields?.length > 3 && (
                    <Chip
                      label={`+${collection.fields.length - 3} more`}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(collection.createdAt)}
                </Typography>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<TableIcon />}
                    onClick={() => handleViewData(collection)}
                    size="small"
                  >
                    View Data
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewDocuments(collection)}
                    size="small"
                  >
                    Manage Documents
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <SchemaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveCollection}
        schema={selectedCollection}
        mode={dialogMode}
      />

      <FileUploadDialog
        open={fileUploadDialogOpen}
        onClose={() => setFileUploadDialogOpen(false)}
        onSave={handleSaveCollection}
      />

      {/* Data Preview Dialog */}
      <Dialog 
        open={dataPreviewOpen} 
        onClose={handleCloseDataPreview} 
        maxWidth="lg" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '80vh',
          },
        }}
      >
        <DialogTitle>
          {previewSchema ? `${previewSchema.collectionName} - Data Preview` : 'Data Preview'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Loading data...</Typography>
            </Box>
          ) : (
            <Box sx={{ height: '60vh', width: '100%' }}>
              {previewSchema && (
                <DataGrid
                  rows={previewData}
                  columns={generateGridColumns(previewSchema, null, {})}
                  loading={previewLoading}
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={{ page: 0, pageSize: 25 }}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-root': {
                      border: 'none',
                    },
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDataPreview}>Close</Button>
          {previewSchema && (
            <Button 
              variant="contained" 
              onClick={() => {
                handleCloseDataPreview();
                handleViewDocuments(previewSchema);
              }}
            >
              Manage Documents
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionManagement;
