import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';

const GridConfigDialog = ({ open, onClose, onSave, schema, currentConfig = {} }) => {
  const [config, setConfig] = useState({});

  React.useEffect(() => {
    if (schema && open) {
      const initialConfig = {};
      schema.fields.forEach(field => {
        initialConfig[field.name] = {
          hidden: currentConfig[field.name]?.hidden || false,
          width: currentConfig[field.name]?.width || getDefaultWidth(field.type),
          label: currentConfig[field.name]?.label || field.name,
          sortable: currentConfig[field.name]?.sortable !== false,
          filterable: currentConfig[field.name]?.filterable !== false,
        };
      });
      setConfig(initialConfig);
    }
  }, [schema, currentConfig, open]);

  const getDefaultWidth = (fieldType) => {
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

  const handleFieldConfigChange = (fieldName, property, value) => {
    setConfig(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [property]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  if (!schema) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Configure Grid Display - {schema.collectionName}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure how fields are displayed in the data grid. You can customize column width, 
            labels, visibility, and sorting options.
          </Typography>
          
          {schema.fields.map((field, index) => (
            <Box key={field.name} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {field.name} ({field.type})
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Display Label"
                    value={config[field.name]?.label || field.name}
                    onChange={(e) => handleFieldConfigChange(field.name, 'label', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Column Width"
                    type="number"
                    value={config[field.name]?.width || getDefaultWidth(field.type)}
                    onChange={(e) => handleFieldConfigChange(field.name, 'width', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    inputProps={{ min: 50, max: 500 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!config[field.name]?.hidden}
                        onChange={(e) => handleFieldConfigChange(field.name, 'hidden', !e.target.checked)}
                      />
                    }
                    label="Show in Grid"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config[field.name]?.sortable !== false}
                        onChange={(e) => handleFieldConfigChange(field.name, 'sortable', e.target.checked)}
                      />
                    }
                    label="Sortable"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config[field.name]?.filterable !== false}
                        onChange={(e) => handleFieldConfigChange(field.name, 'filterable', e.target.checked)}
                      />
                    }
                    label="Filterable"
                  />
                </Grid>
              </Grid>
              
              {index < schema.fields.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Apply Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GridConfigDialog;
