import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FIELD_TYPES } from '../services/api';

const FileUploadDialog = ({ open, onClose, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const [fieldMappings, setFieldMappings] = useState([]);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState([]);

  const steps = ['Upload File', 'Configure Fields', 'Preview & Create'];

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      parseFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          setErrors({ file: 'File must contain at least 2 rows (headers and data types)' });
          return;
        }

        const headers = jsonData[0] || [];
        const dataTypes = jsonData[1] || [];
        const sampleData = jsonData.slice(2, 7); // First 5 rows of actual data

        // Create field mappings from headers and data types
        const mappings = headers.map((header, index) => ({
          id: `field_${index}`,
          columnName: header,
          fieldName: header.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'),
          fieldType: mapDataTypeToFieldType(dataTypes[index]),
          required: false,
          primaryKey: false,
          originalDataType: dataTypes[index],
        }));

        setFieldMappings(mappings);
        setParsedData({ headers, dataTypes, sampleData });
        setPreview(sampleData);
        setCollectionName(generateCollectionName(file.name));
        setActiveStep(1);
        setErrors({});
      } catch (error) {
        setErrors({ file: 'Failed to parse file. Please ensure it\'s a valid Excel/CSV file.' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const mapDataTypeToFieldType = (dataType) => {
    if (!dataType) return 'String';
    
    const type = dataType.toString().toLowerCase();
    if (type.includes('string') || type.includes('text')) return 'String';
    if (type.includes('number') || type.includes('int') || type.includes('float')) return 'Number';
    if (type.includes('bool')) return 'Boolean';
    if (type.includes('date')) return 'Date';
    if (type.includes('array')) return 'Array';
    if (type.includes('object')) return 'Object';
    return 'String';
  };

  const generateCollectionName = (fileName) => {
    return fileName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 50); // Limit length
  };

  const downloadSampleFile = () => {
    const sampleData = [
      ['id', 'name', 'email', 'age', 'isActive', 'createdDate', 'tags', 'profile'],
      ['Number', 'String', 'String', 'Number', 'Boolean', 'Date', 'Array', 'Object'],
      [1, 'John Doe', 'john@example.com', 30, true, '2024-01-15', 'admin,user', '{"department": "IT"}'],
      [2, 'Jane Smith', 'jane@example.com', 28, false, '2024-01-16', 'user', '{"department": "HR"}'],
      [3, 'Bob Johnson', 'bob@example.com', 35, true, '2024-01-17', 'user,manager', '{"department": "Sales"}'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 10 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'sample_collection_template.xlsx');
  };

  const handleFieldMappingChange = (index, field, value) => {
    const updatedMappings = [...fieldMappings];
    updatedMappings[index][field] = value;
    setFieldMappings(updatedMappings);
  };

  const removeField = (index) => {
    const updatedMappings = fieldMappings.filter((_, i) => i !== index);
    setFieldMappings(updatedMappings);
  };

  const validateConfiguration = () => {
    const newErrors = {};

    if (!collectionName.trim()) {
      newErrors.collectionName = 'Collection name is required';
    }

    if (fieldMappings.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    const fieldNames = fieldMappings.map(f => f.fieldName);
    const duplicateFields = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicateFields.length > 0) {
      newErrors.fields = `Duplicate field names: ${duplicateFields.join(', ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (validateConfiguration()) {
        setActiveStep(2);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSave = () => {
    if (validateConfiguration()) {
      const schema = {
        collectionName,
        fields: fieldMappings.map(mapping => ({
          name: mapping.fieldName,
          type: mapping.fieldType,
          required: mapping.required,
          primaryKey: mapping.primaryKey,
          description: `Imported from ${mapping.columnName}`,
        })),
        metadata: {
          importSource: 'file_upload',
          originalFile: file.name,
          importDate: new Date().toISOString(),
        },
      };

      onSave(schema);
      handleClose();
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFile(null);
    setParsedData(null);
    setCollectionName('');
    setFieldMappings([]);
    setErrors({});
    setPreview([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Create Collection from File
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step 1: File Upload */}
        {activeStep === 0 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Excel or CSV File
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Your file should have the following format:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Row 1: Column headers (field names)</li>
                <li>Row 2: Data types (String, Number, Boolean, Date, Array, Object)</li>
                <li>Row 3+: Sample data (optional, for preview)</li>
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadSampleFile}
                sx={{ mb: 2 }}
              >
                Download Sample Template
              </Button>
            </Box>

            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              {isDragActive ? (
                <Typography>Drop the file here...</Typography>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Drag & drop a file here, or click to select
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports .xlsx, .xls, and .csv files
                  </Typography>
                </Box>
              )}
            </Box>

            {file && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Selected file: <strong>{file.name}</strong>
                </Typography>
              </Box>
            )}

            {errors.file && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.file}
              </Alert>
            )}
          </Box>
        )}

        {/* Step 2: Configure Fields */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Collection Fields
            </Typography>

            <TextField
              fullWidth
              label="Collection Name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              error={!!errors.collectionName}
              helperText={errors.collectionName}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Field Mappings
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Column Name</TableCell>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Data Type</TableCell>
                    <TableCell>Required</TableCell>
                    <TableCell>Primary Key</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fieldMappings.map((mapping, index) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <Chip 
                          label={mapping.columnName} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={mapping.fieldName || ''}
                          onChange={(e) => handleFieldMappingChange(index, 'fieldName', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={mapping.fieldType}
                            onChange={(e) => handleFieldMappingChange(index, 'fieldType', e.target.value)}
                          >
                            {Object.values(FIELD_TYPES).map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small">
                          <Select
                            value={mapping.required}
                            onChange={(e) => handleFieldMappingChange(index, 'required', e.target.value)}
                          >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small">
                          <Select
                            value={mapping.primaryKey}
                            onChange={(e) => {
                              // If setting as primary key, ensure it's also required
                              const isPrimaryKey = e.target.value;
                              handleFieldMappingChange(index, 'primaryKey', isPrimaryKey);
                              if (isPrimaryKey) {
                                handleFieldMappingChange(index, 'required', true);
                                // Clear other primary keys
                                setFieldMappings(prev => prev.map((m, i) => 
                                  i !== index ? { ...m, primaryKey: false } : m
                                ));
                              }
                            }}
                          >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Remove field">
                          <IconButton 
                            size="small" 
                            onClick={() => removeField(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {errors.fields && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.fields}
              </Alert>
            )}
          </Box>
        )}

        {/* Step 3: Preview */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview Collection Schema
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Collection Name: <strong>{collectionName}</strong>
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Fields: {fieldMappings.length}
              </Typography>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Field Configuration:
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Required</TableCell>
                    <TableCell>Primary Key</TableCell>
                    <TableCell>Source Column</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fieldMappings.map((mapping, index) => (
                    <TableRow key={index}>
                      <TableCell><strong>{mapping.fieldName}</strong></TableCell>
                      <TableCell>{mapping.fieldType}</TableCell>
                      <TableCell>{mapping.required ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{mapping.primaryKey ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{mapping.columnName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {preview.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Sample Data Preview:
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {fieldMappings.map((mapping) => (
                          <TableCell key={mapping.fieldName}>
                            {mapping.fieldName}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          {fieldMappings.map((mapping, fieldIndex) => (
                            <TableCell key={fieldIndex}>
                              {row[fieldIndex] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 && (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={activeStep === 0 && !file}
          >
            Next
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<PreviewIcon />}
          >
            Create Collection
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;
