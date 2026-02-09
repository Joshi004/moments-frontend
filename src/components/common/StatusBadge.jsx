import React from 'react';
import { Chip } from '@mui/material';

const StatusBadge = ({ status, label, size = 'small' }) => {
  // Map status to color and default label
  const getStatusConfig = () => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'success':
      case 'completed':
        return { color: 'success', defaultLabel: 'Completed' };
      case 'processing':
      case 'running':
        return { color: 'info', defaultLabel: 'Processing' };
      case 'warning':
        return { color: 'warning', defaultLabel: 'Warning' };
      case 'error':
      case 'failed':
        return { color: 'error', defaultLabel: 'Error' };
      case 'pending':
      default:
        return { color: 'default', defaultLabel: 'Pending' };
    }
  };

  const { color, defaultLabel } = getStatusConfig();
  const displayLabel = label || defaultLabel;

  return (
    <Chip
      label={displayLabel}
      color={color}
      size={size}
    />
  );
};

export default StatusBadge;
