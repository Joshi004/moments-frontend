import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';

const URLInputSection = ({ url, onUrlChange, forceDownload, onForceDownloadChange, disabled, error }) => {
  const handlePaste = (e) => {
    // Auto-trim whitespace on paste
    setTimeout(() => {
      const trimmedValue = e.target.value.trim();
      if (trimmedValue !== e.target.value) {
        onUrlChange(trimmedValue);
      }
    }, 0);
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LinkIcon color="primary" />
        <Typography variant="h6">Video URL</Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Paste video URL here..."
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onPaste={handlePaste}
        disabled={disabled}
        error={!!error}
        helperText={error || 'Supported: HTTP/HTTPS URLs, Google Cloud Storage (gs://)'}
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiInputBase-input': {
            height: '48px',
            padding: '0 14px',
          },
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={forceDownload}
              onChange={(e) => onForceDownloadChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label="Force re-download (ignore cached version)"
        />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
          Check this to download the video again even if it was previously cached
        </Typography>
      </Box>
    </Paper>
  );
};

export default URLInputSection;


