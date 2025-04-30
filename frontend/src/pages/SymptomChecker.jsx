import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search,
  HealthAndSafety,
  LocalHospital,
  MedicalServices,
  Add,
  Remove,
  Info,
  Help
} from '@mui/icons-material';
import axios from 'axios';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [suggestedSymptoms, setSuggestedSymptoms] = useState([]);

  // Common symptoms for autocomplete suggestions
  const commonSymptoms = [
    'headache', 'fever', 'cough', 'fatigue', 'shortness of breath',
    'nausea', 'vomiting', 'abdominal pain', 'diarrhea', 'chest pain',
    'back pain', 'sore throat', 'runny nose', 'dizziness', 'joint pain'
  ];

  const handleAddSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim().toLowerCase())) {
      setSymptoms([...symptoms, currentSymptom.trim().toLowerCase()]);
      setCurrentSymptom('');
      setSuggestedSymptoms([]);
    }
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setSymptoms(symptoms.filter(symptom => symptom !== symptomToRemove));
  };

  const handleSymptomInputChange = (e) => {
    const value = e.target.value;
    setCurrentSymptom(value);
    
    if (value.trim()) {
      // Filter common symptoms that include the current input
      const filtered = commonSymptoms.filter(
        symptom => symptom.includes(value.toLowerCase()) && !symptoms.includes(symptom)
      );
      setSuggestedSymptoms(filtered.slice(0, 5)); 
    } else {
      setSuggestedSymptoms([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (symptoms.length === 0) {
      setError('Please enter at least one symptom');
      return;
    }
    
    if (!age) {
      setError('Please enter your age');
      return;
    }
    
    if (!gender) {
      setError('Please select your gender');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      
      
      setTimeout(() => {
        // Mock API response
        const mockResponse = {
          possibleConditions: [
            {
              name: 'Common Cold',
              probability: 'High',
              description: 'A viral infection of the upper respiratory tract that causes inflammation in the nose and throat.',
              recommendedAction: 'Rest, stay hydrated, and consider over-the-counter medications for symptom relief.'
            },
            {
              name: 'Seasonal Allergy',
              probability: 'Medium',
              description: 'An allergic reaction to pollen, dust, or other environmental triggers that causes inflammation in the nasal passages.',
              recommendedAction: 'Antihistamines may help relieve symptoms. Consider seeing an allergist for testing.'
            },
            {
              name: 'Sinus Infection',
              probability: 'Low',
              description: 'Inflammation or swelling of the tissue lining the sinuses, often due to infection.',
              recommendedAction: 'If symptoms persist for more than 10 days, consider consulting a healthcare provider.'
            }
          ],
          disclaimer: 'This symptom checker provides general information only and does not substitute professional medical advice. Always consult a healthcare provider for medical concerns.'
        };
        
        setResult(mockResponse);
        setLoading(false);
      }, 1500);
      

    } catch (err) {
      setError('An error occurred while checking symptoms. Please try again.');
      console.error('Symptom check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms([]);
    setCurrentSymptom('');
    setAge('');
    setGender('');
    setResult(null);
    setError(null);
    setSuggestedSymptoms([]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          <HealthAndSafety sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          Symptom Checker
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Describe your symptoms to get information about possible conditions
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Enter Your Symptoms
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Type a symptom"
                  variant="outlined"
                  value={currentSymptom}
                  onChange={handleSymptomInputChange}
                  disabled={loading}
                  placeholder="e.g. headache, fever, cough"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddSymptom}
                  disabled={!currentSymptom.trim() || loading}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>

              {suggestedSymptoms.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  {suggestedSymptoms.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      onClick={() => {
                        setSymptoms([...symptoms, suggestion]);
                        setCurrentSymptom('');
                        setSuggestedSymptoms([]);
                      }}
                      color="primary"
                      variant="outlined"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              )}

              {symptoms.length > 0 && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Your symptoms:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {symptoms.map((symptom) => (
                      <Chip
                        key={symptom}
                        label={symptom}
                        onDelete={() => handleRemoveSymptom(symptom)}
                        color="primary"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                variant="outlined"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  label="Gender"
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || symptoms.length === 0 || !age || !gender}
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                >
                  {loading ? 'Checking...' : 'Check Symptoms'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Possible Conditions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Info sx={{ mr: 1, fontSize: 20 }} />
            Based on the symptoms you've provided, here are some possible conditions to consider.
          </Typography>

          <Grid container spacing={3}>
            {result.possibleConditions.map((condition, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderLeft: '5px solid',
                    borderColor: 
                      condition.probability === 'High' ? 'error.main' : 
                      condition.probability === 'Medium' ? 'warning.main' : 'info.main',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" gutterBottom>
                        {condition.name}
                      </Typography>
                      <Chip 
                        label={condition.probability} 
                        size="small"
                        color={
                          condition.probability === 'High' ? 'error' : 
                          condition.probability === 'Medium' ? 'warning' : 'info'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {condition.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Recommended Action:
                    </Typography>
                    <Typography variant="body2">
                      {condition.recommendedAction}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 3, mt: 4, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="error">
              Medical Disclaimer:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {result.disclaimer}
            </Typography>
          </Paper>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LocalHospital />}
              component="a"
              href="/hospital-finder"
              sx={{ mr: 2 }}
            >
              Find Hospitals
            </Button>
            <Button
              variant="outlined"
              startIcon={<MedicalServices />}
              component="a"
              href="/insurance-directory"
            >
              Insurance Coverage
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default SymptomChecker; 