import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { hasToken, isTokenExpired, shouldRefreshToken, getSecondsUntilExpiration } from '../utils/tokenUtils';

const API_URL = 'http://localhost:8080';
// Set token refresh interval to 14 minutes (JWT typically expires in 15 minutes)
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000;
// When to attempt token refresh during initial load
const INITIAL_REFRESH_DELAY = 500;

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return hasToken() && !isTokenExpired();
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialAuthCheckDone = useRef(false);
  const tokenRefreshInterval = useRef(null);
  const lastRefreshAttempt = useRef(0);
  const authApi = useRef(axios.create({
    baseURL: API_URL,
    timeout: 15000, // Increased timeout to 15s for better reliability
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  }));

  // Helper function to check if token might be valid
  const hasValidToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Very basic check for token format - not a validation
      const parts = token.split('.');
      return parts.length === 3;
    } catch (e) {
      return false;
    }
  };

  // Set up interceptors
  useEffect(() => {
    const requestInterceptor = authApi.current.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    const responseInterceptor = authApi.current.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const originalRequest = error.config;

        // Only attempt refresh if this is a 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('Authentication expired - attempting refresh');

          // Prevent too frequent refresh attempts (at least 2 seconds between attempts)
          const now = Date.now();
          if (now - lastRefreshAttempt.current < 2000) {
            console.log('Too many refresh attempts, waiting');
            return Promise.reject(error);
          }

          lastRefreshAttempt.current = now;

          // Check if we have user data in localStorage
          const savedUser = localStorage.getItem('user');
          const hasUserData = !!savedUser;

          // Try to refresh token before clearing auth
          try {
            originalRequest._retry = true;
            const refreshResult = await refreshToken();

            if (refreshResult.success) {
              // Retry the original request with the new token
              originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
              return axios(originalRequest);
            } else if (refreshResult.keepAuth) {
              // If server is down or non-401 error, keep user logged in but reject this request
              console.log('Token refresh failed but keeping user logged in');
              return Promise.reject(error);
            } else {
              // If token is invalid/expired (401), use softClearAuth if we have user data
              console.log('Token is invalid');
              if (hasUserData) {
                console.log('Using soft clear to maintain session with localStorage data');
                softClearAuth();
                setIsAuthenticated(true); // Keep authenticated status for UI
              } else {
                console.log('No user data, logging out completely');
                clearAuth();
              }
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('Token refresh failed during 401 handling:', refreshError);
            // Don't clear auth on network errors or when we have user data
            if (refreshError.response?.status === 401 && !hasUserData) {
              clearAuth();
            } else if (hasUserData) {
              // Keep the user logged in with existing data
              softClearAuth();
              setIsAuthenticated(true);
            }
            return Promise.reject(error);
          }
        }

        // Handle 500 errors
        if (error.response?.status === 500) {
          console.error('Server error:', error.response.data);
          setError('Temporary server issue. Please try again later.');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      authApi.current.interceptors.request.eject(requestInterceptor);
      authApi.current.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initial authentication check
  useEffect(() => {
    if (initialAuthCheckDone.current) return;

    const checkAuth = async () => {
      console.log('Running initial auth check');

      // Use our token utilities to check token status
      const validTokenFormat = hasToken();
      const tokenExpired = isTokenExpired();
      const secondsLeft = getSecondsUntilExpiration();

      console.log('Token exists:', validTokenFormat);
      console.log('Token expired:', tokenExpired);
      console.log('Seconds until expiration:', secondsLeft);

      const savedUser = localStorage.getItem('user');
      console.log('User from localStorage:', savedUser ? 'exists' : 'not found');

      // If no token or no user in localStorage, we're definitely not authenticated
      if (!validTokenFormat || !savedUser) {
        console.log('No valid token or user found, not authenticated');
        setIsAuthenticated(false);
        setLoading(false);
        initialAuthCheckDone.current = true;
        return;
      }

      // Parse user from localStorage to use as fallback
      let parsedUser = null;
      try {
        parsedUser = JSON.parse(savedUser);
        console.log('Setting user from localStorage:', parsedUser.username);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }

      // If token exists but is expired, try to refresh immediately
      if (tokenExpired) {
        console.log('Token is expired, will attempt refresh');
      } else {
        console.log('Token is still valid, will use it');
        setIsAuthenticated(true);
      }

      // Use a small delay before attempting to refresh the token
      // This gives the backend time to start if it was restarted simultaneously
      setTimeout(async () => {
        try {
          let needsUserRefresh = false;

          // Attempt to refresh token if it's close to expiring or already expired
          if (tokenExpired || shouldRefreshToken(600)) { // 10 minutes threshold
            console.log('Token needs refresh, attempting now');
            const refreshResult = await refreshToken();

            if (!refreshResult.success) {
              console.warn('Token refresh failed during initial auth check');
              if (refreshResult.keepAuth && !tokenExpired) {
                // Keep auth state for network errors if token isn't expired
                console.log('Keeping auth state despite refresh failure (network error)');
                needsUserRefresh = true;
              } else if (tokenExpired) {
                // If token was already expired and refresh failed, but we have user data
                console.log('Token was expired and refresh failed');
                if (parsedUser) {
                  console.log('But we have user data, so keeping session with limited functionality');
                  softClearAuth();
                  setIsAuthenticated(true); // Keep authenticated status
                  setLoading(false);
                  initialAuthCheckDone.current = true;
                  return;
                } else {
                  console.log('No user data, clearing auth');
                  clearAuth();
                  setLoading(false);
                  initialAuthCheckDone.current = true;
                  return;
                }
              }
            } else {
              console.log('Token refreshed successfully');
            }
          } else {
            console.log('Token still valid, skipping refresh');
            needsUserRefresh = true;
          }

          // Fetch user data if needed (token refresh failed with network error or token still valid)
          if (needsUserRefresh) {
            try {
              console.log('Fetching latest user data');
              const response = await authApi.current.get('/api/auth/user');
              const userData = response.data;

              if (!userData) {
                throw new Error('Invalid user data received');
              }

              console.log('Received user data from API:', userData);

              // Merge with existing user data to preserve profile fields
              const mergedUserData = {
                ...JSON.parse(savedUser || '{}'),
                ...userData
              };

              console.log('Merged user data:', mergedUserData);
              localStorage.setItem('user', JSON.stringify(mergedUserData));
              setUser(mergedUserData);
              setIsAuthenticated(true);
              setError(null);
            } catch (userErr) {
              console.warn('User data fetch error:', userErr.message);
              // If we get a 401 but have a valid token format, just keep the user logged in
              // with data from localStorage - the backend might be having issues
              if (userErr.response?.status === 401) {
                console.warn('User data fetch returned 401');
                if (parsedUser) {
                  console.log('Using cached user data from localStorage instead of logging out');
                  softClearAuth(); // Don't clear user data
                  setIsAuthenticated(true); // Keep authenticated status
                } else {
                  console.warn('No cached user data, clearing auth');
                  clearAuth();
                }
              } else {
                // For other errors, keep the existing data
                console.warn('Non-401 error fetching user data, keeping session active');
                setIsAuthenticated(true);
              }
            }
          }
        } catch (err) {
          console.warn('Auth verification error:', err.message);
          if (err.response?.status === 401 && !parsedUser) {
            console.warn('Auth verification failed with 401 and no cached user, clearing auth data');
            clearAuth();
          } else {
            console.warn('Auth verification failed but keeping session active with localStorage data');
            // Keep the session active if we have a valid token in localStorage
            if (parsedUser) {
              softClearAuth();
              setIsAuthenticated(true);
            }
          }
        } finally {
          setLoading(false);
          initialAuthCheckDone.current = true;
        }
      }, INITIAL_REFRESH_DELAY);
    };

    checkAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    // Clear any existing interval
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
      tokenRefreshInterval.current = null;
    }

    // Only set up refresh interval if authenticated
    if (isAuthenticated) {
      console.log(`Setting up token refresh interval (${TOKEN_REFRESH_INTERVAL / 1000}s)`);
      tokenRefreshInterval.current = setInterval(async () => {
        // Skip refresh if we've tried recently
        const now = Date.now();
        const lastRefresh = localStorage.getItem('lastTokenRefresh');
        const timeSinceLastRefresh = lastRefresh ? now - parseInt(lastRefresh, 10) : Infinity;

        // Minimum 60 seconds between refreshes
        if (timeSinceLastRefresh < 60000) {
          console.log(`Skipping auto-refresh - last refresh was ${Math.round(timeSinceLastRefresh / 1000)}s ago`);
          return;
        }

        // Skip if we've tried too recently programmatically 
        if (now - lastRefreshAttempt.current < 5000) {
          console.log('Skipping auto-refresh - tried too recently');
          return;
        }

        console.log('Auto-refreshing token');
        lastRefreshAttempt.current = now;
        localStorage.setItem('lastTokenRefresh', now.toString());

        try {
          const result = await refreshToken();
          if (!result.success) {
            if (result.keepAuth) {
              console.warn('Automatic token refresh failed but keeping session');
            } else {
              console.warn('Automatic token refresh failed with auth failure');
              // Only clear auth for actual auth failures, not network issues
              if (!result.keepAuth) {
                clearAuth();
              }
            }
          } else {
            console.log('Token automatically refreshed');
          }
        } catch (err) {
          console.error('Error in refresh interval:', err);
          // Don't clear auth on errors to prevent unwanted logouts
        }
      }, TOKEN_REFRESH_INTERVAL);
    }

    // Clean up interval on unmount or when auth state changes
    return () => {
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
      }
    };
  }, [isAuthenticated]);

  // Function to refresh the token
  const refreshToken = async () => {
    const oldToken = localStorage.getItem('token');
    if (!oldToken) {
      return { success: false, error: 'No token to refresh' };
    }

    // Debounce - don't allow multiple refreshes at the same time
    const now = Date.now();
    const lastRefresh = localStorage.getItem('lastTokenRefresh');
    const timeSinceLastRefresh = lastRefresh ? now - parseInt(lastRefresh, 10) : Infinity;

    // If we refreshed within the last 10 seconds, return cached success
    if (timeSinceLastRefresh < 10000) {
      console.log(`Token was just refreshed ${Math.round(timeSinceLastRefresh / 1000)}s ago, skipping`);
      return { success: true, cached: true };
    }

    // If there's a refresh already in progress, wait for it
    if (window.tokenRefreshInProgress) {
      console.log('Token refresh already in progress, waiting...');

      // Wait up to 5 seconds for the other refresh to complete
      const startWait = Date.now();
      while (window.tokenRefreshInProgress && Date.now() - startWait < 5000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // If refresh completed successfully while we were waiting
      if (!window.tokenRefreshInProgress && localStorage.getItem('lastTokenRefresh')
        && parseInt(localStorage.getItem('lastTokenRefresh'), 10) > now) {
        console.log('Another refresh completed while waiting, using that result');
        return { success: true, cached: true };
      }

      // If we timed out waiting, proceed with our own refresh
      if (window.tokenRefreshInProgress) {
        console.log('Timed out waiting for other refresh, clearing lock');
        window.tokenRefreshInProgress = false;
      }
    }

    // Set the in-progress flag
    window.tokenRefreshInProgress = true;

    try {
      console.log('Attempting to refresh token');
      const response = await authApi.current.post('/api/auth/refresh', {}, {
        headers: { 'Authorization': `Bearer ${oldToken}` },
        // Add timeout to prevent long waiting times
        timeout: 5000
      });

      // Store the timestamp of this successful refresh
      localStorage.setItem('lastTokenRefresh', Date.now().toString());

      if (response.data?.token) {
        // Update token in localStorage
        localStorage.setItem('token', response.data.token);
        authApi.current.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsAuthenticated(true);
        console.log('Token refreshed successfully');
        window.tokenRefreshInProgress = false;
        return { success: true };
      } else {
        console.warn('Token refresh endpoint returned unexpected response', response.data);
        // Keep user logged in with old token
        window.tokenRefreshInProgress = false;
        return { success: false, error: 'Invalid response from refresh endpoint', keepAuth: true };
      }
    } catch (err) {
      console.error('Token refresh failed:', err.message);
      // Reset the in-progress flag
      window.tokenRefreshInProgress = false;

      // Network errors shouldn't log users out - we'll retry later
      const isNetworkError = !err.response || err.code === 'ECONNABORTED' || err.message.includes('Network Error');
      return {
        success: false,
        error: err.message || 'Token refresh failed',
        // Keep the user logged in for network errors or non-401 responses
        keepAuth: isNetworkError || (err.response?.status !== 401)
      };
    }
  };

  const clearAuth = () => {
    if (!isAuthenticated) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete authApi.current.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setError('Session expired. Please log in again.');
  };

  // Override the normal clearAuth when we want to maintain session from localStorage
  const softClearAuth = () => {
    // Keep user data from localStorage but clear auth state
    const savedUser = localStorage.getItem('user');
    delete authApi.current.defaults.headers.common['Authorization'];

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData); // Keep the user data
        console.log('Using cached user data, not clearing session');
      } catch (e) {
        console.error('Error parsing saved user during soft clear:', e);
      }
    }
  };

  /**
   * Login with either email/password or policy number/password
   * @param {string} identifier - Email or policy number 
   * @param {string} password - User password
   * @param {boolean} isPolicyNumber - Whether identifier is a policy number
   * @returns {Object} Login result
   */
  const login = async (identifier, password, isPolicyNumber = false) => {
    setLoading(true);
    setError(null);
    try {
      // Determine which endpoint to use based on login method
      const endpoint = '/api/auth/login';
      let requestData;

      if (isPolicyNumber) {
        requestData = {
          policyNumber: identifier,
          password
        };
        console.log('Attempting login with policy number');
      } else {
        requestData = {
          username: identifier,
          password
        };
        console.log('Attempting login with email');
      }

      const response = await authApi.current.post(endpoint, requestData);

      const { token, user: userData } = response.data;

      if (!token || !userData) {
        throw new Error('Invalid login response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      authApi.current.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.error ||
        err.code === 'ECONNABORTED' ? 'Request timeout' :
        err.message || 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Extract values from userData object or support legacy format
      const data = typeof userData === 'object'
        ? userData
        : {
          username: arguments[0],
          email: arguments[1],
          password: arguments[2],
          policyNumber: arguments[3]
        };

      console.log('Registering user with data:', data);

      const response = await authApi.current.post('/api/auth/register', data);

      if (response.data.token) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        authApi.current.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, user: userData, autoLogin: true };
      }

      setLoading(false);
      return {
        success: true,
        message: response.data.message || 'Registration successful',
        autoLogin: false
      };
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.error ||
        err.code === 'ECONNABORTED' ? 'Request timeout' :
        err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await authApi.current.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      clearAuth();
    }
  };

  const updateUser = (updatedUserData) => {
    if (!isAuthenticated || !user) {
      console.warn('Cannot update user data when not authenticated');
      return;
    }

    try {
      // Merge the updated data with existing user data, preserving all fields
      const mergedUserData = {
        ...user,
        ...updatedUserData,
        // Ensure profile fields are explicitly copied over
        firstName: updatedUserData.firstName || user.firstName,
        lastName: updatedUserData.lastName || user.lastName,
        email: updatedUserData.email || user.email,
        phoneNumber: updatedUserData.phoneNumber || user.phoneNumber,
        address: updatedUserData.address || user.address,
        dateOfBirth: updatedUserData.dateOfBirth || user.dateOfBirth
      };

      // Log to diagnose issues
      console.log('Updating user in AuthContext:', mergedUserData);

      // Update state and local storage
      setUser(mergedUserData);
      localStorage.setItem('user', JSON.stringify(mergedUserData));
      console.log('User data updated successfully', mergedUserData);
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update user data');
    }
  };

  /**
   * Safely fetch user data from the server
   * This will use cached data if the server request fails
   */
  const fetchUserData = async (forceRefresh = false) => {
    const savedUser = localStorage.getItem('user');
    const hasLocalUser = !!savedUser;
    let userObj = null;

    if (hasLocalUser) {
      try {
        userObj = JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }

    // If we have cached user data and don't need to force refresh, return it
    if (userObj && !forceRefresh) {
      return { success: true, user: userObj, source: 'cache' };
    }

    try {
      // Try to refresh token first to ensure we have a valid token
      await refreshToken();

      // Now fetch user data with the refreshed token
      const response = await authApi.current.get('/api/auth/user');
      const userData = response.data;

      if (!userData) {
        throw new Error('Invalid user data received');
      }

      // Merge with existing data if available
      const mergedData = userObj ? { ...userObj, ...userData } : userData;

      // Update local storage and state
      localStorage.setItem('user', JSON.stringify(mergedData));
      setUser(mergedData);
      setIsAuthenticated(true);

      return { success: true, user: mergedData, source: 'server' };
    } catch (err) {
      console.warn('Failed to fetch user data:', err.message);

      // If we have cached data, use it and don't log out
      if (userObj) {
        console.log('Using cached user data due to fetch error');
        setUser(userObj);
        setIsAuthenticated(true);
        return { success: true, user: userObj, source: 'cache', error: err.message };
      }

      // If no cached data and server auth failed, we need to log out
      if (err.response?.status === 401) {
        clearAuth();
      }

      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    token: localStorage.getItem('token'),
    isAuthenticated,
    loading,
    error,
    login,
    registerUser,
    logout,
    updateUser,
    setError,
    clearAuth,
    softClearAuth,
    refreshToken, // Expose the refresh token function
    fetchUserData, // Expose the user data fetching function
    api: authApi.current // Expose the axios instance if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};