import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Rating,
  Chip,
  Paper,
  Pagination
} from '@mui/material';
import {
  Search,
  LocationOn,
  LocalHospital,
  Phone,
  Language
} from '@mui/icons-material';
import hospitalService from '../services/HospitalService';

const HospitalFinder = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [insurance, setInsurance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const hospitalsPerPage = 5;

  // Available specialties for filter dropdown
  const specialties = [
    'Cardiology', 'Neurology', 'Oncology', 'Pediatrics',
    'Orthopedics', 'Dermatology', 'Gynecology', 'Ophthalmology'
  ];

  // Available insurance options for filter dropdown
  const insuranceProviders = [
    'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealthcare',
    'Humana', 'Medicare', 'Medicaid', 'Kaiser Permanente'
  ];

  useEffect(() => {
    // Load initial hospitals on component mount
    fetchHospitals();
  }, []);

  // Get current hospitals based on pagination
  const getCurrentHospitals = () => {
    const indexOfLastHospital = page * hospitalsPerPage;
    const indexOfFirstHospital = indexOfLastHospital - hospitalsPerPage;
    return hospitals.slice(indexOfFirstHospital, indexOfLastHospital);
  };

  const fetchHospitals = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await hospitalService.searchHospitals(params);
      setHospitals(data);
      setTotalPages(Math.ceil(data.length / hospitalsPerPage));
      setPage(1); // Reset to first page when searching
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setError('Error searching for hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const searchParams = {
      name: searchTerm,
      location: location,
      specialty: specialty,
      insurance: insurance
    };

    await fetchHospitals(searchParams);
  };

  const handleReset = () => {
    setSearchTerm('');
    setLocation('');
    setSpecialty('');
    setInsurance('');
    fetchHospitals();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: 2}}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Hospital Finder
      </Typography>
      <Typography
  variant="subtitle1"
  paragraph
  align="center"
  sx={{ color: 'primary.main' }} // or sx={{ color: '#2c7db9' }}
>
  Find hospitals that accept your insurance and meet your needs.
</Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={handleSearch} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Hospital Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Location (City, State, or ZIP)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: <LocationOn sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel id="specialty-label">Specialty</InputLabel>
                <Select
                  labelId="specialty-label"
                  value={specialty}
                  label="Specialty"
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <MenuItem value="">All Specialties</MenuItem>
                  {specialties.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel id="insurance-label">Insurance</InputLabel>
                <Select
                  labelId="insurance-label"
                  value={insurance}
                  label="Insurance"
                  onChange={(e) => setInsurance(e.target.value)}
                >
                  <MenuItem value="">All Insurance</MenuItem>
                  {insuranceProviders.map((i) => (
                    <MenuItem key={i} value={i}>{i}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ height: '100%' }}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={6} md={1}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleReset}
                sx={{ height: '100%' }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {hospitals.length} {hospitals.length === 1 ? 'hospital' : 'hospitals'} found
            </Typography>
          </Box>

          {hospitals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No hospitals found matching your criteria
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search or removing some filters
              </Typography>
            </Paper>
          ) : (
            <>
              <Grid container spacing={2}>
                {getCurrentHospitals().map((hospital) => (
                  <Grid item xs={12} key={hospital.id}>
                    <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <Grid container>
                        {/* Hospital Image */}
                        <Grid item xs={12} sm={3}>
                          <CardMedia
                            component="img"
                            sx={{ height: '100%', minHeight: 120, objectFit: 'cover' }}
                            image={hospital.imageUrl || 'https://via.placeholder.com/300x200?text=Hospital'}
                            alt={hospital.name}
                          />
                        </Grid>

                        {/* Hospital Details */}
                        <Grid item xs={12} sm={9}>
                          <CardContent sx={{ p: 2 }}>
                            {/* Hospital Name and Rating */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" component="h2" fontWeight="medium">
                                {hospital.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Rating
                                  value={parseFloat(hospital.rating)}
                                  precision={0.5}
                                  readOnly
                                  size="small"
                                />
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {hospital.rating}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Contact Details */}
                            <Box sx={{ mb: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                <LocationOn sx={{ mr: 1, mt: 0.2, fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Phone sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {hospital.phoneNumber}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Language sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  <a href={`https://${hospital.website}`} target="_blank" rel="noopener noreferrer">
                                    {hospital.website}
                                  </a>
                                </Typography>
                              </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Specialties */}
                            <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="medium">
                                Specialties
                              </Typography>
                              <Box>
                                {hospital.specialties && hospital.specialties.map((spec, index) => (
                                  <Chip
                                    key={index}
                                    label={spec}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5, borderRadius: 1, bgcolor: '#f0f0f0' }}
                                  />
                                ))}
                              </Box>
                            </Box>

                            {/* Insurance Accepted */}
                            <Box>
                              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                                Insurance Accepted
                              </Typography>
                              <Box>
                                {hospital.insuranceAccepted && hospital.insuranceAccepted.map((ins, index) => (
                                  <Chip
                                    key={index}
                                    label={ins}
                                    size="small"
                                    sx={{ mr: 1, mb: 1, borderRadius: 1, bgcolor: '#f0f0f0' }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </CardContent>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default HospitalFinder; 