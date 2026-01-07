import React from 'react';
import {
  Box,
  Alert,
  LinearProgress,
  Typography,
} from '@mui/material';
import { AutoFixHigh } from '@mui/icons-material';

const RefinementBanner = ({ progress, isComplete }) => {
  if (isComplete || !progress) {
    return null;
  }

  const { total, processed } = progress;
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <Alert 
      severity="info" 
      icon={<AutoFixHigh />}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Refining moments... ({processed}/{total} completed)
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          sx={{ height: 8, borderRadius: 4, mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          You can copy moments now, but refinement will improve timestamp accuracy
        </Typography>
      </Box>
    </Alert>
  );
};

export default RefinementBanner;

