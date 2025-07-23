import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Button,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CollectionManagement from './pages/CollectionManagement';
import DocumentManagement from './pages/DocumentManagement';
import DataViewer from './pages/DataViewer';
import { healthApi } from './services/api';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState('schemas');
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await healthApi.checkHealth();
      setApiStatus('connected');
      setError('');
    } catch (err) {
      console.error('API health check failed:', err);
      setApiStatus('disconnected');
      setError('Cannot connect to API server. Please ensure the backend is running on http://localhost:8080');
    }
  };

  const handleCollectionSelect = (collection) => {
    setSelectedSchema(collection);
    setCurrentView('documents');
  };

  const handleBackToCollections = () => {
    setCurrentView('schemas');
    setSelectedSchema(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentView(newValue);
    if (newValue !== 'documents') {
      setSelectedSchema(null);
    }
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected':
        return 'success';
      case 'disconnected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected':
        return 'API Connected';
      case 'disconnected':
        return 'API Disconnected';
      default:
        return 'Checking...';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {/* App Bar */}
            <AppBar position="static" elevation={1}>
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Dynamic MongoDB CRUD Manager
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={getStatusText()}
                    color={getStatusColor()}
                    variant={apiStatus === 'checking' ? 'outlined' : 'filled'}
                    size="small"
                  />
                  
                  {apiStatus === 'disconnected' && (
                    <Button
                      color="inherit"
                      onClick={checkApiHealth}
                      size="small"
                    >
                      Retry
                    </Button>
                  )}
                  
                  <Button
                    color="inherit"
                    href="http://localhost:8080/swagger-ui/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                  >
                    API Docs
                  </Button>
                </Box>
              </Toolbar>
              
              {/* Navigation Tabs */}
              {apiStatus === 'connected' && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Tabs 
                    value={currentView === 'documents' ? 'schemas' : currentView} 
                    onChange={handleTabChange}
                    sx={{ 
                      '& .MuiTab-root': { 
                        color: 'text.primary',
                        '&.Mui-selected': {
                          color: 'primary.main'
                        }
                      }
                    }}
                  >
                    <Tab label="Collection Management" value="schemas" />
                    <Tab label="Data Viewer" value="dataviewer" />
                  </Tabs>
                </Box>
              )}
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
              {apiStatus === 'checking' && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {apiStatus === 'disconnected' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    API Connection Failed
                  </Typography>
                  {error}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      To start the backend server:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ mt: 1, fontFamily: 'monospace' }}>
                      cd /path/to/dynamic-mongo-crud{'\n'}
                      ./run.sh
                    </Typography>
                  </Box>
                </Alert>
              )}

              {apiStatus === 'connected' && (
                <>
                  {currentView === 'schemas' && (
                    <CollectionManagement onCollectionSelect={handleCollectionSelect} />
                  )}

                  {currentView === 'dataviewer' && (
                    <DataViewer />
                  )}

                  {currentView === 'documents' && selectedSchema && (
                    <DocumentManagement
                      schema={selectedSchema}
                      onBack={handleBackToCollections}
                    />
                  )}
                </>
              )}
            </Container>
          </Box>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
