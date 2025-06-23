import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './redux/store';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentDetail from './pages/equipment/EquipmentDetail';
import AddEquipment from './pages/equipment/AddEquipment';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import AddMaintenance from './pages/maintenance/AddMaintenance';
import UsageLogs from './pages/usage/UsageLogs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // Green
    },
    secondary: {
      main: '#f57c00', // Orange
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Header />
            <main style={{ minHeight: 'calc(100vh - 130px)', padding: '20px' }}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/equipment" 
                  element={
                    <ProtectedRoute>
                      <EquipmentList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/equipment/add" 
                  element={
                    <ProtectedRoute>
                      <AddEquipment />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/equipment/:id" 
                  element={
                    <ProtectedRoute>
                      <EquipmentDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/maintenance" 
                  element={
                    <ProtectedRoute>
                      <MaintenanceList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/maintenance/add" 
                  element={
                    <ProtectedRoute>
                      <AddMaintenance />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/usage" 
                  element={
                    <ProtectedRoute>
                      <UsageLogs />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;