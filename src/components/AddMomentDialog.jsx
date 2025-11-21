import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';

const AddMomentDialog = ({ open, onClose, onSave, videoDuration }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};

    // Validate start time
    const start = parseFloat(startTime);
    if (isNaN(start) || start < 0) {
      newErrors.startTime = 'Start time must be a number >= 0';
    }

    // Validate end time
    const end = parseFloat(endTime);
    if (isNaN(end)) {
      newErrors.endTime = 'End time must be a number';
    } else if (end <= start) {
      newErrors.endTime = 'End time must be greater than start time';
    } else if (end > videoDuration) {
      newErrors.endTime = `End time must be <= video duration (${videoDuration.toFixed(2)}s)`;
    }

    // Validate duration (≤ 2 minutes = 120 seconds)
    if (!isNaN(start) && !isNaN(end)) {
      const duration = end - start;
      if (duration > 120) {
        newErrors.duration = 'Moment duration must be ≤ 120 seconds (2 minutes)';
      }
    }

    // Validate title
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setSubmitError('');
    
    if (!validate()) {
      return;
    }

    try {
      await onSave({
        start_time: parseFloat(startTime),
        end_time: parseFloat(endTime),
        title: title.trim(),
      });
      
      // Reset form
      setStartTime('');
      setEndTime('');
      setTitle('');
      setErrors({});
      setSubmitError('');
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to add moment';
      setSubmitError(errorMessage);
    }
  };

  const handleClose = () => {
    setStartTime('');
    setEndTime('');
    setTitle('');
    setErrors({});
    setSubmitError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Moment</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {submitError && (
            <Alert severity="error">{submitError}</Alert>
          )}
          
          <TextField
            label="Start Time (seconds)"
            type="number"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            error={!!errors.startTime}
            helperText={errors.startTime || 'Enter start time in seconds'}
            fullWidth
            inputProps={{ step: 0.1, min: 0 }}
          />

          <TextField
            label="End Time (seconds)"
            type="number"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            error={!!errors.endTime}
            helperText={errors.endTime || 'Enter end time in seconds'}
            fullWidth
            inputProps={{ step: 0.1, min: 0 }}
          />

          {errors.duration && (
            <Alert severity="error">{errors.duration}</Alert>
          )}

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title || 'Enter a title for this moment'}
            fullWidth
            required
          />

          {!isNaN(parseFloat(startTime)) && !isNaN(parseFloat(endTime)) && (
            <Typography variant="body2" color="text.secondary">
              Duration: {(parseFloat(endTime) - parseFloat(startTime)).toFixed(2)} seconds
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Add Moment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMomentDialog;

