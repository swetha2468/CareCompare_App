import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Rating,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  CardActions
} from '@mui/material';
import { Search, Check, Info, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { InsuranceService } from '../services/ApiService';

const InsuranceDirectory = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    provider: '',
    rating: null
  });

  // Items per page
  const itemsPerPage = 5;

  // Fetch insurance plans from API
  useEffect(() => {
    const fetchInsurancePlans = async () => {
      setLoading(true);
      try {
        console.log('Starting insurance plans fetch using InsuranceService...');

        // Try the regular endpoint first
        let response;
        try {
          response = await InsuranceService.getAllPlans();
          console.log('Raw API response:', response);
        } catch (mainApiError) {
          console.error('Error with main API endpoint:', mainApiError);
          console.log('Trying debug endpoint as fallback...');
          // Fallback to debug endpoint if main endpoint fails
          response = await InsuranceService.getDebugPlans();
          console.log('Debug API response:', response);
        }

        // Make sure we have data to work with
        if (!response || !response.data) {
          console.error('No data received from API');
          throw new Error('No data received from API');
        }

        // Ensure plansData is an array
        let plansData = response.data;
        console.log('Received insurance data:', plansData);

        // Ensure we're working with an array
        if (!Array.isArray(plansData)) {
          console.error('Insurance plans data is not an array:', plansData);

          // If it's an object with a plans property, try to use that
          if (plansData && typeof plansData === 'object' && Array.isArray(plansData.plans)) {
            console.log('Using plans property from object');
            plansData = plansData.plans;
          } else if (plansData && typeof plansData === 'object' && Array.isArray(plansData.data)) {
            // Check for data property too (common API pattern)
            console.log('Using data property from object');
            plansData = plansData.data;
          } else if (plansData && typeof plansData === 'object') {
            // If it's a single object, convert to array
            console.log('Converting single object to array');
            plansData = [plansData];
          } else {
            // Create empty array as fallback
            console.log('Creating empty array as fallback');
            plansData = [];
          }
        }

        console.log('Final insurance plans array:', plansData);

        // If still no plans, create fallback data
        if (plansData.length === 0) {
          console.log('No plans found in response, using fallback data');
          plansData = createFallbackPlans();
        }

        // Add rating property for UI purposes if not present
        const plansWithRatings = plansData.map(plan => ({
          ...plan,
          rating: plan.rating || calculateMockRating(plan.name)
        }));

        console.log('Final insurance plans with ratings:', plansWithRatings);
        setInsurancePlans(plansWithRatings);
        setError(null);
      } catch (err) {
        console.error('Error fetching insurance plans:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load insurance plans. Using sample data for demonstration.');

        // Use fallback data in case of error
        const fallbackPlans = createFallbackPlans();
        const plansWithRatings = fallbackPlans.map(plan => ({
          ...plan,
          rating: calculateMockRating(plan.name)
        }));
        setInsurancePlans(plansWithRatings);
      } finally {
        setLoading(false);
      }
    };

    fetchInsurancePlans();
  }, []);

  // Create fallback insurance plans for demo 
  const createFallbackPlans = () => {
    return [
      {
        id: 1,
        name: "Basic Coverage Plan",
        provider: "Blue Cross",
        benefits: "Annual checkups, emergency care, and preventive services",
        coverage: "Basic coverage - 70% coinsurance after deductible",
        policyNumber: "BC001-DEMO"
      },
      {
        id: 2,
        name: "Premium Family Plan",
        provider: "Blue Cross",
        benefits: "Comprehensive coverage including dental, vision, and mental health services",
        coverage: "Premium coverage - 90% coinsurance, low deductible",
        policyNumber: "BC002-DEMO"
      },
      {
        id: 3,
        name: "Standard Individual Plan",
        provider: "Aetna",
        benefits: "Hospitalization, prescription drugs, specialist visits, and preventive care",
        coverage: "Standard coverage - 80% coinsurance with moderate deductible",
        policyNumber: "AET100-DEMO"
      },
      {
        id: 4,
        name: "Gold Senior Plan",
        provider: "UnitedHealth",
        benefits: "Designed for seniors with additional coverage for chronic conditions",
        coverage: "Comprehensive coverage - 85% coinsurance with Medicare coordination",
        policyNumber: "UHC500-DEMO"
      },
      {
        id: 5,
        name: "Silver Plus Plan",
        provider: "Cigna",
        benefits: "Mid-tier coverage with focus on preventive care and wellness programs",
        coverage: "Mid-tier coverage - 75% coinsurance with wellness incentives",
        policyNumber: "CIG250-DEMO"
      }
    ];
  };

  // Calculate a mock rating based on plan name for demo 
  const calculateMockRating = (name) => {
    if (!name) return 3.0;
    // Use the string length to generate a "random" rating between 3.0 and 5.0
    const baseRating = 3.0;
    const nameValue = name.length % 5;
    return Math.min(5, baseRating + (nameValue * 0.5));
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  // Handle filter changes
  const handleFilterChange = (e, filterType) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      [filterType]: filterType === 'rating' && value !== '' ? parseFloat(value) : value
    });
    setPage(1); // Reset to first page on filter change
  };

  // Handle pagination changes
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle selecting a plan
  const handleSelectPlan = (planId) => {
    navigate(`/profile`, { state: { selectedPlanId: planId } });
  };

  // Filter and search providers
  const filteredPlans = insurancePlans.filter(plan => {
    // Apply search filter
    const matchesSearch = searchTerm === '' ||
      (plan.name && plan.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (plan.provider && plan.provider.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (plan.benefits && plan.benefits.toLowerCase().includes(searchTerm.toLowerCase()));

    // Apply provider filter
    const matchesProvider = filters.provider === '' ||
      (plan.provider && plan.provider === filters.provider);

    // Apply rating filter
    const matchesRating = filters.rating === null ||
      (plan.rating && plan.rating >= filters.rating);

    return matchesSearch && matchesProvider && matchesRating;
  });

  // Get unique providers for the filter dropdown
  const uniqueProviders = [...new Set(insurancePlans.map(plan => plan.provider))].filter(Boolean);

  // Calculate pagination
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlans = filteredPlans.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);

  // Render rating stars
  const renderRating = (rating) => {
    return (
      <Rating
        value={rating || 0}
        precision={0.5}
        readOnly
      />
    );
  };

  // Render coverage chips
  const renderCoverage = (coverage) => {
    if (!coverage) return null;

    // If coverage is a string, split it at commas or semicolons
    const coverageItems = typeof coverage === 'string'
      ? coverage.split(/[,;]/).map(item => item.trim()).filter(Boolean)
      : Array.isArray(coverage) ? coverage : [];

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {coverageItems.map((item, index) => (
          <Chip
            key={index}
            label={item}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    );
  };

  // Determine if a plan is already assigned to the user
  const isPlanAssigned = (planId) => {
    return isAuthenticated &&
      user?.insurancePlan &&
      user.insurancePlan.id === planId;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
          aria-label="Go back"
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Insurance Directory
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Find and compare insurance plans to suit your healthcare needs
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search insurance plans"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Provider</InputLabel>
              <Select
                value={filters.provider}
                onChange={(e) => handleFilterChange(e, 'provider')}
                label="Provider"
              >
                <MenuItem value="">All Providers</MenuItem>
                {uniqueProviders.map((provider, index) => (
                  <MenuItem key={index} value={provider}>{provider}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Minimum Rating</InputLabel>
              <Select
                value={filters.rating !== null ? filters.rating.toString() : ''}
                onChange={(e) => handleFilterChange(e, 'rating')}
                label="Minimum Rating"
              >
                <MenuItem value="">Any Rating</MenuItem>
                <MenuItem value="3">3+ Stars</MenuItem>
                <MenuItem value="3.5">3.5+ Stars</MenuItem>
                <MenuItem value="4">4+ Stars</MenuItem>
                <MenuItem value="4.5">4.5+ Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Results count */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredPlans.length} {filteredPlans.length === 1 ? 'plan' : 'plans'} found
            </Typography>
          </Box>

          {/* Insurance plans list */}
          {paginatedPlans.length > 0 ? (
            <Grid container spacing={3}>
              {paginatedPlans.map((plan) => (
                <Grid item xs={12} key={plan.id}>
                  <Card
                    elevation={2}
                    sx={{
                      borderLeft: isPlanAssigned(plan.id) ? '4px solid #4caf50' : 'none',
                      position: 'relative'
                    }}
                  >
                    {isPlanAssigned(plan.id) && (
                      <Chip
                        label="Your Current Plan"
                        color="success"
                        icon={<Check />}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16
                        }}
                      />
                    )}
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Typography variant="h6" gutterBottom>
                            {plan.name}
                          </Typography>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            {plan.provider}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {renderRating(plan.rating)}
                          </Box>

                          <Typography variant="body2" paragraph>
                            {plan.benefits || "No description available."}
                          </Typography>

                          <Typography variant="subtitle2" gutterBottom>
                            Coverage:
                          </Typography>
                          {renderCoverage(plan.coverage)}
                        </Grid>

                        <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Tooltip title="Plan details and comparison">
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Info />}
                                fullWidth
                                sx={{ mb: 1 }}
                              >
                                Plan Details
                              </Button>
                            </Tooltip>

                            <Button
                              variant="contained"
                              color="primary"
                              disabled={isPlanAssigned(plan.id)}
                              onClick={() => handleSelectPlan(plan.id)}
                              fullWidth
                            >
                              {isPlanAssigned(plan.id) ? 'Current Plan' : 'Select Plan'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No insurance plans match your search criteria. Try adjusting your filters.
            </Alert>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default InsuranceDirectory; 