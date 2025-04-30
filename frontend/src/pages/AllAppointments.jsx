import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import AppointmentService from '../services/AppointmentService';

const AllAppointments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState(JSON.parse(localStorage.getItem('bookedAppointments') || '[]'));
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleReschedule = (appointment) => {
    navigate('/appointment-form', {
      state: {
        appointmentToEdit: appointment,
        isReschedule: true
      }
    });
  };

  const handleCancelClick = (appointmentId) => {
    console.log("Opening cancel dialog for appointment ID:", appointmentId);
    const appointment = appointments.find(app => app.id === appointmentId);

    if (!appointment) {
      showSnackbar('Cannot find the appointment to cancel', 'error');
      return;
    }

    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel || appointmentToCancel.id === undefined) {
      console.error("Cannot cancel appointment: No valid appointment selected");
      setCancelDialogOpen(false);
      showSnackbar('Cannot identify the appointment to cancel', 'error');
      return;
    }

    console.log("Confirming cancellation of appointment with ID:", appointmentToCancel.id);

    if (!token) {
      setError('Authentication required to cancel an appointment.');
      setCancelDialogOpen(false);
      return;
    }

    try {
      const appointmentId = appointmentToCancel.id;

      
      try {
        await AppointmentService.deleteAppointment(appointmentId);
        console.log("Server deletion successful");
      } catch (serverError) {
        // Capture the server error but continue with local deletion
        console.warn("Server deletion failed, continuing with local deletion:", serverError);
      }

      // Regardless of server response, update the local state
      console.log("Filtering out appointment with ID:", appointmentId);
      const updatedAppointments = appointments.filter(app => app.id !== appointmentId);
      console.log("Updated appointments array:", updatedAppointments);

      setAppointments(updatedAppointments);
      localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));
      setError(null);
      showSnackbar('Appointment cancelled successfully', 'success');

    } catch (err) {
      console.error('Error canceling appointment:', err);
      showSnackbar('Appointment cancelled locally', 'info');
    } finally {
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setAppointmentToCancel(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch appointments from the server and merge with local ones
  useEffect(() => {
    const fetchServerAppointments = async () => {
      if (user && user.id && token) {
        try {
          const response = await AppointmentService.getAppointmentsByUserId(user.id);
          console.log("Server appointments:", response.data);

          // Merge with local appointments
          const localAppointments = JSON.parse(localStorage.getItem('bookedAppointments') || '[]');

          // Create a map of server appointments by ID
          const serverAppMap = {};
          if (Array.isArray(response.data)) {
            response.data.forEach(app => {
              if (app.id) {
                serverAppMap[app.id] = app;
              }
            });
          }

          // Merge, prioritizing server data
          const mergedAppointments = localAppointments.map(localApp => {
            // If this local appointment exists on server, use server data
            return serverAppMap[localApp.id] || localApp;
          });

          // Add any server appointments not in local storage
          if (Array.isArray(response.data)) {
            response.data.forEach(serverApp => {
              if (!localAppointments.some(localApp => localApp.id === serverApp.id)) {
                mergedAppointments.push(serverApp);
              }
            });
          }

          // Save merged list
          localStorage.setItem('bookedAppointments', JSON.stringify(mergedAppointments));
          setAppointments(mergedAppointments);
        } catch (error) {
          console.error("Error fetching appointments from server:", error);
          loadLocalAppointments();
        }
      } else {
        
        loadLocalAppointments();
      }
    };

    fetchServerAppointments();
  }, [user, token]);

  // Ensure all appointments have valid IDs
  const loadLocalAppointments = () => {
    const storedAppointments = JSON.parse(localStorage.getItem('bookedAppointments') || '[]');
    const validatedAppointments = storedAppointments.map(appointment => {
      if (!appointment.id) {
        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
        return { ...appointment, id: uniqueId };
      }
      return appointment;
    });

    // Save back the validated appointments
    if (JSON.stringify(validatedAppointments) !== JSON.stringify(storedAppointments)) {
      localStorage.setItem('bookedAppointments', JSON.stringify(validatedAppointments));
    }

    setAppointments(validatedAppointments);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        All Appointments
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {appointments.length > 0 ? (
        <List style={{ background: 'white', padding: '30px', borderRadius: '10px' }}>
          {appointments.map((appointment) => (
            <ListItem
              key={`appointment-${appointment.id || Date.now() + Math.random()}`}
              style={{
                borderRadius: '10px',
                background: 'white',
                marginBottom: '10px',
                boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <ListItemText
                primary={`${appointment.doctor} - ${appointment.specialty}`}
                secondary={`${appointment.date} at ${appointment.time}`}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleReschedule(appointment)}
                sx={{ mr: 1 }}
              >
                Reschedule
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleCancelClick(appointment.id)}
              >
                Cancel
              </Button>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No appointments found.
        </Typography>
      )}

      {/* Cancel Appointment Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your appointment with {appointmentToCancel?.doctor} on {appointmentToCancel?.date} at {appointmentToCancel?.time}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="primary">
            No, Keep It
          </Button>
          <Button onClick={handleCancelConfirm} color="error" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AllAppointments;