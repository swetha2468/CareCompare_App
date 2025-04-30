import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useMediaQuery,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Home,
  MedicalServices,
  LocalHospital,
  InsertChart,
  HealthAndSafety,
  Person,
  CalendarMonth,
  Description,
  Logout,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Define navigation links for both authenticated and unauthenticated users
const pages = [
  { name: 'Find Care', path: '/insurance-directory' },
  { name: 'Symptom Checker', path: '/symptom-checker' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' }
];

const authPages = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Appointments', path: '/appointments' },
  { name: 'Medical Records', path: '/records' }
];

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationAnchor(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
    setDrawerOpen(false);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { title: 'Home', path: '/', icon: <Home /> },
    { title: 'Symptom Checker', path: '/symptom-checker', icon: <MedicalServices /> },
    { title: 'Hospital Finder', path: '/hospital-finder', icon: <LocalHospital /> },
    { title: 'Compare Plans', path: '/compare-plans', icon: <InsertChart /> },
    { title: 'Insurance Directory', path: '/insurance-directory', icon: <HealthAndSafety /> },
  ];
  
  const authenticatedMenuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <Person /> },
    { title: 'Appointments', path: '/appointments', icon: <CalendarMonth /> },
    { title: 'Medical Records', path: '/medical-records', icon: <Description /> },
  ];
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" component="div" color="primary" sx={{ mb: 1 }}>
          CareCompare
        </Typography>
        {isAuthenticated && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="body2">
              Welcome, {user?.name || 'User'}
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.title} 
            component={RouterLink}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
            sx={{ 
              bgcolor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
              color: isActive(item.path) ? 'primary.main' : 'inherit'
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
      
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            {authenticatedMenuItems.map((item) => (
              <ListItem 
                button 
                key={item.title} 
                component={RouterLink}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                sx={{ 
                  bgcolor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  color: isActive(item.path) ? 'primary.main' : 'inherit'
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );
  
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}
              >
                CareCompare
              </Typography>
            </>
          ) : (
            <>
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{ 
                  flexGrow: 0, 
                  color: 'primary.main', 
                  mr: 4, 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <HealthAndSafety sx={{ mr: 1 }} />
                CareCompare
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.title}
                    component={RouterLink}
                    to={item.path}
                    color={isActive(item.path) ? 'primary' : 'inherit'}
                    sx={{ mx: 1 }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            </>
          )}
          
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isMobile && (
                <IconButton 
                  color="inherit" 
                  onClick={handleNotificationsOpen}
                  size="small"
                  sx={{ mr: 2 }}
                >
                  <Badge badgeContent={3} color="primary">
                    <Notifications />
                  </Badge>
                </IconButton>
              )}
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                component={RouterLink} 
                to="/register"
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
      
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          component={RouterLink} 
          to="/dashboard"
          onClick={handleMenuClose}
        >
          Dashboard
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to="/profile"
          onClick={handleMenuClose}
        >
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
      
      <Menu
        anchorEl={notificationAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationsClose}
      >
        <MenuItem onClick={handleNotificationsClose}>
          <ListItemText 
            primary="New Message from Dr. Smith" 
            secondary="Your test results are ready to view." 
          />
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <ListItemText 
            primary="Appointment Reminder" 
            secondary="You have an appointment tomorrow at 2:00 PM." 
          />
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <ListItemText 
            primary="Insurance Claim Update" 
            secondary="Your recent claim has been approved." 
          />
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header; 