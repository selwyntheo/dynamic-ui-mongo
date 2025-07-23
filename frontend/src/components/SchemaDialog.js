import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { FIELD_TYPES, VALIDATION_RULES, schemaApi } from '../services/api';
import { generateId } from '../utils/helpers';

const SchemaDialog = ({ open, onClose, onSave, schema = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    collectionName: '',
    fields: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (schema && mode === 'edit') {
      setFormData({
        collectionName: schema.collectionName || '',
        fields: (schema.fields || []).map(field => ({
          ...field,
          id: generateId(), // Add temporary id for frontend management
          primaryKey: field.primaryKey || false // Ensure primaryKey is set
        }))
      });
    } else {
      setFormData({
        collectionName: '',
        fields: []
      });
    }
    setErrors({});
  }, [schema, mode, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addField = () => {
    const newField = {
      id: generateId(),
      name: '',
      type: 'STRING',
      required: false,
      primaryKey: false,
      defaultValue: '',
      validation: {}
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const updateFieldValidation = (fieldId, validationKey, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => {
        if (field.id === fieldId) {
          const newValidation = { ...field.validation };
          if (value === '' || value === null || value === undefined) {
            delete newValidation[validationKey];
          } else {
            newValidation[validationKey] = value;
          }
          return { ...field, validation: newValidation };
        }
        return field;
      })
    }));
  };

  const validateForm = async () => {
    const newErrors = {};
    
    if (!formData.collectionName.trim()) {
      newErrors.collectionName = 'Collection name is required';
    } else if (mode === 'create') {
      // Check if collection already exists
      try {
        const existsResult = await schemaApi.checkCollectionExists(formData.collectionName);
        if (existsResult.exists) {
          newErrors.collectionName = 'Collection with this name already exists';
        }
      } catch (err) {
        console.error('Error checking collection existence:', err);
        // Don't block creation if check fails
      }
    }
    
    if (formData.fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }
    
    // Check for primary key validation
    const primaryKeyFields = formData.fields.filter(field => field.primaryKey);
    if (primaryKeyFields.length > 1) {
      primaryKeyFields.forEach(field => {
        newErrors[`field_${field.id}_primaryKey`] = 'Only one field can be marked as primary key';
      });
    }
    
    formData.fields.forEach((field, index) => {
      if (!field.name.trim()) {
        newErrors[`field_${field.id}_name`] = 'Field name is required';
      }
      
      // Check for duplicate field names
      const duplicateField = formData.fields.find(
        (f, i) => f.name === field.name && i !== index
      );
      if (duplicateField) {
        newErrors[`field_${field.id}_name`] = 'Field name must be unique';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!(await validateForm())) return;
    
    const schemaData = {
      ...formData,
      fields: formData.fields.map(({ id, ...field }) => field) // Remove temporary id
    };
    
    onSave(schemaData);
  };

  const renderValidationFields = (field) => {
    const availableRules = VALIDATION_RULES[field.type] || [];
    
    return availableRules.map(rule => (
      <Grid item xs={6} key={rule}>
        <TextField
          label={rule}
          type={rule.includes('Length') || rule.includes('Items') || rule === 'min' || rule === 'max' ? 'number' : 'text'}
          value={field.validation?.[rule] || ''}
          onChange={(e) => updateFieldValidation(field.id, rule, e.target.value)}
          fullWidth
          size="small"
          helperText={getValidationHelperText(rule)}
        />
      </Grid>
    ));
  };

  const getValidationHelperText = (rule) => {
    switch (rule) {
      case 'minLength':
        return 'Minimum string length';
      case 'maxLength':
        return 'Maximum string length';
      case 'pattern':
        return 'Regular expression pattern';
      case 'min':
        return 'Minimum value';
      case 'max':
        return 'Maximum value';
      case 'minItems':
        return 'Minimum array items';
      case 'maxItems':
        return 'Maximum array items';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
        {mode === 'create' ? 'Create New Collection' : 'Edit Collection'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <TextField
            name="collectionName"
            label="Collection Name"
            value={formData.collectionName || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={mode === 'edit'}
            error={!!errors.collectionName}
            helperText={errors.collectionName}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Fields</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addField}
              variant="outlined"
              size="small"
            >
              Add Field
            </Button>
          </Box>
          
          {errors.fields && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.fields}
            </Alert>
          )}
          
          {formData.fields.map((field, index) => (
            <Accordion key={field.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flexGrow: 1 }}>
                    {field.name || `Field ${index + 1}`}
                  </Typography>
                  <Chip
                    label={field.type}
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  {field.required && (
                    <Chip
                      label="Required"
                      size="small"
                      color="error"
                      sx={{ mr: 1 }}
                    />
                  )}
                  {field.primaryKey && (
                    <Chip
                      label="Primary Key"
                      size="small"
                      color="secondary"
                      sx={{ mr: 2 }}
                    />
                  )}
                  {!field.primaryKey && !field.required && <Box sx={{ mr: 2 }} />}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.id);
                    }}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Field Name"
                      value={field.name || ''}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      fullWidth
                      error={!!errors[`field_${field.id}_name`]}
                      helperText={errors[`field_${field.id}_name`]}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Field Type</InputLabel>
                      <Select
                        value={field.type}
                        label="Field Type"
                        onChange={(e) => updateField(field.id, { 
                          type: e.target.value,
                          validation: {} // Reset validation when type changes
                        })}
                      >
                        {FIELD_TYPES.map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        />
                      }
                      label="Required"
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.primaryKey}
                          onChange={(e) => {
                            const isPrimaryKey = e.target.checked;
                            updateField(field.id, { 
                              primaryKey: isPrimaryKey,
                              required: isPrimaryKey ? true : field.required // Primary keys are automatically required
                            });
                            
                            // Clear other primary keys if setting this one as primary
                            if (isPrimaryKey) {
                              setFormData(prev => ({
                                ...prev,
                                fields: prev.fields.map(f => 
                                  f.id !== field.id ? { ...f, primaryKey: false } : f
                                )
                              }));
                            }
                          }}
                        />
                      }
                      label="Primary Key"
                      error={!!errors[`field_${field.id}_primaryKey`]}
                    />
                    {errors[`field_${field.id}_primaryKey`] && (
                      <Typography variant="caption" color="error" display="block">
                        {errors[`field_${field.id}_primaryKey`]}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      label="Default Value"
                      value={field.defaultValue || ''}
                      onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  
                  {VALIDATION_RULES[field.type]?.length > 0 && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                          Validation Rules
                        </Typography>
                      </Grid>
                      {renderValidationFields(field)}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
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

export default SchemaDialog;
