import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  IconButton,
  InputAdornment,
  Autocomplete,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  LocalHospital,
  LocationOn,
  Phone,
  Star,
  AddCircleOutline,
  RemoveCircleOutline,
  Compare
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Map of treatment types to their display names
const treatmentTypes = {
  dialysis: 'Dialysis Treatment',
  cardiacSurgery: 'Cardiac Surgery',
  jointReplacement: 'Joint Replacement',
  chemotherapy: 'Chemotherapy',
  brainSurgery: 'Brain Surgery',
  organTransplant: 'Organ Transplant',
  pregnancyDelivery: 'Pregnancy & Delivery',
  physicalTherapy: 'Physical Therapy'
};

const HospitalComparison = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [selectedHospitals, setSelectedHospitals] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState('dialysis');
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [allSpecialties, setAllSpecialties] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  
  // Fetch hospitals data
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be fetched from your backend
        // const response = await axios.get('http://localhost:8080/api/hospitals');
        // setHospitals(response.data);
        // setFilteredHospitals(response.data);
        
        // Mock data for development/demo purposes
        const mockHospitals = [
          {
            id: 1,
            name: 'General Hospital',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            phoneNumber: '(212) 555-1234',
            imageUrl: 'https://source.unsplash.com/random/300×200/?hospital',
            rating: 4.5,
            insuranceAccepted: ['Medicare', 'Aetna', 'Blue Cross'],
            specialties: ['Cardiology', 'Oncology', 'Neurology'],
            treatmentCosts: {
              dialysis: 2500,
              cardiacSurgery: 75000,
              jointReplacement: 45000
            }
          },
          {
            id: 2,
            name: 'City Medical Center',
            address: '456 Park Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            phoneNumber: '(212) 555-5678',
            imageUrl: 'https://source.unsplash.com/random/300×200/?clinic',
            rating: 4.2,
            insuranceAccepted: ['Medicare', 'United', 'Cigna'],
            specialties: ['Orthopedics', 'Pediatrics', 'Geriatrics'],
            treatmentCosts: {
              dialysis: 2300,
              cardiacSurgery: 80000,
              jointReplacement: 42000
            }
          },
          {
            id: 3,
            name: 'Memorial Hospital',
            address: '789 Broadway',
            city: 'Boston',
            state: 'MA',
            zipCode: '02115',
            phoneNumber: '(617) 555-9012',
            imageUrl: 'https://source.unsplash.com/random/300×200/?hospital-building',
            rating: 4.8,
            insuranceAccepted: ['Medicare', 'Blue Cross', 'Harvard Pilgrim'],
            specialties: ['Oncology', 'Cardiology', 'Surgery'],
            treatmentCosts: {
              dialysis: 2100,
              cardiacSurgery: 72000,
              jointReplacement: 40000
            }
          },
          {
            id: 4,
            name: 'University Medical Center',
            address: '321 College Road',
            city: 'Boston',
            state: 'MA',
            zipCode: '02116',
            phoneNumber: '(617) 555-3456',
            imageUrl: 'https://source.unsplash.com/random/300×200/?medical-center',
            rating: 4.6,
            insuranceAccepted: ['Medicare', 'Tufts', 'Blue Cross'],
            specialties: ['Neurology', 'Research', 'Transplant'],
            treatmentCosts: {
              dialysis: 2400,
              cardiacSurgery: 78000,
              jointReplacement: 43000
            }
          },
          {
            id: 5,
            name: 'County Hospital',
            address: '555 Rural Route',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            phoneNumber: '(312) 555-7890',
            imageUrl: 'https://source.unsplash.com/random/300×200/?healthcare',
            rating: 3.9,
            insuranceAccepted: ['Medicare', 'Medicaid', 'Blue Cross'],
            specialties: ['Emergency', 'Family Medicine', 'Internal Medicine'],
            treatmentCosts: {
              dialysis: 1900,
              cardiacSurgery: 65000,
              jointReplacement: 38000
            }
          },
        ];
        
        setHospitals(mockHospitals);
        setFilteredHospitals(mockHospitals);
        
        // Extract all unique specialties and locations for filters
        const specialties = new Set();
        const locations = new Set();
        
        mockHospitals.forEach(hospital => {
          hospital.specialties.forEach(specialty => specialties.add(specialty));
          locations.add(hospital.city);
        });
        
        setAllSpecialties(Array.from(specialties));
        setAllLocations(Array.from(locations));
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setError('Could not load hospitals data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHospitals();
  }, []);
  
  // Apply filters when search criteria change
  useEffect(() => {
    const applyFilters = () => {
      let results = hospitals;
      
      // Apply search filter
      if (searchTerm) {
        results = results.filter(hospital => 
          hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply location filter
      if (locationFilter) {
        results = results.filter(hospital => 
          hospital.city === locationFilter
        );
      }
      
      // Apply specialty filter
      if (specialtyFilter) {
        results = results.filter(hospital => 
          hospital.specialties.includes(specialtyFilter)
        );
      }
      
      setFilteredHospitals(results);
    };
    
    applyFilters();
  }, [hospitals, searchTerm, locationFilter, specialtyFilter]);
  
  // Handle toggling hospital selection for comparison
  const toggleHospitalSelection = (hospital) => {
    if (isHospitalSelected(hospital.id)) {
      setSelectedHospitals(selectedHospitals.filter(h => h.id !== hospital.id));
    } else {
      // Only allow selecting up to 3 hospitals
      if (selectedHospitals.length < 3) {
        setSelectedHospitals([...selectedHospitals, hospital]);
      }
    }
  };
  
  // Check if a hospital is selected
  const isHospitalSelected = (id) => {
    return selectedHospitals.some(hospital => hospital.id === id);
  };
  
  // Get treatment costs for comparison
  const getTreatmentCosts = () => {
    return selectedHospitals.map(hospital => ({
      hospital: hospital.name,
      hospitalId: hospital.id,
      cost: hospital.treatmentCosts[selectedTreatment] || 0
    }));
  };
  
  // Handle treatment type change in comparison dialog
  const handleTreatmentChange = (event) => {
    setSelectedTreatment(event.target.value);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setSpecialtyFilter('');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hospital Comparison
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Find and Compare Hospitals
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Search hospitals"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <Autocomplete
            fullWidth
            value={locationFilter}
            onChange={(event, newValue) => setLocationFilter(newValue)}
            options={allLocations}
            renderInput={(params) => <TextField {...params} label="Location" />}
          />
          
          <Autocomplete
            fullWidth
            value={specialtyFilter}
            onChange={(event, newValue) => setSpecialtyFilter(newValue)}
            options={allSpecialties}
            renderInput={(params) => <TextField {...params} label="Specialty" />}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={resetFilters}>
            Reset Filters
          </Button>
          
          <Button 
            variant="contained" 
            disabled={selectedHospitals.length < 2} 
            onClick={() => setCompareDialogOpen(true)}
            startIcon={<Compare />}
          >
            Compare Selected ({selectedHospitals.length}/3)
          </Button>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Loading hospitals...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredHospitals.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No hospitals match your search criteria</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={resetFilters}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          {filteredHospitals.map(hospital => (
            <Card 
              key={hospital.id} 
              sx={{ 
                mb: 2, 
                border: isHospitalSelected(hospital.id) ? '2px solid #2196f3' : 'none' 
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', md: 200 }, 
                    height: { xs: 160, md: '100%' },
                    objectFit: 'cover'
                  }}
                  image={hospital.imageUrl}
                  alt={hospital.name}
                />
                
                <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" component="div">
                    {hospital.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={hospital.rating} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {hospital.rating.toFixed(1)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {hospital.phoneNumber}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Specialties:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {hospital.specialties.map((specialty, index) => (
                        <Chip 
                          key={index} 
                          label={specialty} 
                          size="small" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Insurance Accepted:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {hospital.insuranceAccepted.map((insurance, index) => (
                        <Chip 
                          key={index} 
                          label={insurance} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 2 
                }}>
                  <Button 
                    variant={isHospitalSelected(hospital.id) ? 'contained' : 'outlined'} 
                    color={isHospitalSelected(hospital.id) ? 'secondary' : 'primary'}
                    onClick={() => toggleHospitalSelection(hospital)}
                    startIcon={isHospitalSelected(hospital.id) ? <RemoveCircleOutline /> : <AddCircleOutline />}
                    sx={{ mb: 1, width: '100%' }}
                  >
                    {isHospitalSelected(hospital.id) ? 'Remove' : 'Select'}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    sx={{ width: '100%' }}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}
      
      {/* Comparison Dialog */}
      <Dialog 
        open={compareDialogOpen} 
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Hospital Comparison
          <IconButton
            aria-label="close"
            onClick={() => setCompareDialogOpen(false)}
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
          {selectedHospitals.length >= 2 ? (
            <>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Treatment Type</InputLabel>
                  <Select
                    value={selectedTreatment}
                    onChange={handleTreatmentChange}
                    label="Treatment Type"
                  >
                    {Object.entries(treatmentTypes).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <TableContainer component={Paper}>
                <Table aria-label="comparison table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Feature</TableCell>
                      {selectedHospitals.map(hospital => (
                        <TableCell key={hospital.id} align="center">
                          {hospital.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Rating Row */}
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Rating
                      </TableCell>
                      {selectedHospitals.map(hospital => (
                        <TableCell key={hospital.id} align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Rating value={hospital.rating} precision={0.5} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({hospital.rating.toFixed(1)})
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Location Row */}
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Location
                      </TableCell>
                      {selectedHospitals.map(hospital => (
                        <TableCell key={hospital.id} align="center">
                          {hospital.city}, {hospital.state}
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Insurance Row */}
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Insurance Accepted
                      </TableCell>
                      {selectedHospitals.map(hospital => (
                        <TableCell key={hospital.id} align="center">
                          {hospital.insuranceAccepted.join(', ')}
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Specialties Row */}
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Specialties
                      </TableCell>
                      {selectedHospitals.map(hospital => (
                        <TableCell key={hospital.id} align="center">
                          {hospital.specialties.join(', ')}
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    {/* Treatment Cost Row */}
                    <TableRow>
                      <TableCell component="th" scope="row">
                        <Typography fontWeight="bold">
                          {treatmentTypes[selectedTreatment]} Cost
                        </Typography>
                      </TableCell>
                      {getTreatmentCosts().map(item => (
                        <TableCell key={item.hospitalId} align="center">
                          <Typography fontWeight="bold" color="primary">
                            ${item.cost.toLocaleString()}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  * Treatment costs are estimated averages and may vary based on insurance coverage, patient condition, and other factors.
                </Typography>
              </Box>
            </>
          ) : (
            <Alert severity="info">
              Please select at least 2 hospitals to compare.
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default HospitalComparison; 