import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Slider,
  Divider,
  Alert
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ComparePlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    state: '',
    zipCode: '',
    planType: '',
    maxMonthlyPremium: 500,
    coverageLevel: ''
  });
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);

  // Mock data for available plans
  const mockPlans = [
    {
      id: 1,
      name: "Blue Cross Premium",
      provider: "Blue Cross Blue Shield",
      type: "PPO",
      state: "CA",
      monthlyPremium: 450,
      annualDeductible: 1500,
      outOfPocketMax: 5000,
      coverageLevel: "Gold",
      coInsurance: 20,
      doctorVisit: 25,
      specialistVisit: 40,
      emergencyRoom: 250,
      hospitalStay: "20% after deductible",
      prescriptionCoverage: "Tier 1: $10, Tier 2: $40, Tier 3: $70",
      networkSize: "Large",
      additionalBenefits: ["Dental", "Vision", "Mental Health"]
    },
    {
      id: 2,
      name: "Aetna Value Plan",
      provider: "Aetna",
      type: "HMO",
      state: "CA",
      monthlyPremium: 350,
      annualDeductible: 2500,
      outOfPocketMax: 7000,
      coverageLevel: "Silver",
      coInsurance: 30,
      doctorVisit: 30,
      specialistVisit: 60,
      emergencyRoom: 350,
      hospitalStay: "30% after deductible",
      prescriptionCoverage: "Tier 1: $15, Tier 2: $50, Tier 3: $90",
      networkSize: "Medium",
      additionalBenefits: ["Dental", "Wellness Program"]
    },
    {
      id: 3,
      name: "United Basic",
      provider: "United Healthcare",
      type: "EPO",
      state: "CA",
      monthlyPremium: 250,
      annualDeductible: 4000,
      outOfPocketMax: 8500,
      coverageLevel: "Bronze",
      coInsurance: 40,
      doctorVisit: 40,
      specialistVisit: 80,
      emergencyRoom: 500,
      hospitalStay: "40% after deductible",
      prescriptionCoverage: "Tier 1: $20, Tier 2: $65, Tier 3: $120",
      networkSize: "Small",
      additionalBenefits: ["Telehealth"]
    },
    {
      id: 4,
      name: "Kaiser Platinum",
      provider: "Kaiser Permanente",
      type: "HMO",
      state: "CA",
      monthlyPremium: 550,
      annualDeductible: 0,
      outOfPocketMax: 4000,
      coverageLevel: "Platinum",
      coInsurance: 10,
      doctorVisit: 15,
      specialistVisit: 30,
      emergencyRoom: 150,
      hospitalStay: "10% after deductible",
      prescriptionCoverage: "Tier 1: $5, Tier 2: $25, Tier 3: $50",
      networkSize: "Large",
      additionalBenefits: ["Dental", "Vision", "Maternity", "Mental Health"]
    }
  ];

  // Simulates fetching plans from an API
  useEffect(() => {
    setAvailablePlans(mockPlans);
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterCriteria({
      ...filterCriteria,
      [name]: value
    });
  };

  const handlePremiumChange = (event, newValue) => {
    setFilterCriteria({
      ...filterCriteria,
      maxMonthlyPremium: newValue
    });
  };

  const handleSearch = () => {
    setLoading(true);
    setError(null);
    
    // Simulate API call with delay
    setTimeout(() => {
      try {
        // Filter plans based on criteria
        const filtered = mockPlans.filter(plan => {
          if (filterCriteria.state && plan.state !== filterCriteria.state) return false;
          if (filterCriteria.planType && plan.type !== filterCriteria.planType) return false;
          if (filterCriteria.coverageLevel && plan.coverageLevel !== filterCriteria.coverageLevel) return false;
          if (plan.monthlyPremium > filterCriteria.maxMonthlyPremium) return false;
          return true;
        });
        
        setAvailablePlans(filtered);
        setLoading(false);
      } catch (err) {
        setError("Error fetching plans. Please try again.");
        setLoading(false);
      }
    }, 1000);
  };

  const handleSelectPlan = (plan) => {
    if (selectedPlans.find(p => p.id === plan.id)) {
      setSelectedPlans(selectedPlans.filter(p => p.id !== plan.id));
    } else {
      if (selectedPlans.length < 3) {
        setSelectedPlans([...selectedPlans, plan]);
      } else {
        setError("You can compare up to 3 plans at a time.");
      }
    }
  };

  const isPlanSelected = (plan) => {
    return selectedPlans.some(p => p.id === plan.id);
  };

  // Features to compare (for the comparison table)
  const features = [
    "Monthly Premium",
    "Annual Deductible",
    "Out-of-Pocket Maximum",
    "Co-Insurance",
    "Primary Doctor Visit",
    "Specialist Visit",
    "Emergency Room",
    "Hospital Stay",
    "Prescription Coverage",
    "Network Size",
    "Additional Benefits"
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Compare Insurance Plans
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter Plans
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={filterCriteria.zipCode}
                onChange={handleFilterChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={filterCriteria.state}
                  label="State"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All States</MenuItem>
                  <MenuItem value="CA">California</MenuItem>
                  <MenuItem value="NY">New York</MenuItem>
                  <MenuItem value="TX">Texas</MenuItem>
                  <MenuItem value="FL">Florida</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Plan Type</InputLabel>
                <Select
                  name="planType"
                  value={filterCriteria.planType}
                  label="Plan Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Plans</MenuItem>
                  <MenuItem value="PPO">PPO</MenuItem>
                  <MenuItem value="HMO">HMO</MenuItem>
                  <MenuItem value="EPO">EPO</MenuItem>
                  <MenuItem value="POS">POS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Coverage Level</InputLabel>
                <Select
                  name="coverageLevel"
                  value={filterCriteria.coverageLevel}
                  label="Coverage Level"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="Bronze">Bronze</MenuItem>
                  <MenuItem value="Silver">Silver</MenuItem>
                  <MenuItem value="Gold">Gold</MenuItem>
                  <MenuItem value="Platinum">Platinum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>
                Maximum Monthly Premium: ${filterCriteria.maxMonthlyPremium}
              </Typography>
              <Slider
                value={filterCriteria.maxMonthlyPremium}
                onChange={handlePremiumChange}
                min={100}
                max={1000}
                step={50}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `$${value}`}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Search Plans"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Available Plans Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Available Plans {availablePlans.length > 0 && `(${availablePlans.length})`}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select up to 3 plans to compare
          </Typography>
        </Grid>
        
        {loading ? (
          <Grid item xs={12} textAlign="center">
            <CircularProgress />
          </Grid>
        ) : availablePlans.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No plans found matching your criteria. Try adjusting your filters.
            </Alert>
          </Grid>
        ) : (
          availablePlans.map(plan => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderColor: isPlanSelected(plan) ? 'primary.main' : 'grey.300',
                  position: 'relative'
                }}
              >
                {isPlanSelected(plan) && (
                  <Chip 
                    label="Selected" 
                    color="primary" 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10 
                    }} 
                  />
                )}
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {plan.provider} • {plan.type}
                  </Typography>
                  <Chip 
                    label={plan.coverageLevel} 
                    size="small" 
                    sx={{ mb: 2 }} 
                    color={
                      plan.coverageLevel === "Platinum" ? "success" :
                      plan.coverageLevel === "Gold" ? "primary" :
                      plan.coverageLevel === "Silver" ? "secondary" : "default"
                    }
                  />
                  <Typography variant="h5" component="div" gutterBottom sx={{ color: 'primary.main' }}>
                    ${plan.monthlyPremium}/mo
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Annual Deductible: ${plan.annualDeductible}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Out-of-Pocket Max: ${plan.outOfPocketMax}
                  </Typography>
                  <Button 
                    variant={isPlanSelected(plan) ? "outlined" : "contained"} 
                    fullWidth 
                    onClick={() => handleSelectPlan(plan)}
                    sx={{ mt: 2 }}
                  >
                    {isPlanSelected(plan) ? "Remove from Comparison" : "Add to Comparison"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Comparison Section */}
      {selectedPlans.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CompareArrowsIcon sx={{ mr: 1 }} /> Plan Comparison
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Feature</strong></TableCell>
                  {selectedPlans.map(plan => (
                    <TableCell key={plan.id}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.provider}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {features.map((feature, index) => (
                  <TableRow key={index} sx={{ background: index % 2 ? 'rgba(0,0,0,0.02)' : 'white' }}>
                    <TableCell component="th" scope="row">
                      <strong>{feature}</strong>
                    </TableCell>
                    {selectedPlans.map(plan => (
                      <TableCell key={plan.id}>
                        {feature === "Monthly Premium" && `$${plan.monthlyPremium}`}
                        {feature === "Annual Deductible" && `$${plan.annualDeductible}`}
                        {feature === "Out-of-Pocket Maximum" && `$${plan.outOfPocketMax}`}
                        {feature === "Co-Insurance" && `${plan.coInsurance}%`}
                        {feature === "Primary Doctor Visit" && `$${plan.doctorVisit}`}
                        {feature === "Specialist Visit" && `$${plan.specialistVisit}`}
                        {feature === "Emergency Room" && `$${plan.emergencyRoom}`}
                        {feature === "Hospital Stay" && plan.hospitalStay}
                        {feature === "Prescription Coverage" && plan.prescriptionCoverage}
                        {feature === "Network Size" && plan.networkSize}
                        {feature === "Additional Benefits" && (
                          <Box>
                            {plan.additionalBenefits.map((benefit, idx) => (
                              <Chip
                                key={idx}
                                label={benefit}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box textAlign="center" mt={4}>
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => setSelectedPlans([])}
              sx={{ mr: 2 }}
            >
              Clear Comparison
            </Button>
            <Button variant="contained" color="primary">
              Save Comparison
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ComparePlans; 