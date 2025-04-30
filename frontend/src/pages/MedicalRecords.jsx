import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Close as CloseIcon,
  Description as FileIcon,
  LocalHospital as MedicalIcon,
  DateRange as DateIcon,
  Person as DoctorIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const MedicalRecords = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [recordForm, setRecordForm] = useState({
    title: '',
    date: '',
    doctorName: '',
    description: '',
    recordType: 'Visit'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);

  // Fetch medical records on component mount
  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  // Fetch medical records from API
  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from the actual API
      // const response = await axios.get(`http://localhost:8080/api/medical-records`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      // setRecords(response.data);
      
      
      setTimeout(() => {
        setRecords([
          {
            id: 1,
            title: 'Annual Physical Examination',
            date: '2023-09-15',
            doctorName: 'Dr. Sarah Johnson',
            description: 'Regular physical check-up. Blood pressure: 120/80, Cholesterol levels normal. Recommended increased physical activity.',
            recordType: 'Visit'
          },
          {
            id: 2,
            title: 'Blood Test Results',
            date: '2023-08-22',
            doctorName: 'Dr. Michael Chen',
            description: 'Complete blood count and metabolic panel. All results within normal range.',
            recordType: 'Lab Test'
          },
          {
            id: 3,
            title: 'Vaccination - Flu Shot',
            date: '2023-10-05',
            doctorName: 'Dr. Emily Parker',
            description: 'Annual influenza vaccination administered.',
            recordType: 'Immunization'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError('Failed to load medical records. Please try again later.');
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRecordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open dialog to add new record
  const handleAddRecord = () => {
    setRecordForm({
      title: '',
      date: '',
      doctorName: '',
      description: '',
      recordType: 'Visit'
    });
    setEditMode(false);
    setCurrentRecordId(null);
    setOpenDialog(true);
  };

  // Open dialog to edit existing record
  const handleEditRecord = (record) => {
    setRecordForm({
      title: record.title,
      date: record.date,
      doctorName: record.doctorName,
      description: record.description,
      recordType: record.recordType
    });
    setEditMode(true);
    setCurrentRecordId(record.id);
    setOpenDialog(true);
  };

  // Delete a medical record
  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        // In a real app, you would delete through the actual API
        // await axios.delete(`http://localhost:8080/api/medical-records/${id}`, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        
        // For demo 
        setRecords(records.filter(record => record.id !== id));
      } catch (err) {
        console.error('Error deleting record:', err);
        setError('Failed to delete record. Please try again.');
      }
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Submit form to add/edit record
  const handleSubmit = async () => {
    // Validate form
    if (!recordForm.title || !recordForm.date || !recordForm.doctorName) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (editMode) {
        // In a real app, you would update through the actual API
        // await axios.put(`http://localhost:8080/api/medical-records/${currentRecordId}`, recordForm, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        
        // For demo 
        setRecords(records.map(record => 
          record.id === currentRecordId ? { ...record, ...recordForm } : record
        ));
      } else {
        // In a real app, you would create through the actual API
        // const response = await axios.post(`http://localhost:8080/api/medical-records`, recordForm, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        // const newRecord = response.data;
        
        // For demo 
        const newRecord = {
          id: Math.max(0, ...records.map(r => r.id)) + 1,
          ...recordForm
        };
        setRecords([...records, newRecord]);
      }
      
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving record:', err);
      setError('Failed to save record. Please try again.');
    }
  };

  const getRecordTypeColor = (type) => {
    switch (type) {
      case 'Visit': return 'primary';
      case 'Lab Test': return 'secondary';
      case 'Prescription': return 'error';
      case 'Immunization': return 'success';
      case 'Surgery': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Medical Records
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddRecord}
        >
          Add Record
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : records.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No medical records found. Click "Add Record" to create your first record.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {records.map((record) => (
            <Grid item xs={12} md={6} key={record.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" alignItems="center" mb={1}>
                    <FileIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{record.title}</Typography>
                  </Box>
                  <Chip 
                    label={record.recordType} 
                    color={getRecordTypeColor(record.recordType)} 
                    size="small" 
                  />
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <List dense>
                  <ListItem>
                    <DateIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary="Date" 
                      secondary={new Date(record.date).toLocaleDateString()} 
                    />
                  </ListItem>
                  <ListItem>
                    <DoctorIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary="Doctor" 
                      secondary={record.doctorName} 
                    />
                  </ListItem>
                  <ListItem>
                    <MedicalIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary="Description" 
                      secondary={record.description} 
                    />
                  </ListItem>
                </List>
                
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditRecord(record)} 
                    aria-label="edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteRecord(record.id)} 
                    aria-label="delete"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Record Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editMode ? 'Edit Medical Record' : 'Add Medical Record'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            value={recordForm.title}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            value={recordForm.date}
            onChange={handleFormChange}
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            name="doctorName"
            label="Doctor Name"
            fullWidth
            value={recordForm.doctorName}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            name="recordType"
            label="Record Type"
            select
            fullWidth
            value={recordForm.recordType}
            onChange={handleFormChange}
          >
            {['Visit', 'Lab Test', 'Prescription', 'Immunization', 'Surgery', 'Other'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            value={recordForm.description}
            onChange={handleFormChange}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MedicalRecords; 