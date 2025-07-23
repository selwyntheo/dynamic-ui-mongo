import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { documentApi } from '../services/api';

const DynamicFormDialog = ({ 
  open, 
  onClose, 
  onSave, 
  schema, 
  document = null, 
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!schema || !open) return;

    const initialData = {};
    
    if (document && mode === 'edit') {
      // Pre-fill with existing document data
      Object.assign(initialData, document.data || {});
    } else {
      // Set default values for new documents
      schema.fields.forEach(field => {
        if (field.defaultValue !== null && field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else {
          // Set appropriate empty values based on field type
          switch (field.type) {
            case 'STRING':
              initialData[field.name] = '';
              break;
            case 'INTEGER':
            case 'DOUBLE':
              initialData[field.name] = field.required ? 0 : '';
              break;
            case 'BOOLEAN':
              initialData[field.name] = false;
              break;
            case 'DATE':
              initialData[field.name] = null;
              break;
            case 'ARRAY':
              initialData[field.name] = [];
              break;
            case 'OBJECT':
              initialData[field.name] = {};
              break;
            default:
              initialData[field.name] = '';
          }
        }
      });
    }

    setFormData(initialData);
    setErrors({});
  }, [schema, document, mode, open]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user changes the field
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    schema.fields.forEach(field => {
      const value = formData[field.name];
      
      // Check required fields
      if (field.required && (value === null || value === undefined || value === '')) {
        newErrors[field.name] = `${field.name} is required`;
        return;
      }

      // Type-specific validation
      if (value !== null && value !== undefined && value !== '') {
        switch (field.type) {
          case 'INTEGER':
            if (!Number.isInteger(Number(value))) {
              newErrors[field.name] = `${field.name} must be an integer`;
            }
            break;
          case 'DOUBLE':
            if (isNaN(Number(value))) {
              newErrors[field.name] = `${field.name} must be a number`;
            }
            break;
          // Add more type validations as needed
        }
      }

      // Custom validation rules
      if (field.validation && value) {
        const validation = field.validation;
        
        if (field.type === 'STRING') {
          if (validation.minLength && value.length < validation.minLength) {
            newErrors[field.name] = `${field.name} must be at least ${validation.minLength} characters`;
          }
          if (validation.maxLength && value.length > validation.maxLength) {
            newErrors[field.name] = `${field.name} must be no more than ${validation.maxLength} characters`;
          }
          if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
            newErrors[field.name] = `${field.name} format is invalid`;
          }
        }
        
        if (field.type === 'INTEGER' || field.type === 'DOUBLE') {
          const numValue = Number(value);
          if (validation.min !== undefined && numValue < validation.min) {
            newErrors[field.name] = `${field.name} must be at least ${validation.min}`;
          }
          if (validation.max !== undefined && numValue > validation.max) {
            newErrors[field.name] = `${field.name} must be no more than ${validation.max}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      if (mode === 'create') {
        result = await documentApi.createDocument(schema.collectionName, formData);
      } else {
        result = await documentApi.updateDocument(
          schema.collectionName, 
          document.id, 
          formData
        );
      }
      onSave(result);
      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Failed to save document' 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name];
    const error = errors[field.name];
    const isRequired = field.required;
    const isPrimaryKey = field.primaryKey;

    // Don't allow editing primary key in edit mode
    if (isPrimaryKey && mode === 'edit') {
      return (
        <Grid item xs={12} sm={6} key={field.name}>
          <TextField
            label={field.name}
            value={value || ''}
            fullWidth
            disabled
            helperText="Primary key cannot be edited"
            InputProps={{
              startAdornment: (
                <Chip
                  label="Primary Key"
                  size="small"
                  color="secondary"
                  sx={{ mr: 1 }}
                />
              ),
            }}
          />
        </Grid>
      );
    }

    switch (field.type) {
      case 'STRING':
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <TextField
              label={field.name}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              fullWidth
              required={isRequired}
              error={!!error}
              helperText={error}
              InputProps={{
                startAdornment: isPrimaryKey && (
                  <Chip
                    label="PK"
                    size="small"
                    color="secondary"
                    sx={{ mr: 1 }}
                  />
                ),
              }}
            />
          </Grid>
        );

      case 'INTEGER':
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <TextField
              label={field.name}
              type="number"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value) || '')}
              fullWidth
              required={isRequired}
              error={!!error}
              helperText={error}
              InputProps={{
                startAdornment: isPrimaryKey && (
                  <Chip
                    label="PK"
                    size="small"
                    color="secondary"
                    sx={{ mr: 1 }}
                  />
                ),
              }}
            />
          </Grid>
        );

      case 'DOUBLE':
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <TextField
              label={field.name}
              type="number"
              inputProps={{ step: 'any' }}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || '')}
              fullWidth
              required={isRequired}
              error={!!error}
              helperText={error}
              InputProps={{
                startAdornment: isPrimaryKey && (
                  <Chip
                    label="PK"
                    size="small"
                    color="secondary"
                    sx={{ mr: 1 }}
                  />
                ),
              }}
            />
          </Grid>
        );

      case 'BOOLEAN':
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value || false}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {field.name}
                  {isPrimaryKey && (
                    <Chip
                      label="PK"
                      size="small"
                      color="secondary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </Grid>
        );

      case 'DATE':
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={field.name}
                value={value ? dayjs(value) : null}
                onChange={(newValue) => 
                  handleFieldChange(field.name, newValue ? newValue.toISOString() : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: isRequired,
                    error: !!error,
                    helperText: error,
                    InputProps: {
                      startAdornment: isPrimaryKey && (
                        <Chip
                          label="PK"
                          size="small"
                          color="secondary"
                          sx={{ mr: 1 }}
                        />
                      ),
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
        );

      default:
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <TextField
              label={field.name}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              fullWidth
              required={isRequired}
              error={!!error}
              helperText={error || `Type: ${field.type}`}
              InputProps={{
                startAdornment: isPrimaryKey && (
                  <Chip
                    label="PK"
                    size="small"
                    color="secondary"
                    sx={{ mr: 1 }}
                  />
                ),
              }}
            />
          </Grid>
        );
    }
  };

  if (!schema) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? `Add New ${schema.collectionName}` : `Edit ${schema.collectionName}`}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {schema.fields.map(field => renderField(field))}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DynamicFormDialog;
