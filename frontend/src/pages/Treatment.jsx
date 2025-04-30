import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Grid
} from '@mui/material';
import {
  ExpandMore,
  LocalHospital,
  Info,
  Healing,
  AttachMoney,
  MedicalServices,
  QuestionAnswer,
  AccessTime,
  CheckCircleOutline,
  Warning,
  CompareArrows
} from '@mui/icons-material';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`treatment-tabpanel-${index}`}
      aria-labelledby={`treatment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TreatmentInfo = () => {
  const { treatmentName } = useParams();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchTreatmentData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be fetched from your backend
        const response = await axios.get(`http://localhost:8080/api/treatments/${treatmentName}`);
        setTreatment(response.data);
        
      } catch (err) {
        console.error('Error fetching treatment data:', err);
        setError('Could not load treatment data. Using demo data instead.');
        
        // Mock data for development/demo purposes
        const mockTreatment = {
          id: 1,
          name: treatmentName === 'dialysis' ? 'Dialysis' : 'Treatment',
          description: treatmentName === 'dialysis' 
            ? "Dialysis is a treatment that filters and purifies the blood using a machine. This helps keep your fluids and electrolytes in balance when the kidneys can't do their job."
            : "This medical treatment helps manage and treat various conditions.",
          procedureSteps: [
            'Patient assessment and preparation',
            'Connection to the dialysis machine',
            'Blood filtering process (3-4 hours)',
            'Monitoring vital signs during treatment',
            'Disconnection and post-treatment evaluation'
          ],
          recoveryTime: 'Patients typically need rest for a few hours after each session',
          risks: [
            'Low blood pressure',
            'Muscle cramps',
            'Infection at access site',
            'Blood clots',
            'Anemia'
          ],
          expectedOutcomes: [
            'Removal of waste products from blood',
            'Regulation of electrolyte levels',
            'Control of blood pressure',
            'Improved quality of life'
          ],
          costRange: {
            min: 1500,
            max: 3000,
            currency: 'USD'
          },
          insuranceCoverage: [
            'Medicare covers 80% of costs after deductible',
            'Most private insurance plans provide coverage',
            'Coverage may require pre-authorization',
            'Co-payments and deductibles vary by plan'
          ],
          alternativeTreatments: [
            'Kidney transplant',
            'Peritoneal dialysis',
            'Conservative management'
          ],
          faqs: [
            {
              question: 'How often is dialysis needed?',
              answer: 'Most patients need hemodialysis three times per week, with sessions lasting 3-4 hours each.'
            },
            {
              question: 'Can I travel while on dialysis?',
              answer: 'Yes, but it requires advance planning to arrange treatment at your destination.'
            },
            {
              question: 'What dietary restrictions are necessary?',
              answer: 'Patients typically need to limit intake of potassium, phosphorus, sodium, and fluids.'
            },
            {
              question: 'How long can someone live on dialysis?',
              answer: 'This varies widely, but many patients live for 5-10 years or longer with proper care.'
            }
          ]
        };
        
        setTreatment(mockTreatment);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTreatmentData();
  }, [treatmentName]);
  
  if (loading) {
    return (
      <Container sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (!treatment) {
    return (
      <Container sx={{ my: 4 }}>
        <Alert severity="error">Treatment information not found.</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          <Healing sx={{ mr: 1, verticalAlign: 'middle' }} />
          {treatment.name} Treatment
        </Typography>
        
        <Typography variant="body1" paragraph>
          {treatment.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            component={RouterLink}
            to="/hospitals"
            startIcon={<LocalHospital />}
          >
            Find Hospitals
          </Button>
          
          <Button 
            variant="outlined"
            component={RouterLink}
            to="/compare-plans"
            startIcon={<CompareArrows />}
          >
            Compare Insurance Plans
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="treatment information tabs">
          <Tab icon={<Info />} label="Overview" />
          <Tab icon={<MedicalServices />} label="Procedure" />
          <Tab icon={<AttachMoney />} label="Cost & Insurance" />
          <Tab icon={<QuestionAnswer />} label="FAQs" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutline sx={{ mr: 1, color: 'success.main' }} />
              Expected Outcomes
            </Typography>
            <Paper sx={{ p: 2 }}>
              <List>
                {treatment.expectedOutcomes.map((outcome, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleOutline color="success" />
                    </ListItemIcon>
                    <ListItemText primary={outcome} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1, color: 'warning.main' }} />
              Potential Risks
            </Typography>
            <Paper sx={{ p: 2 }}>
              <List>
                {treatment.risks.map((risk, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={risk} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1, color: 'info.main' }} />
              Recovery Time
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body1">{treatment.recoveryTime}</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Healing sx={{ mr: 1, color: 'info.main' }} />
              Alternative Treatments
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {treatment.alternativeTreatments.map((alt, index) => (
                <Chip 
                  key={index} 
                  label={alt} 
                  icon={<MedicalServices />} 
                  variant="outlined" 
                  color="primary" 
                  clickable 
                  component={RouterLink}
                  to={`/treatment-info/${alt.toLowerCase().replace(/\s+/g, '-')}`}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Procedure Steps
        </Typography>
        <Paper sx={{ p: 2 }}>
          <List>
            {treatment.procedureSteps.map((step, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Typography variant="h6" color="primary">{index + 1}</Typography>
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AttachMoney sx={{ verticalAlign: 'middle', color: 'success.main' }} />
                  Cost Range
                </Typography>
                <Typography variant="h4" color="primary">
                  {treatment.costRange.currency} {treatment.costRange.min.toLocaleString()} - {treatment.costRange.max.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Costs may vary based on facility, region, and individual factors.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Info sx={{ verticalAlign: 'middle', color: 'info.main' }} />
                  Insurance Coverage
                </Typography>
                <List>
                  {treatment.insuranceCoverage.map((coverage, index) => (
                    <ListItem key={index} dense>
                      <ListItemIcon>
                        <CheckCircleOutline color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={coverage} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink}
              to="/compare-plans"
              fullWidth
              startIcon={<CompareArrows />}
              sx={{ mt: 2, py: 1.5 }}
            >
              Compare Insurance Plans
            </Button>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Frequently Asked Questions
        </Typography>
        
        {treatment.faqs.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ fontWeight: 'medium' }}>
                <QuestionAnswer sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
        
        <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Have more questions?
          </Typography>
          <Typography variant="body2">
            Consult with a healthcare professional for personalized advice about this treatment.
          </Typography>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default TreatmentInfo; 