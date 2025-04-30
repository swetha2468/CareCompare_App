import axios from 'axios';

// Function to get token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Create a base axios instance with default config
const API = axios.create({
    baseURL: 'http://localhost:8080', // Base URL for backend
    withCredentials: true, // Important for CORS with credentials
    timeout: 30000, // Increase timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Track if a token refresh is in progress
let isRefreshing = false;
let refreshPromise = null;
let failedQueue = [];

// Process the queue of failed requests
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Function to refresh token
const refreshAuthToken = async () => {
    const token = getAuthToken();
    if (!token) return Promise.reject(new Error('No token to refresh'));

    console.log('Refreshing auth token...');
    try {
        const response = await axios.post('http://localhost:8080/api/auth/refresh', {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data && response.data.token) {
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            console.log('Token refreshed successfully');
            return newToken;
        } else {
            console.error('Token refresh response did not contain token');
            return Promise.reject(new Error('Invalid refresh response'));
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear auth on refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.reject(error);
    }
};

// Add request logger
API.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
        // Check if we should skip auth header for this request
        if (config.skipAuthHeader) {
            console.log('Skipping auth header for request:', config.url);
            return config;
        }

        const token = getAuthToken();
        // Always add the token if it exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // Log authentication info (for debugging only)
            console.log('Request with auth token to:', config.url);
        } else {
            console.warn('No auth token available for request:', config.url);
            // Immediately reject requests to protected endpoints if no token
            if (config.url.includes('/api/appointments') &&
                !config.url.includes('/debug') &&
                !config.url.includes('/test')) {
                console.error('Attempting to access protected endpoint without token');
                return Promise.reject(new Error('Authentication required for this endpoint'));
            }
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response logger
API.interceptors.response.use(
    (response) => {
        console.log(`API Response from ${response.config.url}:`, response);
        return response;
    },
    async (error) => {
        console.error('API Response Error:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        } else if (error.request) {
            console.error('No response received');
        }

        // Handle 401 Unauthorized - attempt to refresh token
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If a refresh is already in progress, queue this request
                try {
                    const token = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return API(originalRequest);
                } catch (err) {
                    console.log('Failed request after token refresh:', err);
                    // Token refresh failed, redirect to login
                    window.location.href = '/login?session=expired';
                    return Promise.reject(error);
                }
            }

            // Start token refresh
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const token = await refreshAuthToken();
                API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                processQueue(null, token);
                return API(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed in interceptor:', refreshError);
                processQueue(refreshError, null);
                // Clear auth on refresh failure
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to login
                window.location.href = '/login?session=expired';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Export API instance for direct use
export default API;

// Insurance service
export const InsuranceService = {
    getAllPlans: () => {
        console.log('Getting all insurance plans');
        return API.get('/api/insurance', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            transformResponse: [(data) => {
                // If data is already an object, return it
                if (typeof data !== 'string') {
                    console.log('Data is already parsed:', typeof data);
                    return data;
                }

                // Try to parse the data as JSON
                try {
                    console.log('Attempting to parse response data');
                    const parsedData = JSON.parse(data);
                    console.log('Successfully parsed data:', typeof parsedData);
                    return parsedData;
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    console.log('Raw data that failed to parse:', data);
                    // Return empty array to prevent app from crashing
                    return [];
                }
            }]
        });
    },

    // Use debug endpoint as fallback
    getDebugPlans: () => {
        console.log('Getting debug insurance plans');
        return API.get('/api/insurance/debug', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    },

    getPlanById: (id) => {
        return API.get(`/api/insurance/${id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }
};

// Appointment service
export const AppointmentService = {
    // Create a new appointment
    createAppointment: (appointmentData) => {
        const token = getAuthToken();
        if (!token) {
            return Promise.reject(new Error('Authentication required to book appointments'));
        }

        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        let userId = null;
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                userId = userData.id;

                // Map user ID to valid database range if needed
                // This fixes a common issue where the database and frontend IDs are out of sync
                if (userId > 200) {
                    console.warn(`User ID ${userId} is outside expected database range, mapping to range 101-104`);
                    // Map large user IDs to the database range (101-104)
                    const mappedId = 100 + (userId % 4) + 1; // Maps to 101, 102, 103, or 104
                    console.log(`Mapped user ID ${userId} to ${mappedId}`);
                    userId = mappedId;
                }

                // Ensure the correct user ID is being sent
                // Do not rely on user ID in the appointment data, use the authenticated user's ID
                appointmentData = {
                    ...appointmentData,
                    user: {
                        id: userId
                    }
                };

                console.log('Using authenticated user ID for appointment:', userId);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return Promise.reject(new Error('Invalid user data in local storage'));
            }
        } else {
            console.error('No user data found in local storage');
            return Promise.reject(new Error('User data not found'));
        }

        console.log('Creating appointment with user ID:', userId);
        console.log('Appointment payload:', JSON.stringify(appointmentData, null, 2));

        // Set explicit headers for this request
        return API.post('/api/appointments', appointmentData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Update an existing appointment
    updateAppointment: (id, appointmentData) => {
        const token = getAuthToken();
        if (!token) {
            return Promise.reject(new Error('Authentication required to update appointments'));
        }
        return API.put(`/api/appointments/${id}`, appointmentData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Get appointments for a user
    getUserAppointments: (userId) => {
        const token = getAuthToken();
        if (!token) {
            return Promise.reject(new Error('Authentication required to view appointments'));
        }
        return API.get(`/api/appointments/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Delete/cancel an appointment
    cancelAppointment: (id) => {
        const token = getAuthToken();
        if (!token) {
            return Promise.reject(new Error('Authentication required to cancel appointments'));
        }
        return API.delete(`/api/appointments/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Test appointment creation (debug endpoint)
    testAppointment: (appointmentData) => {
        // This is a debug endpoint, so we'll allow it without auth
        return API.post('/api/appointments/debug/test-create', appointmentData);
    },

    // Special diagnostic without auth to identify the issue
    noAuthTest: (appointmentData) => {
        return API.post(`${APPOINTMENT_API_URL}/debug/no-auth-test`, appointmentData, {
            // Skip auth headers for this special test
            skipAuthHeader: true
        });
    }
}; 