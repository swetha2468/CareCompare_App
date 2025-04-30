import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  HealthAndSafety,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HealthAndSafety sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                CareCompare
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Making healthcare decisions easier with transparent information and user-friendly tools. Compare hospitals, treatments, and insurance plans to find the best care options for you and your family.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <IconButton 
                aria-label="facebook" 
                size="small" 
                color="primary"
                sx={{ bgcolor: 'action.hover' }}
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton 
                aria-label="twitter" 
                size="small" 
                color="primary"
                sx={{ bgcolor: 'action.hover' }}
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton 
                aria-label="instagram" 
                size="small" 
                color="primary"
                sx={{ bgcolor: 'action.hover' }}
              >
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton 
                aria-label="linkedin" 
                size="small" 
                color="primary"
                sx={{ bgcolor: 'action.hover' }}
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{ fontWeight: 'medium' }}>
              Services
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/hospital-finder" color="inherit" underline="hover">
                  Hospital Finder
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/symptom-checker" color="inherit" underline="hover">
                  Symptom Checker
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/insurance-directory" color="inherit" underline="hover">
                  Insurance Directory
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/compare-plans" color="inherit" underline="hover">
                  Compare Plans
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{ fontWeight: 'medium' }}>
              Company
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/about" color="inherit" underline="hover">
                  About Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/team" color="inherit" underline="hover">
                  Our Team
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/careers" color="inherit" underline="hover">
                  Careers
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/contact" color="inherit" underline="hover">
                  Contact Us
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{ fontWeight: 'medium' }}>
              Contact Information
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  1234 Healthcare Ave, Medical District, CA 90001
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  +1 (800) 123-4567
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  info@carecompare.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md="auto">
            <Typography variant="body2" color="text.secondary" align={isMobile ? 'center' : 'left'}>
              © {currentYear} CareCompare. All rights reserved.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md="auto">
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: isMobile ? 'center' : 'flex-end',
                gap: 2,
                flexWrap: 'wrap' 
              }}
            >
              <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover">
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover">
                Terms of Service
              </Link>
              <Link component={RouterLink} to="/cookies" color="text.secondary" underline="hover">
                Cookie Policy
              </Link>
              <Link component={RouterLink} to="/accessibility" color="text.secondary" underline="hover">
                Accessibility
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 