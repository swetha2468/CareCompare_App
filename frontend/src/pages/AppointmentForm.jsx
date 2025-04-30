import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppointmentService from '../services/AppointmentService';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentToEdit: appointment, isReschedule } = location.state || {};
  const { user, token, isAuthenticated } = useAuth();

  // Add useEffect to verify authentication before form loads
  useEffect(() => {
    // Check if user is authenticated, if not redirect to login
    if (!isAuthenticated || !token) {
      console.error('User not authenticated, redirecting to login');
      navigate('/login', {
        state: { from: location.pathname, message: 'Please log in to book an appointment' }
      });
    } else {
      console.log('User authenticated with token:', !!token, 'User ID:', user?.id);

      // Debug: Check localStorage directly
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('User from localStorage:', parsedUser);
          // Check if the IDs don't match the database IDs 
          if (parsedUser.id && (parsedUser.id > 200)) {
            console.warn('Warning: User ID in localStorage does not match expected range (should be 101-104)');
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }
  }, [isAuthenticated, token, user, navigate, location.pathname]);

  // Mock data for doctors and specialties (replace with API call later)
  const doctors = [
    { id: 1, name: 'Dr. John Smith', specialty: 'Cardiology' },
    { id: 2, name: 'Dr. Emily Johnson', specialty: 'Orthopedics' },
    { id: 3, name: 'Dr. Michael Brown', specialty: 'Dermatology' },
    { id: 4, name: 'Dr. Sarah Davis', specialty: 'General Practice' },
  ];

  const specialties = ['Cardiology', 'Orthopedics', 'Dermatology', 'General Practice'];

  
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Appointment Details', 'Review', 'Confirmation'];

  // Initial form values based on reschedule or new appointment
  const initialValues = {
    doctor: appointment?.doctor || '',
    specialty: appointment?.specialty || '',
    appointmentDateTime: appointment
      ? new Date(`${appointment.date}T${appointment.time}`)
      : (() => {
        const date = new Date();
        date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30); // Round to next 30 min
        date.setSeconds(0);
        return date;
      })(),
    notes: appointment?.notes || '',
    hospitalId: appointment?.hospital?.id || 1, // Default hospital ID
  };

  // Validation schema
  const validationSchema = Yup.object({
    doctor: Yup.string().required('Doctor is required'),
    specialty: Yup.string().required('Specialty is required'),
    appointmentDateTime: Yup.date()
      .required('Appointment date and time are required')
      .min(new Date(), 'Date must be in the future'),
    notes: Yup.string().max(500, 'Notes must be 500 characters or less'),
    hospitalId: Yup.number().required('Hospital is required'),
  });

  // Add error state at the beginning of the component
  const [error, setError] = useState(null);

  const handleNext = (values, { setSubmitting }) => {
    if (activeStep === steps.length - 1) {
      handleSubmit(values, setSubmitting);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (values, setSubmitting) => {
    setError(null); 

    // Check if user is authenticated
    if (!isAuthenticated || !token) {
      setError('You must be logged in to book an appointment');
      setSubmitting(false);
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Please log in to book an appointment'
        }
      });
      return;
    }

    try {
      // Format date and time properly
      const dateObj = values.appointmentDateTime;
      const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

      // Format time as HH:MM:SS
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      // Get user ID directly from the authenticated user
      const userId = user?.id;

      // Verify we have a valid user ID
      if (!userId) {
        setError('User ID not available. Please log in again.');
        setSubmitting(false);
        setTimeout(() => {
          navigate('/login', {
            state: {
              from: location.pathname,
              message: 'Your session appears to be invalid. Please log in again.'
            }
          });
        }, 2000);
        return;
      }

      // Always use the user ID from the authenticated context
      const appointmentData = {
        doctor: values.doctor,
        specialty: values.specialty,
        date: formattedDate,
        time: formattedTime,
        description: values.notes || '',
        hospital: {
          id: values.hospitalId
        },
        user: {
          id: userId
        }
      };

      console.log('Token available:', !!token);
      console.log('User ID being sent:', userId);
      console.log('Full appointment data:', JSON.stringify(appointmentData, null, 2));

      // Only include id if we're updating an existing appointment
      if (isReschedule && appointment?.id) {
        appointmentData.id = appointment.id;
      }

      
      try {
        console.log('Testing appointment with debug endpoint');
        const debugResponse = await AppointmentService.testAppointment(appointmentData);
        console.log('Debug response:', debugResponse.data);
      } catch (debugError) {
        console.warn('Debug test failed:', debugError);
        // Log more detailed error info
        if (debugError.response) {
          console.warn('Debug error status:', debugError.response.status);
          console.warn('Debug error data:', debugError.response.data);
        }
      }

      try {
        console.log('Testing appointment with no-auth debug endpoint');
        const noAuthResponse = await AppointmentService.noAuthTest(appointmentData);
        console.log('No-auth debug response:', noAuthResponse.data);
      } catch (noAuthError) {
        console.warn('No-auth debug test failed:', noAuthError);
      }

      let response;
      try {
        if (isReschedule && appointment?.id) {
          response = await AppointmentService.updateAppointment(appointment.id, appointmentData);
        } else {
          console.log('Submitting appointment with token:', token ? token.substring(0, 10) + '...' : 'none');
          response = await AppointmentService.createAppointment(appointmentData);
        }

        console.log('Appointment successfully saved:', response.data);
      } catch (firstError) {
        console.error('Error with standard appointment creation, trying direct method:', firstError);

        // If the normal endpoint fails, try the direct creation endpoint
        try {
          console.log('Attempting direct appointment creation as fallback');
          response = await AppointmentService.createDirectAppointment(appointmentData);
          console.log('Direct appointment creation successful:', response.data);
        } catch (fallbackError) {
          console.error('Direct appointment creation also failed:', fallbackError);

          // Re-throw the original error to maintain the error handling flow
          throw firstError;
        }
      }

      // Sync localStorage (optional, for offline fallback)
      const existingAppointments = JSON.parse(localStorage.getItem('bookedAppointments') || '[]');

      // Generate a unique ID for new appointments
      const uniqueId = isReschedule && appointment?.id
        ? appointment.id
        : Date.now() + Math.floor(Math.random() * 1000);

      // Ensure we have a valid appointment object with ID
      const newAppointmentData = {
        ...appointmentData,
        id: uniqueId
      };

      const updatedAppointments = isReschedule
        ? existingAppointments.map(app => app.id === appointment.id ? newAppointmentData : app)
        : [...existingAppointments, newAppointmentData];

      console.log('Updated appointments array:', updatedAppointments);
      localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

      setActiveStep(2); // Move to confirmation step
      setSubmitting(false);
    } catch (error) {
      console.error('Error saving appointment:', error);

      // More detailed error logging
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data || 'No response data');
        console.error('Error response headers:', error.response.headers);
      }

      setSubmitting(false);

      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login', {
            state: {
              from: location.pathname,
              message: 'Your session expired. Please log in again to book an appointment.'
            }
          });
        }, 2000);
      } else if (error.response?.status === 400) {
        // Special handling for 400 Bad Request
        setError("Couldn't book the appointment. " + (error.response.data?.message ||
          "Make sure you've selected a hospital and doctor."));
      } else {
        setError(error.response?.data?.message || error.response?.data?.error ||
          'Failed to save appointment. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            {isReschedule ? 'Reschedule Appointment' : 'Book New Appointment'}
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleNext}
          >
            {({ values, errors, touched, setFieldValue, isValid, dirty, isSubmitting }) => (
              <Form>
                {activeStep === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={touched.doctor && !!errors.doctor}>
                        <InputLabel id="doctor-label">Doctor</InputLabel>
                        <Select
                          labelId="doctor-label"
                          id="doctor"
                          name="doctor"
                          value={values.doctor}
                          onChange={(e) => setFieldValue('doctor', e.target.value)}
                          label="Doctor"
                          required
                        >
                          {doctors.map((doctor) => (
                            <MenuItem key={doctor.id} value={doctor.name}>
                              {doctor.name} ({doctor.specialty})
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.doctor && errors.doctor && (
                          <Typography color="error" variant="caption">{errors.doctor}</Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={touched.specialty && !!errors.specialty}>
                        <InputLabel id="specialty-label">Specialty</InputLabel>
                        <Select
                          labelId="specialty-label"
                          id="specialty"
                          name="specialty"
                          value={values.specialty}
                          onChange={(e) => setFieldValue('specialty', e.target.value)}
                          label="Specialty"
                          required
                        >
                          {specialties.map((spec) => (
                            <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                          ))}
                        </Select>
                        {touched.specialty && errors.specialty && (
                          <Typography color="error" variant="caption">{errors.specialty}</Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={touched.hospitalId && !!errors.hospitalId}>
                        <InputLabel id="hospital-label">Hospital</InputLabel>
                        <Select
                          labelId="hospital-label"
                          id="hospitalId"
                          name="hospitalId"
                          value={values.hospitalId}
                          onChange={(e) => setFieldValue('hospitalId', e.target.value)}
                          label="Hospital"
                          required
                        >
                          <MenuItem value={1}>General Hospital</MenuItem>
                          <MenuItem value={2}>Memorial Hospital</MenuItem>
                          <MenuItem value={3}>University Medical Center</MenuItem>
                        </Select>
                        {touched.hospitalId && errors.hospitalId && (
                          <Typography color="error" variant="caption">{errors.hospitalId}</Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          label="Appointment Date & Time"
                          value={values.appointmentDateTime}
                          onChange={(newValue) => setFieldValue('appointmentDateTime', newValue)}
                          minDateTime={new Date()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: touched.appointmentDateTime && !!errors.appointmentDateTime,
                              helperText: touched.appointmentDateTime && errors.appointmentDateTime
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="notes"
                        name="notes"
                        label="Additional Notes"
                        value={values.notes}
                        onChange={(e) => setFieldValue('notes', e.target.value)}
                        multiline
                        rows={3}
                        error={touched.notes && !!errors.notes}
                        helperText={touched.notes && errors.notes}
                      />
                    </Grid>
                  </Grid>
                )}
                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Review Your Appointment
                    </Typography>
                    <Box sx={{ p: 2, mb: 2, borderRadius: 1, bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                      <Typography variant="body1" sx={{ mb: 1 }}><strong>Doctor:</strong> {values.doctor}</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}><strong>Specialty:</strong> {values.specialty}</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Date & Time:</strong> {values.appointmentDateTime?.toLocaleString(undefined, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Hospital:</strong> {values.hospitalId === 1 ? 'General Hospital' :
                          values.hospitalId === 2 ? 'Memorial Hospital' :
                            'University Medical Center'}
                      </Typography>
                      <Typography variant="body1"><strong>Notes:</strong> {values.notes || 'None'}</Typography>
                    </Box>
                  </Box>
                )}
                {activeStep === 2 && (
                  <Box>
                    <Alert severity="success">
                      {isReschedule ? 'Appointment rescheduled successfully!' : 'Your appointment has been booked successfully!'}
                    </Alert>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || (activeStep === 0 && (!isValid || !dirty))}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AppointmentForm;