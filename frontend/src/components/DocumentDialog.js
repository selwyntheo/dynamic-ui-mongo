import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { validateFieldValue, documentToForm, formToDocument } from '../utils/helpers';

const DocumentDialog = ({ open, onClose, onSave, schema, document = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (schema) {
      if (document && mode === 'edit') {
        setFormData(documentToForm(document, schema));
      } else {
        // Initialize with default values
        const initialData = {};
        schema.fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            initialData[field.name] = field.defaultValue;
          }
        });
        setFormData(initialData);
      }
    }
    setErrors({});
  }, [schema, document, mode, open]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
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
      const fieldErrors = validateFieldValue(value, field);
      if (fieldErrors.length > 0) {
        newErrors[field.name] = fieldErrors[0]; // Show first error
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const documentData = formToDocument(formData, schema);
    onSave(documentData);
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'STRING':
        return (
          <TextField
            key={field.name}
            label={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error}
            multiline={field.validation?.maxLength > 100}
            rows={field.validation?.maxLength > 100 ? 3 : 1}
          />
        );

      case 'INTEGER':
        return (
          <TextField
            key={field.name}
            label={field.name}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error}
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max,
              step: 1
            }}
          />
        );

      case 'DOUBLE':
        return (
          <TextField
            key={field.name}
            label={field.name}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error}
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max,
              step: 0.01
            }}
          />
        );

      case 'BOOLEAN':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
              />
            }
            label={field.name}
          />
        );

      case 'DATE':
        return (
          <LocalizationProvider key={field.name} dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label={field.name}
              value={value ? dayjs(value) : null}
              onChange={(newValue) => handleInputChange(field.name, newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required={field.required}
                  error={!!error}
                  helperText={error}
                />
              )}
            />
          </LocalizationProvider>
        );

      case 'ARRAY':
        return (
          <TextField
            key={field.name}
            label={`${field.name} (JSON Array)`}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error || 'Enter as JSON array, e.g., ["item1", "item2"]'}
            multiline
            rows={3}
            placeholder='["value1", "value2"]'
          />
        );

      case 'OBJECT':
        return (
          <TextField
            key={field.name}
            label={`${field.name} (JSON Object)`}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error || 'Enter as JSON object, e.g., {"key": "value"}'}
            multiline
            rows={4}
            placeholder='{"key": "value"}'
          />
        );

      default:
        return (
          <TextField
            key={field.name}
            label={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error}
          />
        );
    }
  };

  if (!schema) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? `Create New ${schema.collectionName}` : `Edit ${schema.collectionName}`}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Collection: {schema.collectionName}
          </Typography>
          
          <Grid container spacing={3}>
            {schema.fields.map(field => (
              <Grid item xs={12} sm={6} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>
          
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Please fix the validation errors above.
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDialog;
