import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Paper,
  Avatar,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search,
  LocalHospital,
  MedicalServices,
  InsertChart,
  HealthAndSafety,
  AccessTime,
  MonetizationOn,
  StarRate
} from '@mui/icons-material';




const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  

  

  const features = [
    {
      title: 'Hospital Finder',
      description: 'Locate nearby hospitals and healthcare facilities with detailed information on specialties and ratings.',
      icon: <LocalHospital fontSize="large" color="primary" />,
      path: '/hospital-finder'
    },
    {
      title: 'Symptom Checker',
      description: 'Check your symptoms and get preliminary guidance on potential conditions and next steps.',
      icon: <MedicalServices fontSize="large" color="primary" />,
      path: '/symptom-checker'
    },
    {
      title: 'Insurance Directory',
      description: 'Browse and compare insurance plans to find the best coverage for your healthcare needs.',
      icon: <InsertChart fontSize="large" color="primary" />,
      path: '/insurance-directory'
    },
    {
      title: 'Treatment Comparisons',
      description: 'Compare different treatment options, understand costs, and make informed healthcare decisions.',
      icon: <HealthAndSafety fontSize="large" color="primary" />,
      path: '/treatments'
    }
  ];

  const benefits = [
    {
      title: 'Save Time',
      description: 'Quickly find healthcare information and compare options in one place.',
      icon: <AccessTime />
    },
    {
      title: 'Reduce Costs',
      description: 'Make cost-effective decisions by comparing treatment prices and insurance coverage.',
      icon: <MonetizationOn />
    },
    {
      title: 'Better Choices',
      description: 'Access ratings and reviews to choose the right healthcare providers for your needs.',
      icon: <StarRate />
    }
  ];

  return (
    <Box>
      {/*  Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 2, md: 3 },
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(45deg, #2c7db9 30%, #42a883 90%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={12}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.4rem', md: '2rem' },
                }}
              >
                Discover Smarter Healthcare Choices
              </Typography>
              <Typography
  variant="h6"
  sx={{
    mb: 4,
    opacity: 0.9,
    lineHeight: 1.6,
    color: 'white',
    textAlign: 'center',
    fontSize: { xs: '1rem', md: '1.2rem' },
  }}
>
  Find the care you need, the plan that fits, & the peace of mind you deserve 
  
</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  component={RouterLink}
                  to="/hospital-finder"
                  startIcon={<Search />}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontWeight: 600,
                    boxShadow: theme.shadows[4],
                  }}
                >
                  Find Hospitals
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/symptom-checker"
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderColor: 'white',
                    },
                  }}
                >
                  Check Symptoms
                </Button>
              </Box>
            </Grid>
            {/* {!isMobile && (
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src="/hero-image.svg" // Placeholder, replace with actual image
                  alt="Healthcare professional"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: theme.shadows[10],
                  }}
                />
              </Grid>
            )} */}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{pt: 4, pb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            How CareCompare Helps You
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            We provide tools and information to help you navigate the healthcare system with confidence.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {feature.description}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={feature.path}
                    color="primary"
                    sx={{ mt: 'auto' }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Benefits of Using CareCompare
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Our platform is designed to simplify your healthcare journey, saving you time and helping you make better decisions.
              </Typography>

              <Box sx={{ mt: 4 }}>
                {benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        mr: 2,
                      }}
                    >
                      {benefit.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 2,
                  boxShadow: theme.shadows[3],
                  bgcolor: 'background.default',
                }}
              >
                <Typography variant="h5" gutterBottom>
                  What Our Users Say
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {[1, 2, 3].map((item) => (
                    <Grid item xs={12} key={item}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: `${
                              ['primary', 'secondary', 'info'][item - 1]
                            }.main`,
                            mr: 2,
                          }}
                        >
                          {['JD', 'SM', 'AK'][item - 1]}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {[
                              'CareCompare helped me find the right specialist in my network.',
                              'I saved over $2000 by comparing treatment options!',
                              'The symptom checker gave me peace of mind when I wasn\'t sure if I needed to see a doctor.',
                            ][item - 1]}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {[
                              '— John D., Patient',
                              '— Sarah M., Insurance Policyholder',
                              '— Alex K., Healthcare Consumer',
                            ][item - 1]}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Ready to Make Smarter Healthcare Choices?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of users who are making informed decisions with CareCompare.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/compare-plans"
            sx={{
              py: 1.5,
              px: 4,
              fontWeight: 600,
              bgcolor: 'white',
              color: 'secondary.main',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 