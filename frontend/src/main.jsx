import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

// Force pre-loading of critical dependencies
// This helps avoid 504 errors when optimizing dependencies
import '@mui/material/styles'
import '@mui/material/Button'

// Set default axios options for API calls
axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.withCredentials = true

// Optionally add an interceptor to log request/response for debugging
axios.interceptors.request.use(
  config => {
    console.log('Axios Request:', config);
    return config;
  },
  error => {
    console.error('Axios Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log('Axios Response:', response);
    return response;
  },
  error => {
    console.error('Axios Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
