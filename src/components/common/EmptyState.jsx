import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';

const EmptyState = ({ 
  icon, 
  title, 
  message, 
  description, // Alias for message
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const theme = useTheme();
  const displayMessage = message || description;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      {icon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            mb: 3,
          }}
        >
          <Box
            sx={{
              fontSize: 80,
              color: theme.palette.action.disabled,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      )}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {displayMessage}
      </Typography>
      {(actionLabel || secondaryActionLabel) && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {actionLabel && onAction && (
            <Button variant="contained" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outlined" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
