import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Policy } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form validation and state
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(authError);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'policy'

  // Check if user was redirected to login
  const from = location.state?.from?.pathname || '/dashboard';

  // Handle login method change
  const handleLoginMethodChange = (event, newValue) => {
    setLoginMethod(newValue);
    reset();
    setLoginError(null);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError(null);

    try {
      let result;

      if (loginMethod === 'email') {
        // Traditional email login
        result = await login(data.email, data.password);
      } else {
        // Policy number login
        result = await login(data.policyNumber, data.password, true);
      }

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setLoginError(result.error);
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '50%',
            p: 1,
            mb: 1
          }}>
            <LoginIcon />
          </Box>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          {loginError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {loginError}
            </Alert>
          )}

          {location.state?.from && (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              Please log in to access that page.
            </Alert>
          )}

          <Tabs
            value={loginMethod}
            onChange={handleLoginMethodChange}
            sx={{ width: '100%', mb: 2 }}
            variant="fullWidth"
          >
            <Tab
              value="email"
              label="Login with Email"
              icon={<LoginIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              value="policy"
              label="Login with Policy Number"
              icon={<Policy fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            {loginMethod === 'email' ? (
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                id="policyNumber"
                label="Policy Number"
                name="policyNumber"
                autoComplete="off"
                autoFocus
                error={!!errors.policyNumber}
                helperText={errors.policyNumber?.message}
                {...register('policyNumber', {
                  required: 'Policy number is required',
                })}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register("password", {
                required: "Password is required"
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
              <FormControlLabel
                control={<Checkbox {...register("remember")} color="primary" />}
                label="Remember me"
              />
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 600 }}>
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 