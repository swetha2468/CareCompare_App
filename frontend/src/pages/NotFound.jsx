import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper,
  Grid,
  useTheme
} from '@mui/material';
import { 
  SentimentDissatisfied, 
  ArrowBack, 
  Home 
} from '@mui/icons-material';

const NotFound = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Grid 
        container 
        spacing={2} 
        justifyContent="center" 
        alignItems="center" 
        style={{ minHeight: '80vh' }}
      >
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <SentimentDissatisfied 
              sx={{ 
                fontSize: 100, 
                color: 'primary.main',
                mb: 2 
              }} 
            />
            
            <Typography variant="h2" component="h1" gutterBottom>
              404
            </Typography>
            
            <Typography variant="h4" gutterBottom>
              Page Not Found
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
              Sorry, the page you are looking for doesn't exist or has been moved.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Home />}
                component={RouterLink}
                to="/"
              >
                Go to Home
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<ArrowBack />}
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotFound; 