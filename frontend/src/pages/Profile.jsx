import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit,
  Save,
  HealthAndSafety,
  Info,
  Person,
  Email,
  Phone,
  HomeOutlined,
  CalendarToday,
  Badge,
  VerifiedUser
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API from '../services/ApiService';

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: ''
  });
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check for selected plan from insurance directory
  useEffect(() => {
    if (location.state?.selectedPlanId && isAuthenticated) {
      setSelectedPlan(location.state.selectedPlanId);
      window.history.replaceState({}, document.title);

      assignInsurancePlan(location.state.selectedPlanId);
    }
  }, [location.state, isAuthenticated]);

  // Fetch insurance plans
  useEffect(() => {
    const fetchInsurancePlans = async () => {
      setLoadingPlans(true);
      try {
        const response = await API.get('/api/insurance');
        console.log('Fetched insurance plans:', response.data);

        // Handle different types of response data
        let plansData = response.data;

        // If response is a string, try to parse it
        if (typeof plansData === 'string') {
          try {
            try {
              plansData = JSON.parse(plansData);
            } catch (initialParseError) {
              console.warn('Direct JSON parse failed, attempting to clean JSON first', initialParseError);

              const cleanJson = plansData
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure proper quotes around keys
                .replace(/'/g, '"')                                  // Replace single quotes with double quotes
                .replace(/,(\s*[}\]])/g, '$1')                       // Remove trailing commas
                .replace(/\n/g, ' ')                                 // Remove newlines
                .replace(/\r/g, ' ')                                 // Remove carriage returns
                .replace(/\t/g, ' ');                                // Remove tabs

              try {
                plansData = JSON.parse(cleanJson);
              } catch (cleanParseError) {
                console.error('Failed to parse cleaned JSON:', cleanParseError);
                throw new Error('Unable to parse insurance plan data: ' + cleanParseError.message);
              }
            }
          } catch (parseError) {
            console.error('All JSON parsing attempts failed:', parseError);
            setNotification({
              open: true,
              message: 'Invalid insurance data format received',
              severity: 'error'
            });
            setInsurancePlans([]);
            setLoadingPlans(false);
            return;
          }
        }

        
        if (!Array.isArray(plansData)) {
          console.warn('Insurance plans data is not an array:', plansData);

          
          if (plansData && typeof plansData === 'object' && Array.isArray(plansData.plans)) {
            plansData = plansData.plans;
          } else if (plansData && typeof plansData === 'object' && Array.isArray(plansData.data)) {
            plansData = plansData.data;
          } else {
          
            plansData = plansData ? [plansData] : [];
          }
        }

        
        const validPlans = plansData.filter(plan => {
          return plan && typeof plan === 'object' && (plan.id || plan.planId);
        }).map(plan => {
          // Ensure each plan has a consistent structure
          return {
            id: plan.id || plan.planId || Math.random().toString(36).substr(2, 9),
            name: plan.name || plan.planName || 'Unnamed Plan',
            policyNumber: plan.policyNumber || plan.policy || '',
            coverage: plan.coverage || plan.coverageDetails || '',
            provider: plan.provider || plan.providerName || 'Unknown Provider'
          };
        });

        setInsurancePlans(validPlans);
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
        setInsurancePlans([]);
        setNotification({
          open: true,
          message: 'Failed to load insurance plans: ' + (error.message || 'Unknown error'),
          severity: 'error'
        });
      } finally {
        setLoadingPlans(false);
      }
    };

    if (isAuthenticated) {
      fetchInsurancePlans();
    }
  }, [isAuthenticated]);

  
  useEffect(() => {
    console.log('Current user in Profile component:', user);

    // First try to get user data from context
    if (user) {
      console.log('Setting form data from user context:', {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || ''
      });

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || ''
      });

      if (user.insurancePlan) {
        setSelectedPlan(user.insurancePlan.id);
      }
    }
    
    else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Setting form data from localStorage:', parsedUser);

          setFormData({
            firstName: parsedUser.firstName || '',
            lastName: parsedUser.lastName || '',
            email: parsedUser.email || '',
            phoneNumber: parsedUser.phoneNumber || '',
            address: parsedUser.address || '',
            dateOfBirth: parsedUser.dateOfBirth || ''
          });

          if (parsedUser.insurancePlan) {
            setSelectedPlan(parsedUser.insurancePlan.id);
          }
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
  }, [user]);

  
  useEffect(() => {
    console.log('Profile component mounted');

    
    const handleBeforeUnload = () => {
      const storedUser = localStorage.getItem('user');
      console.log('Before page unload - localStorage user data:', storedUser);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    
    const storedUser = localStorage.getItem('user');
    console.log('On mount - localStorage user data:', storedUser);

    return () => {
      console.log('Profile component unmounting');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInsurancePlanChange = (e) => {
    setSelectedPlan(e.target.value);
  };

  const handleEditMode = () => {
    setEditMode(!editMode);

    
    if (editMode && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user?.token) {
      setNotification({
        open: true,
        message: 'Please log in to update your profile',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting profile update with data:', formData);

      const response = await axios.put(
        '/api/users/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Profile update response:', response.data);

      
      const updatedUser = {
        ...user,
        ...response.data,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth
      };

      console.log('Updated user data:', updatedUser);

      
      updateUser(updatedUser);

      
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const assignInsurancePlan = async (planId = null) => {
    const planToAssign = planId || selectedPlan;

    if (!planToAssign) {
      setNotification({
        open: true,
        message: 'Please select an insurance plan',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      console.log(`Attempting to assign plan ID: ${planToAssign} to user ID: ${user.id}`);

      const response = await axios.post(
        `/api/users/${user.id}/assign-insurance`,
        { planId: planToAssign },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Assignment response:', response.data);

      
      if (response.data && response.data.user) {
        const updatedUser = {
          ...user,
          ...response.data.user
        };

        
        updateUser(updatedUser);

  
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setNotification({
          open: true,
          message: 'Insurance plan assigned successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error assigning insurance plan:', err);

      
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Failed to assign insurance plan. Please try again.';

      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const navigateToInsuranceDirectory = () => {
    console.log('Navigating to insurance directory');
    navigate('/insurance-directory');
  };

  
  const handleSubmitLocal = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setNotification({
        open: true,
        message: 'Please log in to update your profile',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Updating profile locally:', formData);

      // Create updated user with form data
      const updatedUser = {
        ...user,
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phoneNumber: formData.phoneNumber || '',
        address: formData.address || '',
        dateOfBirth: formData.dateOfBirth || ''
      };

      console.log('Updated user before context update:', updatedUser);

      // Update user in context
      updateUser(updatedUser);

      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const mergedUser = {
        ...currentUser,
        ...updatedUser
      };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      console.log('User data saved to localStorage directly:', mergedUser);

      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile locally:', err);
      setNotification({
        open: true,
        message: 'Failed to update profile locally',
        severity: 'error'
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Please log in to view your profile</Alert>
      </Container>
    );
  }

  // Get the insurance plan selected by the user, if any
  const selectedPlanDetails = Array.isArray(insurancePlans) && insurancePlans.length > 0
    ? insurancePlans.find(plan => plan.id === selectedPlan)
    : null;

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="500" gutterBottom>
          Your Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and insurance preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Header & Insurance Card */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Profile Card */}
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'visible' }}>
              <Box sx={{
                position: 'relative',
                bgcolor: 'primary.main',
                height: 100,
                borderRadius: '8px 8px 0 0'
              }} />
              <CardContent sx={{ position: 'relative', pt: 0 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    border: '4px solid white',
                    position: 'relative',
                    top: -50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'primary.dark',
                    mb: -4
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                    {user?.username || 'User'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {user?.email || ''}
                  </Typography>

                  {user?.policyNumber && (
                    <Chip
                      icon={<VerifiedUser fontSize="small" />}
                      label="Insured"
                      color="success"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={editMode ? <Save /> : <Edit />}
                    onClick={editMode ? handleSubmitLocal : handleEditMode}
                    sx={{ width: '100%' }}
                  >
                    {editMode ? 'Save Profile' : 'Edit Profile'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Insurance Card */}
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HealthAndSafety color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Insurance Information</Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {user?.policyNumber ? (
                  <Box>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Policy Number
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.policyNumber}
                        </Typography>
                      </Box>
                      <Box>
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Stack>

                    {user?.insurancePlan && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Plan Details
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {user.insurancePlan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Provider
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {user.insurancePlan.provider}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Coverage
                        </Typography>
                        <Typography variant="body2">
                          {user.insurancePlan.coverage}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No insurance plan selected. Choose a plan to generate a policy number.
                  </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Insurance Plan</InputLabel>
                    <Select
                      value={selectedPlan}
                      onChange={handleInsurancePlanChange}
                      label="Insurance Plan"
                      disabled={loadingPlans}
                    >
                      <MenuItem value="">
                        <em>Select a plan</em>
                      </MenuItem>
                      {Array.isArray(insurancePlans) ? insurancePlans.map(plan => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name} ({plan.provider})
                        </MenuItem>
                      )) : (
                        <MenuItem value="">
                          <em>Loading plans...</em>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => assignInsurancePlan()}
                      disabled={!selectedPlan || loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                      fullWidth
                      size="small"
                    >
                      {user?.policyNumber ? 'Update Plan' : 'Assign Plan'}
                    </Button>
                    <Tooltip title="Browse available insurance plans">
                      <Button
                        variant="outlined"
                        onClick={navigateToInsuranceDirectory}
                        startIcon={<Info />}
                        size="small"
                      >
                        View All
                      </Button>
                    </Tooltip>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column - Personal Information */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Personal Information</Typography>
                </Box>

                {editMode && (
                  <Chip
                    label="Editing"
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleSubmitLocal}>
                <Grid container spacing={3}>
                  <Grid item sm={6} xs={12}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant={editMode ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                      }}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant={editMode ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant={editMode ? "outlined" : "filled"}
                      type="email"
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                      }}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant={editMode ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                      }}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant={editMode ? "outlined" : "filled"}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant={editMode ? "outlined" : "filled"}
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: <HomeOutlined sx={{ mr: 1, mt: 1, color: 'text.secondary' }} fontSize="small" />
                      }}
                    />
                  </Grid>
                </Grid>

                {editMode && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => setEditMode(false)}
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;