import React from 'react';
import { Paper, Box, Typography, Button, CircularProgress } from '@mui/material';
import StatusBadge from '../common/StatusBadge';

const ProcessingStatusCard = ({
  title,
  icon,
  status = 'pending',
  statusLabel,
  actionLabel,
  onAction,
  disabled = false,
  count = null,
}) => {
  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          color: isComplete ? 'success.main' : isProcessing ? 'primary.main' : 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          fontSize: 40,
        }}
      >
        {icon}
      </Box>

      {/* Title and Status */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusBadge
            status={status}
            label={statusLabel}
            size="small"
          />
          {count !== null && count > 0 && (
            <Typography variant="body2" color="text.secondary">
              ({count})
            </Typography>
          )}
          {isProcessing && (
            <CircularProgress size={16} sx={{ ml: 1 }} />
          )}
        </Box>
      </Box>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant="outlined"
          size="small"
          onClick={onAction}
          disabled={disabled || isProcessing}
          sx={{ minWidth: 120 }}
        >
          {isProcessing ? 'Processing...' : actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default ProcessingStatusCard;
