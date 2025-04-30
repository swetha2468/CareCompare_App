import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Box,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  CalendarMonth,
  Favorite,
  MedicalServices,
  LocalHospital,
  InsertChart,
  History
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, fetchUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    recentVisits: [],
    upcomingAppointments: [],
    savedHospitals: [],
    insuranceClaims: []
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const navigate = useNavigate();

  // Refresh user data when dashboard loads
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        // Only refresh if it hasn't been refreshed in the last 30 seconds
        const lastRefresh = localStorage.getItem('lastUserDataRefresh');
        const now = Date.now();
        const shouldRefresh = !lastRefresh || (now - parseInt(lastRefresh, 10)) > 30000;

        if (shouldRefresh) {
          console.log('Dashboard: refreshing user data');
          // Track this refresh attempt
          localStorage.setItem('lastUserDataRefresh', now.toString());
          await fetchUserData(false); // Don't force refresh to avoid duplicate API calls
        } else {
          console.log('Skipping user data refresh, was refreshed recently');
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
        // Continue with dashboard loading regardless of user data refresh
      }
    };

    refreshUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Load booked appointments from localStorage
        let bookedAppointments = JSON.parse(localStorage.getItem('bookedAppointments') || '[]');

        // Ensure each appointment has a unique ID
        bookedAppointments = bookedAppointments.map(appointment => {
          if (!appointment.id) {
            // Generate a unique ID if missing
            const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
            return { ...appointment, id: uniqueId };
          }
          return appointment;
        });

        // Save back the appointments with IDs
        localStorage.setItem('bookedAppointments', JSON.stringify(bookedAppointments));

        setTimeout(() => {
          setUserStats({
            recentVisits: [
              { id: 1, date: '2023-10-15', hospital: 'General Hospital', reason: 'Annual Checkup' },
              { id: 2, date: '2023-09-05', hospital: 'City Medical Center', reason: 'Flu Symptoms' }
            ],
            upcomingAppointments: bookedAppointments,
            savedHospitals: [
              { id: 1, name: 'General Hospital', rating: 4.5 },
              { id: 2, name: 'City Medical Center', rating: 4.2 },
              { id: 3, name: 'University Hospital', rating: 4.8 }
            ],
            insuranceClaims: [
              { id: 1, date: '2023-10-10', amount: '$250.00', status: 'Approved' },
              { id: 2, date: '2023-09-01', amount: '$750.00', status: 'Pending' }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleReschedule = (appointment) => {
    navigate('/appointment-form', {
      state: {
        appointmentToEdit: appointment,
        isReschedule: true
      }
    });
  };

  const handleCancelClick = (appointmentId) => {
    const appointment = userStats.upcomingAppointments.find(a => a.id === appointmentId);
    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (!appointmentToCancel || appointmentToCancel.id === undefined) {
      console.error("Cannot cancel appointment: No valid appointment selected");
      setCancelDialogOpen(false);
      return;
    }

    console.log("Cancelling appointment with ID:", appointmentToCancel.id);

    const updatedAppointments = userStats.upcomingAppointments.filter(
      appt => appt.id !== appointmentToCancel.id
    );

    console.log("Updated appointments:", updatedAppointments);
    localStorage.setItem('bookedAppointments', JSON.stringify(updatedAppointments));

    setUserStats(prev => ({
      ...prev,
      upcomingAppointments: updatedAppointments
    }));

    setCancelDialogOpen(false);
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Limit to 3 upcoming appointments
  const displayedAppointments = userStats.upcomingAppointments.slice(0, 3);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              backgroundImage: 'linear-gradient(120deg, #e0f7fa 0%, #bbdefb 100%)',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  mr: 2
                }}
              >
                {user?.username?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {user?.firstName || user?.username || 'User'}!
                </Typography>
                <Typography variant="body1">
                  Here's your health dashboard overview.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Quick Actions"
              subheader="Access common features"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} key="find-hospital">
                  <Button
                    component={RouterLink}
                    to="/hospital-finder"
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<LocalHospital />}
                    sx={{ py: 1.5 }}
                  >
                    Find Hospital
                  </Button>
                </Grid>
                <Grid item xs={6} key="check-symptoms">
                  <Button
                    component={RouterLink}
                    to="/symptom-checker"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    startIcon={<MedicalServices />}
                    sx={{ py: 1.5 }}
                  >
                    Check Symptoms
                  </Button>
                </Grid>
                <Grid item xs={6} key="insurance-plans">
                  <Button
                    component={RouterLink}
                    to="/insurance-directory"
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<InsertChart />}
                    sx={{ py: 1.5 }}
                  >
                    Insurance Plans
                  </Button>
                </Grid>
                <Grid item xs={6} key="compare-hospitals">
                  <Button
                    component={RouterLink}
                    to="/hospital-comparison"
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    startIcon={<Favorite />}
                    sx={{ py: 1.5 }}
                  >
                    Compare Hospitals
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Upcoming Appointments"
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<CalendarMonth color="primary" />}
            />
            <CardContent>
              {userStats.upcomingAppointments.length > 0 ? (
                <>
                  <List>
                    {displayedAppointments.map((appointment) => (
                      <ListItem key={`appointment-${appointment.id || Date.now() + Math.random()}`}>
                        <ListItemIcon>
                          <MedicalServices color="secondary" />
                        </ListItemIcon>
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
                          size="small"
                          color="error"
                          onClick={() => handleCancelClick(appointment.id)}
                        >
                          Cancel
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                  {userStats.upcomingAppointments.length > 3 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        component={RouterLink}
                        to="/all-appointments"
                        variant="text"
                        color="primary"
                      >
                        View All ({userStats.upcomingAppointments.length})
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', my: 3 }}>
                  No upcoming appointments
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/appointment-form"
                  variant="contained"
                  color="primary"
                >
                  Schedule New Appointment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Saved Hospitals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Saved Hospitals"
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<Favorite color="error" />}
            />
            <CardContent>
              {userStats.savedHospitals.length > 0 ? (
                <List>
                  {userStats.savedHospitals.map((hospital) => (
                    <ListItem key={`hospital-${hospital.id}`}>
                      <ListItemIcon>
                        <LocalHospital />
                      </ListItemIcon>
                      <ListItemText
                        primary={hospital.name}
                        secondary={`Rating: ${hospital.rating}/5`}
                      />
                      <Button
                        component={RouterLink}
                        to={`/hospitals/${hospital.id}`}
                        variant="outlined"
                        size="small"
                      >
                        View
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', my: 3 }}>
                  No saved hospitals
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Medical Visits */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recent Medical History"
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<History color="primary" />}
            />
            <Divider />
            <CardContent>
              {userStats.recentVisits.length > 0 ? (
                <List>
                  {userStats.recentVisits.map((visit) => (
                    <ListItem key={`visit-${visit.id}`}>
                      <ListItemIcon>
                        <MedicalServices />
                      </ListItemIcon>
                      <ListItemText
                        primary={visit.reason}
                        secondary={`${visit.hospital} - ${visit.date}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', my: 3 }}>
                  No recent visits
                </Typography>
              )}
              <Button
                variant="text"
                color="primary"
                sx={{ mt: 1 }}
                fullWidth
              >
                View Full Medical History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Insurance Claims */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Recent Insurance Claims"
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<InsertChart color="primary" />}
            />
            <Divider />
            <CardContent>
              {userStats.insuranceClaims.length > 0 ? (
                <List>
                  {userStats.insuranceClaims.map((claim) => (
                    <ListItem key={`claim-${claim.id}`}>
                      <ListItemIcon>
                        {claim.status === 'Approved' ? (
                          <Favorite color="success" />
                        ) : (
                          <Favorite color="action" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={`Claim #${claim.id} - ${claim.amount}`}
                        secondary={`${claim.date} - Status: ${claim.status}`}
                      />
                      <Button variant="outlined" size="small">
                        Details
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', my: 3 }}>
                  No recent claims
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<InsertChart />}
                >
                  Submit New Claim
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
    </Container>
  );
};

export default Dashboard;