import React from 'react';
import { Box, Typography } from '@mui/material';

const VideoCaptions = ({ text, enabled, isFullscreen = false }) => {
  if (!enabled || !text) {
    return null;
  }

  // Adjust bottom offset based on fullscreen state
  // Normal mode: 160px (well above controls)
  // Fullscreen mode: 10% from bottom (percentage-based for better scaling)
  const bottomOffset = isFullscreen ? '10%' : '160px';
  const zIndexValue = isFullscreen ? 2147483647 : 4; // Use max z-index in fullscreen to ensure visibility

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: bottomOffset,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '80%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        zIndex: zIndexValue,
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease-in-out, bottom 0.3s ease-in-out',
        opacity: enabled && text ? 1 : 0,
      }}
    >
      <Typography
        sx={{
          fontSize: '16px',
          lineHeight: 1.4,
          textAlign: 'center',
          fontWeight: 400,
          '@media (max-width: 600px)': {
            fontSize: '14px',
          },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default VideoCaptions;

