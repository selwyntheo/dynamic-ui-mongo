import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { schemaApi, documentApi } from '../services/api';
import { generateGridColumns } from '../utils/helpers';
import { useSnackbar } from 'notistack';

const DataViewer = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [schema, setSchema] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  
  // Grid state
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  
  const { enqueueSnackbar } = useSnackbar();

  // Define all callback functions first
  const loadCollections = useCallback(async () => {
    try {
      setCollectionsLoading(true);
      const response = await schemaApi.getSchemas();
      setCollections(response.data || []);
    } catch (err) {
      console.error('Error loading collections:', err);
      setError('Failed to load collections');
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const loadSchema = useCallback(async () => {
    if (!selectedCollection) return;
    
    try {
      const response = await schemaApi.getSchema(selectedCollection);
      setSchema(response.data);
      // Reset filters when schema changes
      setFilters({});
      setAppliedFilters({});
    } catch (err) {
      console.error('Error loading schema:', err);
      setError('Failed to load schema');
    }
  }, [selectedCollection]);

  const loadDocuments = useCallback(async () => {
    if (!selectedCollection) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await documentApi.getDocuments(selectedCollection, appliedFilters);
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCollection, appliedFilters]);

  const handleCollectionChange = useCallback((event) => {
    setSelectedCollection(event.target.value);
    setDocuments([]);
    setSchema(null);
  }, []);

  const handleFilterChange = useCallback((fieldName, value) => {
    setFilters(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setAppliedFilters({});
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    return Object.values(appliedFilters).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  }, [appliedFilters]);

  // Effects using the callback functions
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    if (selectedCollection) {
      loadSchema();
    }
  }, [selectedCollection, loadSchema]);

  useEffect(() => {
    if (selectedCollection) {
      loadDocuments();
    }
  }, [selectedCollection, appliedFilters, loadDocuments]);

  const renderFilterInput = (field) => {
    const value = filters[field.name] || '';
    
    switch (field.type) {
      case 'STRING':
        return (
          <TextField
            key={field.name}
            label={`Search ${field.name}`}
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            size="small"
            fullWidth
            placeholder={`Enter ${field.name} to search...`}
            variant="outlined"
            helperText={`Filter records by ${field.name}`}
          />
        );
        
      case 'INTEGER':
      case 'DOUBLE':
        return (
          <TextField
            key={field.name}
            label={`${field.name} Value`}
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            size="small"
            fullWidth
            placeholder={`Enter ${field.name} value...`}
            variant="outlined"
            helperText={`Filter by exact ${field.name} value`}
          />
        );
        
      case 'BOOLEAN':
        return (
          <FormControl key={field.name} size="small" fullWidth variant="outlined">
            <InputLabel>{field.name} Status</InputLabel>
            <Select
              value={value}
              label={`${field.name} Status`}
              onChange={(e) => handleFilterChange(field.name, e.target.value)}
            >
              <MenuItem value="">All Records</MenuItem>
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
          </FormControl>
        );
        
      case 'DATE':
        return (
          <LocalizationProvider key={field.name} dateAdapter={AdapterDayjs}>
            <DatePicker
              label={`${field.name} Date`}
              value={value ? dayjs(value) : null}
              onChange={(newValue) => handleFilterChange(field.name, newValue ? newValue.format('YYYY-MM-DD') : '')}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  variant: "outlined",
                  helperText: `Filter by ${field.name} date`
                }
              }}
            />
          </LocalizationProvider>
        );
        
      case 'ARRAY':
        return (
          <TextField
            key={field.name}
            label={`Search in ${field.name}`}
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            size="small"
            fullWidth
            placeholder={`Search ${field.name} items...`}
            variant="outlined"
            helperText={`Search within ${field.name} array`}
          />
        );
        
      default:
        return (
          <TextField
            key={field.name}
            label={`Filter ${field.name}`}
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            size="small"
            fullWidth
            placeholder={`Search ${field.name}...`}
            variant="outlined"
            helperText={`Filter records by ${field.name}`}
          />
        );
    }
  };

  if (collectionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Data Viewer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a collection and apply filters to explore your data
        </Typography>
      </Box>

      {/* Collection Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Collection</InputLabel>
                <Select
                  value={selectedCollection}
                  label="Select Collection"
                  onChange={handleCollectionChange}
                >
                  {collections.map((collection) => (
                    <MenuItem key={collection.collectionName} value={collection.collectionName}>
                      {collection.collectionName} ({collection.fields?.length || 0} fields)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {selectedCollection && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`${documents.length} records`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  {getActiveFiltersCount() > 0 && (
                    <Chip 
                      label={`${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''} applied`} 
                      color="secondary" 
                      variant="outlined" 
                      size="small"
                    />
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Filters Section */}
      {schema && schema.fields && schema.fields.length > 0 && (
        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
          <CardContent sx={{ backgroundColor: 'primary.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold' }}>
                <FilterIcon />
                Configure Filters ({schema.fields.length} fields available)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  disabled={Object.keys(filters).length === 0}
                  color="error"
                >
                  Clear All
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FilterIcon />}
                  onClick={applyFilters}
                  disabled={JSON.stringify(filters) === JSON.stringify(appliedFilters)}
                  color="primary"
                >
                  Apply Filters
                </Button>
                <Tooltip title="Refresh Data">
                  <IconButton size="small" onClick={loadDocuments} disabled={loading} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set filters for the fields below and click "Apply Filters" to filter the data grid:
            </Typography>
            
            <Grid container spacing={3}>
              {schema.fields.map((field) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={field.name}>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
                      {field.name.toUpperCase()} ({field.type})
                    </Typography>
                    {renderFilterInput(field)}
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {Object.keys(filters).length > 0 && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" color="info.dark" sx={{ fontWeight: 'medium' }}>
                  Current Filters: {JSON.stringify(filters, null, 2)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Grid */}
      {schema && (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={documents}
            columns={generateGridColumns(schema)}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'grey.50',
                fontSize: '0.875rem',
                fontWeight: 600,
              },
            }}
          />
        </Paper>
      )}

      {/* Empty State */}
      {!selectedCollection && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FilterIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Collection Selected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a collection from the dropdown above to start exploring your data
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DataViewer;
