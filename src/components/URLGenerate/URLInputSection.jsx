import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Link as LinkIcon,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';

// localStorage helpers for recent URLs
const RECENT_URLS_KEY = 'videoMoments_recentUrls';
const MAX_RECENT_URLS = 5;

const getRecentUrls = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_URLS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const addRecentUrl = (url) => {
  try {
    const urls = getRecentUrls().filter(u => u !== url);
    urls.unshift(url);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(urls.slice(0, MAX_RECENT_URLS)));
  } catch {
    // ignore localStorage errors (private browsing)
  }
};

const validateUrl = (urlString) => {
  if (!urlString.trim()) {
    return null; // empty is neutral, not an error
  }

  try {
    const urlObj = new URL(urlString);
    const scheme = urlObj.protocol.replace(':', '');

    if (!['http', 'https', 'gs'].includes(scheme)) {
      return 'Unsupported URL scheme. Use http://, https://, or gs://';
    }

    if (scheme === 'gs' && !urlObj.hostname) {
      return 'GCS URI must specify bucket: gs://bucket/path';
    }

    if (!urlObj.pathname || urlObj.pathname === '/') {
      return 'URL must include a file path';
    }

    return null; // valid
  } catch (e) {
    return 'Invalid URL format';
  }
};

export const generateTitlePreview = (url) => {
  try {
    const pathname = new URL(url).pathname;
    const stem = decodeURIComponent(pathname.split('/').pop().replace(/\.[^.]+$/, ''));
    return stem.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  } catch {
    return '';
  }
};

const URLInputSection = ({ url, onUrlChange, title, onTitleChange, forceDownload, onForceDownloadChange, disabled, error }) => {
  const [validationError, setValidationError] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const recentUrls = getRecentUrls();

  const handlePaste = (e) => {
    // Auto-trim whitespace on paste
    setTimeout(() => {
      const trimmedValue = e.target.value.trim();
      if (trimmedValue !== e.target.value) {
        onUrlChange(trimmedValue);
      }
    }, 0);
  };

  const handleBlur = () => {
    const validationResult = validateUrl(url);
    setValidationError(validationResult);
    setIsValid(url.trim() ? validationResult === null : null);
  };

  const handleChange = (value) => {
    onUrlChange(value);
    // Reset validation state when user types
    if (validationError || isValid !== null) {
      setValidationError(null);
      setIsValid(null);
    }
  };

  const handleRecentUrlClick = (recentUrl) => {
    onUrlChange(recentUrl);
    setIsValid(true);
    setValidationError(null);
  };

  const displayError = error || validationError;

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
        onChange={(e) => handleChange(e.target.value)}
        onPaste={handlePaste}
        onBlur={handleBlur}
        disabled={disabled}
        error={!!displayError}
        helperText={displayError || 'Supports HTTP, HTTPS, and GCS (gs://) URLs'}
        variant="outlined"
        InputProps={{
          endAdornment: isValid !== null && (
            <InputAdornment position="end">
              {isValid ? (
                <CheckCircle color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiInputBase-input': {
            height: '48px',
            padding: '0 14px',
          },
        }}
      />

      <TextField
        fullWidth
        label="Video Title"
        placeholder="Auto-generated from URL if left blank"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        disabled={disabled}
        variant="outlined"
        inputProps={{ maxLength: 500 }}
        helperText="Optional — edit to override the auto-generated title"
        sx={{ mb: 2 }}
      />

      {/* Recent URLs */}
      {!disabled && recentUrls.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Recently used URLs:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {recentUrls.map((recentUrl, index) => (
              <Chip
                key={index}
                label={recentUrl.length > 50 ? `${recentUrl.substring(0, 47)}...` : recentUrl}
                onClick={() => handleRecentUrlClick(recentUrl)}
                size="small"
                variant="outlined"
                clickable
                sx={{ maxWidth: '100%' }}
              />
            ))}
          </Box>
        </Box>
      )}

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


