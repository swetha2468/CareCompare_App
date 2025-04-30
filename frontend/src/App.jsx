import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import HospitalFinder from './pages/HospitalFinder';
import HospitalComparison from './pages/HospitalComparison';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import ComparePlans from './pages/ComparePlans';
import TreatmentInfo from './pages/Treatment';
import SymptomChecker from './pages/SymptomChecker';
import InsuranceDirectory from './pages/InsuranceDirectory';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';
import AppointmentForm from './pages/AppointmentForm';
import AllAppointments from './pages/AllAppointments';

// Create a custom theme with medical-friendly colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#2c7db9', // Professional blue
      light: '#81b4e3',
      dark: '#004a87',
    },
    secondary: {
      main: '#42a883', // Calming green
      light: '#76dab3',
      dark: '#007955',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f5f8fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.2rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '1.8rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.3rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/symptom-checker" element={<SymptomChecker />} />
              <Route path="/insurance-directory" element={<InsuranceDirectory />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hospitals"
                element={
                  <ProtectedRoute>
                    <HospitalComparison />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hospital-finder"
                element={
                  <ProtectedRoute>
                    <HospitalFinder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medical-records"
                element={
                  <ProtectedRoute>
                    <MedicalRecords />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compare-plans"
                element={
                  <ProtectedRoute>
                    <ComparePlans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/treatment-info/:treatmentName"
                element={
                  <ProtectedRoute>
                    <TreatmentInfo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointment-form"
                element={
                  <ProtectedRoute>
                    <AppointmentForm />
                  </ProtectedRoute>
                }
              />
              <Route path="/all-appointments" element={<AllAppointments />} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
