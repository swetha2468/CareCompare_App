import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  Chip, 
  IconButton, 
  Snackbar, 
  Alert, 
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Appointments = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [reason, setReason] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [editMode, setEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchAppointments();
    fetchDoctors();
    fetchTreatments();
  }, [isAuthenticated, navigate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/appointments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again later.');
      // For demo 
      setAppointments([
        {
          id: 1,
          doctorName: 'Dr. Sarah Johnson',
          treatmentName: 'General Checkup',
          date: '2023-12-15',
          time: '10:00 AM',
          reason: 'Annual physical examination',
          status: 'CONFIRMED'
        },
        {
          id: 2,
          doctorName: 'Dr. Michael Chen',
          treatmentName: 'Dental Cleaning',
          date: '2023-12-20',
          time: '2:30 PM',
          reason: 'Regular dental cleaning',
          status: 'PENDING'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/doctors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      // Mock data for development
      setDoctors([
        { id: 1, name: 'Dr. Sarah Johnson', specialization: 'General Physician' },
        { id: 2, name: 'Dr. Michael Chen', specialization: 'Dentist' },
        { id: 3, name: 'Dr. Emily Parker', specialization: 'Cardiologist' }
      ]);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/treatments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTreatments(response.data);
    } catch (err) {
      console.error('Error fetching treatments:', err);
      
      setTreatments([
        { id: 1, name: 'General Checkup', cost: 100 },
        { id: 2, name: 'Dental Cleaning', cost: 150 },
        { id: 3, name: 'Heart Examination', cost: 300 }
      ]);
    }
  };

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      // Edit mode
      setEditMode(true);
      setSelectedAppointment(appointment);
      setSelectedDoctor(appointment.doctorId || '');
      setSelectedTreatment(appointment.treatmentId || '');
      setSelectedDate(new Date(appointment.date));
      setSelectedTime(new Date(`2000-01-01T${appointment.time}`));
      setReason(appointment.reason || '');
    } else {
      // Create mode
      setEditMode(false);
      setSelectedAppointment(null);
      setSelectedDoctor('');
      setSelectedTreatment('');
      setSelectedDate(null);
      setSelectedTime(null);
      setReason('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !selectedTreatment || !reason) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    const formattedDate = selectedDate.toISOString().split('T')[0];
    const formattedTime = selectedTime.toTimeString().slice(0, 5);

    const appointmentData = {
      doctorId: selectedDoctor,
      treatmentId: selectedTreatment,
      date: formattedDate,
      time: formattedTime,
      reason: reason,
      userId: user.id
    };

    try {
      if (editMode) {
        // Update existing appointment
        await axios.put(`http://localhost:8080/api/appointments/${selectedAppointment.id}`, appointmentData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showAlert('Appointment updated successfully', 'success');
      } else {
        // Create new appointment
        await axios.post('http://localhost:8080/api/appointments', appointmentData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showAlert('Appointment booked successfully', 'success');
      }
      
      handleCloseDialog();
      fetchAppointments(); // Refresh the appointment list
    } catch (err) {
      console.error('Error saving appointment:', err);
      showAlert('Failed to save appointment. Please try again.', 'error');
      
      // For demo, simulate successful operation
      handleCloseDialog();
      fetchAppointments();
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`http://localhost:8080/api/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showAlert('Appointment cancelled successfully', 'success');
        fetchAppointments(); // Refresh the appointment list
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        showAlert('Failed to cancel appointment. Please try again.', 'error');
        
        // For demo, simulate successful operation
        fetchAppointments();
      }
    }
  };

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Appointments
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<CalendarIcon />}
          onClick={() => handleOpenDialog()}
        >
          Book New Appointment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment.id}>
              <Card 
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" component="div">
                      {appointment.treatmentName}
                    </Typography>
                    <Chip 
                      label={appointment.status} 
                      color={getStatusChipColor(appointment.status)}
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {appointment.doctorName}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {appointment.date}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {appointment.time}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <MedicalIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {appointment.reason}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(appointment)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteAppointment(appointment.id)}
                  >
                    Cancel
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                You don't have any appointments yet. Book your first appointment now!
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Appointment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Appointment' : 'Book New Appointment'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="doctor-select-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-select-label"
                  id="doctor-select"
                  value={selectedDoctor}
                  label="Doctor"
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="treatment-select-label">Treatment</InputLabel>
                <Select
                  labelId="treatment-select-label"
                  id="treatment-select"
                  value={selectedTreatment}
                  label="Treatment"
                  onChange={(e) => setSelectedTreatment(e.target.value)}
                >
                  {treatments.map((treatment) => (
                    <MenuItem key={treatment.id} value={treatment.id}>
                      {treatment.name} - ${treatment.cost}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Appointment Date"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      margin: 'normal' 
                    } 
                  }}
                  disablePast
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Appointment Time"
                  value={selectedTime}
                  onChange={(newTime) => setSelectedTime(newTime)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      margin: 'normal' 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason for Visit"
                multiline
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update Appointment' : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerts */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Appointments; 