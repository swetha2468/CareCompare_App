import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { hasToken } from '../../utils/tokenUtils';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, error, refreshToken } = useAuth();
  const location = useLocation();
  const [initialCheck, setInitialCheck] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const refreshAttempted = useRef(false);

  // Check if there's a token and user data in localStorage
  const hasTokenInStorage = hasToken();
  const hasUserInStorage = !!localStorage.getItem('user');
  const hasLocalData = hasTokenInStorage && hasUserInStorage;

  // Trigger a token refresh when the component mounts - ONLY ONCE
  useEffect(() => {
    // Skip if we've already attempted a refresh or don't have a token
    if (refreshAttempted.current || !hasTokenInStorage) {
      return;
    }

    // Mark that we've attempted a refresh
    refreshAttempted.current = true;

    // Only refresh if we haven't done so recently (last 30 seconds)
    const lastRefresh = localStorage.getItem('lastTokenRefresh');
    const now = Date.now();
    const shouldRefresh = !lastRefresh || (now - parseInt(lastRefresh, 10)) > 30000;

    if (shouldRefresh) {
      console.log('Protected route: refreshing token on mount');
      // Track this refresh attempt
      localStorage.setItem('lastTokenRefresh', now.toString());

      refreshToken().catch(err => {
        console.warn('Background token refresh failed:', err);
      });
    } else {
      console.log('Skipping refresh, was refreshed recently');
    }
  }, [refreshToken, hasTokenInStorage]);

  // Add a short delay before deciding to show loading indicator
  // This prevents flashing loading state on fast connections
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialCheck(false);
    }, 300);

    // If loading takes longer than 700ms, show the loading indicator
    const loadingTimer = setTimeout(() => {
      if (loading) {
        setShowLoading(true);
      }
    }, 700);

    return () => {
      clearTimeout(timer);
      clearTimeout(loadingTimer);
    };
  }, [loading]);

  // During the initial check, if we have local data, show the children immediately
  if (initialCheck && hasLocalData) {
    return children;
  }

  // Only show loading spinner if taking too long and we've decided to show it
  if (loading && showLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If we're still loading but have local data, show content optimistically
  if (loading && hasLocalData) {
    return children;
  }

  // If we're done loading and definitely not authenticated, redirect to login
  if (!loading && !isAuthenticated && !hasLocalData) {
    // Save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have local data but the API says we're not authenticated,
  // still show the children - we'll rely on API calls to redirect later if needed
  if (!loading && !isAuthenticated && hasLocalData) {
    console.log('API says not authenticated but we have local data, showing content anyway');
    return children;
  }


  return children;
};

export default ProtectedRoute; 